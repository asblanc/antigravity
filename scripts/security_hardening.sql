-- ============================================================================
-- IBC — Durcissement Sécurité (RLS / Privilèges / RPC)
-- ----------------------------------------------------------------------------
-- Script IDEMPOTENT à exécuter sur la base Supabase EXISTANTE
-- (SQL Editor du dashboard Supabase, ou `supabase db execute`).
--
-- Corrige :
--   1. Élévation de privilèges via UPDATE profiles (role/balance/tier/points)
--   2. Auto-attribution du rôle 'admin' à l'inscription (metadata client)
--   3. Mutations privilégiées du solde côté client -> RPC SECURITY DEFINER
--   4. Lecture de TOUS les profils par un partenaire (validation QR) -> RPC
--   5. Policies admin/partenaire manquantes (lecture dashboards)
-- ============================================================================

-- ─── 0. Helper : l'appelant est-il admin ? ──────────────────────────────────
-- SECURITY DEFINER => contourne la RLS (pas de récursion sur profiles)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================================
-- 1. PROFILES — empêcher l'élévation de privilèges
-- ============================================================================

-- 1a. Privilèges colonne : un membre ne peut écrire QUE des champs non sensibles.
--     role / balance / tier / points / total_spent / active restent inaccessibles
--     en écriture directe (réservés aux RPC SECURITY DEFINER / service_role).
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;
GRANT UPDATE (name, whatsapp, photo_url, payment_method, company_name)
  ON public.profiles TO authenticated;

-- 1b. Policies (rejouables)
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil"  ON public.profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON public.profiles;
DROP POLICY IF EXISTS profiles_select_own    ON public.profiles;
DROP POLICY IF EXISTS profiles_select_admin  ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own    ON public.profiles;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_select_admin ON public.profiles
  FOR SELECT USING (public.is_admin());

-- L'UPDATE est borné aux lignes de l'utilisateur ; les colonnes sensibles sont
-- déjà bloquées par les privilèges colonne ci-dessus (défense en profondeur).
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 1c. Défense en profondeur : même si un GRANT venait à être rétabli par erreur,
--     ce trigger interdit la modification des champs sensibles hors service_role.
CREATE OR REPLACE FUNCTION public.guard_profile_privileged_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- On ne restreint QUE les rôles atteignables depuis le client (authenticated/anon).
  -- Les fonctions SECURITY DEFINER (exécutées en 'postgres') et service_role passent.
  IF current_user IN ('authenticated', 'anon') AND NOT public.is_admin() THEN
    IF NEW.role        IS DISTINCT FROM OLD.role
    OR NEW.balance     IS DISTINCT FROM OLD.balance
    OR NEW.tier        IS DISTINCT FROM OLD.tier
    OR NEW.points      IS DISTINCT FROM OLD.points
    OR NEW.total_spent IS DISTINCT FROM OLD.total_spent
    OR NEW.active      IS DISTINCT FROM OLD.active THEN
      RAISE EXCEPTION 'Modification de champs privilégiés non autorisée';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profiles_privileged ON public.profiles;
CREATE TRIGGER guard_profiles_privileged
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileged_columns();

-- ============================================================================
-- 2. TRIGGER D'INSCRIPTION — neutraliser l'auto-attribution du rôle 'admin'
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'member');
  safe_role TEXT;
BEGIN
  -- 'admin' ne peut JAMAIS provenir des métadonnées client.
  -- Seuls 'member' et 'partner' sont auto-attribuables à l'inscription.
  IF requested_role = 'partner' THEN
    safe_role := 'partner';
  ELSE
    safe_role := 'member';
  END IF;

  INSERT INTO public.profiles (id, name, email, role, tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    NEW.email,
    safe_role,
    'bronze'  -- le tier n'est jamais défini par le client à l'inscription
  );
  RETURN NEW;
END;
$$;

-- (le trigger on_auth_user_created existant pointe déjà vers cette fonction)

-- ============================================================================
-- 3. ESTABLISHMENTS — lecture publique + gestion partenaire/admin
-- ============================================================================
REVOKE INSERT, UPDATE, DELETE ON public.establishments FROM anon;
REVOKE UPDATE ON public.establishments FROM authenticated;
-- Un partenaire ne modifie que la présentation ; cashback_rate & active = admin.
GRANT UPDATE (name, category, zone, description, image_url)
  ON public.establishments TO authenticated;

DROP POLICY IF EXISTS "Les établissements sont publics"   ON public.establishments;
DROP POLICY IF EXISTS establishments_select_public        ON public.establishments;
DROP POLICY IF EXISTS establishments_select_own           ON public.establishments;
DROP POLICY IF EXISTS establishments_select_admin         ON public.establishments;
DROP POLICY IF EXISTS establishments_insert_own           ON public.establishments;
DROP POLICY IF EXISTS establishments_update_own           ON public.establishments;

CREATE POLICY establishments_select_public ON public.establishments
  FOR SELECT USING (active = true);

CREATE POLICY establishments_select_own ON public.establishments
  FOR SELECT USING (partner_id = auth.uid());

