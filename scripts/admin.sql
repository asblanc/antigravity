-- ============================================================================
-- IBC — Dashboard Admin (RPC d'administration)
-- ----------------------------------------------------------------------------
-- Script IDEMPOTENT à exécuter dans le SQL Editor de Supabase.
-- Dépend de public.is_admin() (scripts/security_hardening.sql).
-- Toutes les écritures privilégiées passent par ces RPC SECURITY DEFINER,
-- réservées aux admins (les GRANT colonne bloquent l'écriture directe client).
-- ============================================================================

-- ─── KPIs de la vue d'ensemble ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_overview()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Réservé aux administrateurs';
  END IF;

  SELECT json_build_object(
    'members_total',         (SELECT count(*) FROM profiles WHERE role = 'member'),
    'members_active',        (SELECT count(*) FROM profiles WHERE role = 'member' AND active),
    'members_by_tier',       (SELECT COALESCE(json_object_agg(tier, c), '{}'::json)
                                FROM (SELECT tier, count(*) c FROM profiles WHERE role = 'member' GROUP BY tier) t),
    'partners_total',        (SELECT count(*) FROM profiles WHERE role = 'partner'),
    'establishments_total',  (SELECT count(*) FROM establishments),
    'establishments_pending',(SELECT count(*) FROM establishments WHERE NOT active),
    'tx_total',              (SELECT count(*) FROM transactions),
    'tx_pending',            (SELECT count(*) FROM transactions WHERE status = 'pending'),
    'tx_volume',             (SELECT COALESCE(sum(amount), 0) FROM transactions WHERE status = 'confirmed'),
    'cashback_distributed',  (SELECT COALESCE(sum(cashback_earned), 0) FROM transactions WHERE status = 'confirmed')
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_overview() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_overview() TO authenticated;

-- ─── Gestion des membres ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_set_member_active(p_member_id UUID, p_active BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  UPDATE public.profiles SET active = p_active WHERE id = p_member_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_member_active(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_member_active(UUID, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_member_tier(p_member_id UUID, p_tier TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  IF p_tier NOT IN ('bronze', 'silver', 'gold', 'platinum') THEN
    RAISE EXCEPTION 'Tier invalide';
  END IF;
  UPDATE public.profiles SET tier = p_tier WHERE id = p_member_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_member_tier(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_member_tier(UUID, TEXT) TO authenticated;

-- Crédit (montant positif) ou débit (montant négatif) de la cagnotte d'un membre.
CREATE OR REPLACE FUNCTION public.admin_adjust_member_balance(p_member_id UUID, p_amount NUMERIC)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  UPDATE public.profiles
     SET balance = GREATEST(0, COALESCE(balance, 0) + p_amount)
   WHERE id = p_member_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_adjust_member_balance(UUID, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_adjust_member_balance(UUID, NUMERIC) TO authenticated;

-- ─── Gestion des établissements ─────────────────────────────────────────────
-- Approbation/suspension + ajustement du taux de cashback.
DROP FUNCTION IF EXISTS public.admin_update_establishment(UUID, BOOLEAN, NUMERIC);
CREATE OR REPLACE FUNCTION public.admin_update_establishment(
  p_establishment_id UUID,
  p_active           BOOLEAN,
  p_cashback_rate    NUMERIC,
  p_image_url        TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  UPDATE public.establishments
     SET active = COALESCE(p_active, active),
         cashback_rate = COALESCE(p_cashback_rate, cashback_rate),
         image_url = COALESCE(p_image_url, image_url)
   WHERE id = p_establishment_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_update_establishment(UUID, BOOLEAN, NUMERIC, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_update_establishment(UUID, BOOLEAN, NUMERIC, TEXT) TO authenticated;

-- ─── Validation des transactions (workflow pending → confirmed/rejected) ─────
-- Ajuste le solde du membre de façon cohérente selon la transition de statut.
CREATE OR REPLACE FUNCTION public.admin_review_transaction(p_tx_id UUID, p_status TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_old     TEXT;
  v_member  UUID;
  v_cash    NUMERIC;
  v_amount  NUMERIC;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  IF p_status NOT IN ('pending', 'confirmed', 'rejected') THEN
    RAISE EXCEPTION 'Statut invalide';
  END IF;

  SELECT status, member_id, cashback_earned, amount
    INTO v_old, v_member, v_cash, v_amount
  FROM public.transactions WHERE id = p_tx_id;

  IF v_old IS NULL THEN RAISE EXCEPTION 'Transaction introuvable'; END IF;
  IF v_old = p_status THEN RETURN; END IF;

  -- Sortie de l'état confirmé → on retire le cashback du solde.
  IF v_old = 'confirmed' AND p_status <> 'confirmed' THEN
    UPDATE public.profiles
       SET balance = GREATEST(0, COALESCE(balance, 0) - v_cash),
           total_spent = GREATEST(0, COALESCE(total_spent, 0) - v_amount)
     WHERE id = v_member;
  END IF;

  -- Passage à confirmé → on crédite le cashback.
  IF v_old <> 'confirmed' AND p_status = 'confirmed' THEN
    UPDATE public.profiles
       SET balance = COALESCE(balance, 0) + v_cash,
           total_spent = COALESCE(total_spent, 0) + v_amount
     WHERE id = v_member;
  END IF;

  UPDATE public.transactions SET status = p_status WHERE id = p_tx_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_review_transaction(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_transaction(UUID, TEXT) TO authenticated;

-- ============================================================================
-- FIN
-- ============================================================================
