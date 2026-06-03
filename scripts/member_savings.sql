-- ============================================================================
-- IBC — Modules membre : Objectifs (goals) + Épargne (savings_accounts)
-- ----------------------------------------------------------------------------
-- Script IDEMPOTENT à exécuter dans le SQL Editor de Supabase.
-- Dépend de public.is_admin() (scripts/security_hardening.sql).
-- ============================================================================

-- ─── OBJECTIFS (le membre gère librement ses propres objectifs) ─────────────
CREATE TABLE IF NOT EXISTS public.goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  target_amount  NUMERIC NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reached', 'archived')),
  created_at     TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
CREATE INDEX IF NOT EXISTS idx_goals_member ON public.goals(member_id);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
-- Champs non privilégiés : le membre peut gérer ses lignes directement (RLS).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;

DROP POLICY IF EXISTS goals_select_own   ON public.goals;
DROP POLICY IF EXISTS goals_insert_own   ON public.goals;
DROP POLICY IF EXISTS goals_update_own   ON public.goals;
DROP POLICY IF EXISTS goals_delete_own   ON public.goals;
DROP POLICY IF EXISTS goals_select_admin ON public.goals;

CREATE POLICY goals_select_own ON public.goals FOR SELECT USING (member_id = auth.uid());
CREATE POLICY goals_insert_own ON public.goals FOR INSERT TO authenticated WITH CHECK (member_id = auth.uid());
CREATE POLICY goals_update_own ON public.goals FOR UPDATE USING (member_id = auth.uid()) WITH CHECK (member_id = auth.uid());
CREATE POLICY goals_delete_own ON public.goals FOR DELETE USING (member_id = auth.uid());
CREATE POLICY goals_select_admin ON public.goals FOR SELECT USING (public.is_admin());

-- ─── ÉPARGNE (tirelire alimentée depuis la cagnotte cashback) ───────────────
CREATE TABLE IF NOT EXISTS public.savings_accounts (
  member_id  UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance    NUMERIC NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.savings_accounts ENABLE ROW LEVEL SECURITY;
-- Lecture seule côté client ; les mouvements passent par RPC (touchent le solde).
REVOKE INSERT, UPDATE, DELETE ON public.savings_accounts FROM anon, authenticated;

DROP POLICY IF EXISTS savings_select_own   ON public.savings_accounts;
DROP POLICY IF EXISTS savings_select_admin ON public.savings_accounts;
CREATE POLICY savings_select_own   ON public.savings_accounts FOR SELECT USING (member_id = auth.uid());
CREATE POLICY savings_select_admin ON public.savings_accounts FOR SELECT USING (public.is_admin());

-- Dépôt : déplace du cashback (profiles.balance) vers l'épargne (atomique).
CREATE OR REPLACE FUNCTION public.savings_deposit(p_amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_cash NUMERIC; v_new NUMERIC;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Montant invalide'; END IF;

  SELECT balance INTO v_cash FROM public.profiles WHERE id = auth.uid();
  IF v_cash IS NULL THEN RAISE EXCEPTION 'Profil introuvable'; END IF;
  IF p_amount > v_cash THEN RAISE EXCEPTION 'Solde cashback insuffisant'; END IF;

  UPDATE public.profiles SET balance = balance - p_amount WHERE id = auth.uid();

  INSERT INTO public.savings_accounts (member_id, balance, updated_at)
  VALUES (auth.uid(), p_amount, NOW())
  ON CONFLICT (member_id) DO UPDATE
    SET balance = public.savings_accounts.balance + p_amount, updated_at = NOW()
  RETURNING balance INTO v_new;

  RETURN v_new;
END;
$$;
REVOKE ALL ON FUNCTION public.savings_deposit(NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.savings_deposit(NUMERIC) TO authenticated;

-- Retrait : ramène de l'épargne vers le cashback (atomique).
CREATE OR REPLACE FUNCTION public.savings_withdraw(p_amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_sav NUMERIC; v_new NUMERIC;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Montant invalide'; END IF;

  SELECT balance INTO v_sav FROM public.savings_accounts WHERE member_id = auth.uid();
  IF v_sav IS NULL OR p_amount > v_sav THEN RAISE EXCEPTION 'Épargne insuffisante'; END IF;

  UPDATE public.savings_accounts
     SET balance = balance - p_amount, updated_at = NOW()
   WHERE member_id = auth.uid()
  RETURNING balance INTO v_new;

  UPDATE public.profiles SET balance = balance + p_amount WHERE id = auth.uid();

  RETURN v_new;
END;
$$;
REVOKE ALL ON FUNCTION public.savings_withdraw(NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.savings_withdraw(NUMERIC) TO authenticated;

-- ============================================================================
-- FIN
-- ============================================================================