CREATE POLICY establishments_select_admin ON public.establishments
  FOR SELECT USING (public.is_admin());

CREATE POLICY establishments_insert_own ON public.establishments
  FOR INSERT TO authenticated WITH CHECK (partner_id = auth.uid());

CREATE POLICY establishments_update_own ON public.establishments
  FOR UPDATE USING (partner_id = auth.uid()) WITH CHECK (partner_id = auth.uid());

-- ============================================================================
-- 4. TRANSACTIONS — lecture ciblée ; écriture uniquement via RPC
-- ============================================================================
REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.transactions FROM authenticated;

DROP POLICY IF EXISTS "Les membres voient leurs transactions" ON public.transactions;
DROP POLICY IF EXISTS transactions_select_member  ON public.transactions;
DROP POLICY IF EXISTS transactions_select_partner ON public.transactions;
DROP POLICY IF EXISTS transactions_select_admin   ON public.transactions;

CREATE POLICY transactions_select_member ON public.transactions
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY transactions_select_partner ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.establishments e
      WHERE e.id = transactions.establishment_id
        AND e.partner_id = auth.uid()
    )
  );

CREATE POLICY transactions_select_admin ON public.transactions
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- 5. RPC — opérations privilégiées (SECURITY DEFINER)
-- ============================================================================

-- 5a. Enregistrer une transaction + créditer le solde de façon ATOMIQUE.
--     Seul le partenaire propriétaire de l'établissement (ou un admin) peut appeler.
CREATE OR REPLACE FUNCTION public.record_transaction(
  p_member_id        UUID,
  p_establishment_id UUID,
  p_amount           NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner    UUID;
  v_rate     NUMERIC;
  v_cashback NUMERIC;
  v_tx_id    UUID;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Montant invalide';
  END IF;

  SELECT partner_id, cashback_rate
    INTO v_owner, v_rate
  FROM public.establishments
  WHERE id = p_establishment_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Établissement introuvable';
  END IF;

  IF auth.uid() <> v_owner AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Non autorisé à enregistrer cette transaction';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_member_id AND role = 'member') THEN
    RAISE EXCEPTION 'Membre introuvable';
  END IF;

  v_cashback := ROUND(p_amount * (COALESCE(v_rate, 5.0) / 100.0));

  INSERT INTO public.transactions (member_id, establishment_id, amount, cashback_earned, status)
  VALUES (p_member_id, p_establishment_id, p_amount, v_cashback, 'confirmed')
  RETURNING id INTO v_tx_id;

  UPDATE public.profiles
     SET balance     = COALESCE(balance, 0)     + v_cashback,
         total_spent = COALESCE(total_spent, 0) + p_amount
   WHERE id = p_member_id;

  RETURN v_tx_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_transaction(UUID, UUID, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_transaction(UUID, UUID, NUMERIC) TO authenticated;

-- 5b. Validation QR : renvoie le strict nécessaire, sans exposer toute la table.
--     Réservé aux partenaires et admins.
CREATE OR REPLACE FUNCTION public.get_member_card(p_uid UUID)
RETURNS TABLE (id UUID, name TEXT, tier TEXT, balance NUMERIC, active BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role IN ('partner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;

  RETURN QUERY
    SELECT p.id, p.name, p.tier, p.balance, p.active
    FROM public.profiles p
    WHERE p.id = p_uid AND p.role = 'member';
END;
$$;

REVOKE ALL ON FUNCTION public.get_member_card(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_member_card(UUID) TO authenticated;

-- 5c. Approbation d'un établissement par un admin (active / cashback_rate).
CREATE OR REPLACE FUNCTION public.admin_set_establishment_active(
  p_establishment_id UUID,
  p_active           BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Réservé aux administrateurs';
  END IF;

  UPDATE public.establishments
     SET active = p_active
   WHERE id = p_establishment_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_establishment_active(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_establishment_active(UUID, BOOLEAN) TO authenticated;

-- 5d. Finalisation du profil juste après l'inscription (whatsapp, photo, moyen
--     de paiement, qr_code, tier choisi). Autorisée UNE SEULE FOIS (tant que
--     qr_code est vide) → empêche toute ré-escalade du tier par la suite.
CREATE OR REPLACE FUNCTION public.finalize_member_registration(
  p_whatsapp       TEXT,
  p_photo_url      TEXT,
  p_payment_method TEXT,
  p_qr_code        TEXT,
  p_tier           TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
     SET whatsapp       = COALESCE(p_whatsapp, whatsapp),
         photo_url      = COALESCE(p_photo_url, photo_url),
         payment_method = COALESCE(p_payment_method, payment_method),
         qr_code        = p_qr_code,
         tier           = CASE WHEN p_tier IN ('bronze', 'silver', 'gold')
                               THEN p_tier ELSE tier END
   WHERE id = auth.uid()
     AND role = 'member'
     AND (qr_code IS NULL OR qr_code = '');

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil déjà finalisé ou non autorisé';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_member_registration(TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.finalize_member_registration(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ============================================================================
-- FIN — RLS reste activée sur les 3 tables (ALTER TABLE ... ENABLE RLS déjà fait)
-- ============================================================================
