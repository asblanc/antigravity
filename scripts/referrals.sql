-- ============================================================================
-- IBC — Feature Parrainage (table referrals + RLS + RPC)
-- ----------------------------------------------------------------------------
-- Script IDEMPOTENT à exécuter dans le SQL Editor de Supabase.
-- Dépend de public.is_admin() (défini dans scripts/security_hardening.sql).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- le parrain
  referee_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- le filleul
  referee_name  TEXT,
  referee_email TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active')),
  bonus         NUMERIC NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (referee_id)  -- un filleul n'a qu'un seul parrain
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Écriture uniquement via RPC SECURITY DEFINER (pas d'écriture client directe).
REVOKE INSERT, UPDATE, DELETE ON public.referrals FROM anon, authenticated;

DROP POLICY IF EXISTS referrals_select_referrer ON public.referrals;
DROP POLICY IF EXISTS referrals_select_admin    ON public.referrals;

-- Un parrain voit ses propres filleuls ; un admin voit tout.
CREATE POLICY referrals_select_referrer ON public.referrals
  FOR SELECT USING (referrer_id = auth.uid());

CREATE POLICY referrals_select_admin ON public.referrals
  FOR SELECT USING (public.is_admin());

-- ─── RPC : enregistrer un parrainage à l'inscription du filleul ──────────────
-- Appelée par le filleul juste après son inscription, avec l'id du parrain.
-- SECURITY DEFINER : insère malgré le REVOKE, mais avec des garde-fous stricts.
CREATE OR REPLACE FUNCTION public.record_referral(p_referrer_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name  TEXT;
  v_email TEXT;
BEGIN
  -- Pas d'auto-parrainage, parrain obligatoire et existant.
  IF p_referrer_id IS NULL OR p_referrer_id = auth.uid() THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_referrer_id) THEN
    RETURN;
  END IF;

  -- Infos du filleul (l'appelant authentifié).
  SELECT name, email INTO v_name, v_email
  FROM public.profiles WHERE id = auth.uid();

  -- Le parrain gagne 2 500 FCFA dès que le filleul rejoint le club.
  INSERT INTO public.referrals (referrer_id, referee_id, referee_name, referee_email, status, bonus)
  VALUES (p_referrer_id, auth.uid(), v_name, v_email, 'active', 2500)
  ON CONFLICT (referee_id) DO NOTHING;  -- ignore si le filleul a déjà un parrain
END;
$$;

REVOKE ALL ON FUNCTION public.record_referral(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_referral(UUID) TO authenticated;

-- ============================================================================
-- FIN
-- ============================================================================
