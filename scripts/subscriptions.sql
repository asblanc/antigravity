-- ============================================================================
-- IBC — Abonnements / Adhésions payantes (table subscriptions + RLS + RPC)
-- ----------------------------------------------------------------------------
-- Script IDEMPOTENT à exécuter dans le SQL Editor de Supabase.
-- Dépend de public.is_admin() (scripts/security_hardening.sql).
--
-- Flux : le membre souscrit (status 'pending') -> paiement (PSP à intégrer) ->
--        validation admin -> 'active' + mise à jour du tier/validité du profil.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan           TEXT NOT NULL CHECK (plan IN ('bronze', 'silver', 'gold', 'platinum')),
  amount         NUMERIC NOT NULL DEFAULT 0,          -- FCFA
  payment_method TEXT,                                -- orange | wave | mtn | ...
  payment_ref    TEXT,                                -- référence PSP (rempli plus tard)
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  started_at     TIMESTAMPTZ,
  expires_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_member ON public.subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM anon, authenticated;

DROP POLICY IF EXISTS subscriptions_select_own   ON public.subscriptions;
DROP POLICY IF EXISTS subscriptions_select_admin ON public.subscriptions;

CREATE POLICY subscriptions_select_own ON public.subscriptions
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY subscriptions_select_admin ON public.subscriptions
  FOR SELECT USING (public.is_admin());

-- ─── Tarifs (⚠️ PLACEHOLDER — ajuste selon ta grille réelle) ─────────────────
CREATE OR REPLACE FUNCTION public.plan_price(p_plan TEXT)
RETURNS NUMERIC LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_plan
    WHEN 'bronze'   THEN 500
    WHEN 'silver'   THEN 2000
    WHEN 'gold'     THEN 5000
    WHEN 'platinum' THEN 10000
    ELSE 0
  END;
$$;

-- ─── Souscription par le membre (crée une demande 'pending') ────────────────
-- Le PSP (Orange Money / Wave / MTN) viendra ensuite régler le paiement puis
-- déclencher la validation (webhook ou validation admin).
CREATE OR REPLACE FUNCTION public.subscribe(p_plan TEXT, p_payment_method TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id UUID;
BEGIN
  IF p_plan NOT IN ('bronze', 'silver', 'gold', 'platinum') THEN
    RAISE EXCEPTION 'Plan invalide';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Profil introuvable';
  END IF;

  INSERT INTO public.subscriptions (member_id, plan, amount, payment_method, status)
  VALUES (auth.uid(), p_plan, public.plan_price(p_plan), p_payment_method, 'pending')
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.subscribe(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.subscribe(TEXT, TEXT) TO authenticated;

-- ─── Validation admin (active / annule / expire) ────────────────────────────
-- 'active' : démarre l'abonnement (1 mois), met à jour le tier + active le profil.
CREATE OR REPLACE FUNCTION public.admin_review_subscription(p_id UUID, p_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_member UUID; v_plan TEXT;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  IF p_status NOT IN ('active', 'cancelled', 'expired') THEN RAISE EXCEPTION 'Statut invalide'; END IF;

  SELECT member_id, plan INTO v_member, v_plan FROM public.subscriptions WHERE id = p_id;
  IF v_member IS NULL THEN RAISE EXCEPTION 'Abonnement introuvable'; END IF;

  IF p_status = 'active' THEN
    UPDATE public.subscriptions
       SET status = 'active', started_at = NOW(), expires_at = NOW() + INTERVAL '1 month'
     WHERE id = p_id;
    UPDATE public.profiles SET tier = v_plan, active = true WHERE id = v_member;
  ELSE
    UPDATE public.subscriptions SET status = p_status WHERE id = p_id;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_review_subscription(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_subscription(UUID, TEXT) TO authenticated;

-- ============================================================================
-- FIN
-- ============================================================================
