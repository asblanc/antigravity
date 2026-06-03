-- ============================================================================
-- IBC — Communication (notifications) + Gestion des rôles/admins
-- ----------------------------------------------------------------------------
-- Script IDEMPOTENT à exécuter dans le SQL Editor de Supabase.
-- Dépend de public.is_admin() (scripts/security_hardening.sql).
-- ============================================================================

-- ─── NOTIFICATIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  audience   TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'members', 'partners', 'admins')),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.notifications FROM anon, authenticated;

DROP POLICY IF EXISTS notifications_select ON public.notifications;

-- Chaque utilisateur voit les notifications dont l'audience le concerne.
CREATE POLICY notifications_select ON public.notifications
  FOR SELECT USING (
    public.is_admin()  -- l'admin voit tout (pour la gestion)
    OR audience = 'all'
    OR (audience = 'members'  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'member'))
    OR (audience = 'partners' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'partner'))
    OR (audience = 'admins'   AND public.is_admin())
  );

-- Envoi d'une notification (admin uniquement).
CREATE OR REPLACE FUNCTION public.admin_send_notification(p_title TEXT, p_body TEXT, p_audience TEXT)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id UUID;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  IF p_audience NOT IN ('all', 'members', 'partners', 'admins') THEN RAISE EXCEPTION 'Audience invalide'; END IF;
  IF COALESCE(TRIM(p_title), '') = '' OR COALESCE(TRIM(p_body), '') = '' THEN
    RAISE EXCEPTION 'Titre et message obligatoires';
  END IF;

  INSERT INTO public.notifications (title, body, audience, created_by)
  VALUES (p_title, p_body, p_audience, auth.uid())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_send_notification(TEXT, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_send_notification(TEXT, TEXT, TEXT) TO authenticated;

-- Suppression d'une notification (admin).
CREATE OR REPLACE FUNCTION public.admin_delete_notification(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  DELETE FROM public.notifications WHERE id = p_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_delete_notification(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_notification(UUID) TO authenticated;

-- ─── GESTION DES RÔLES / ADMINS ─────────────────────────────────────────────
-- Promotion/rétrogradation depuis l'UI (admin). Un admin ne peut pas changer
-- son propre rôle (anti auto-lockout).
CREATE OR REPLACE FUNCTION public.admin_set_role(p_user_id UUID, p_role TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  IF p_role NOT IN ('member', 'partner', 'admin') THEN RAISE EXCEPTION 'Rôle invalide'; END IF;
  IF p_user_id = auth.uid() THEN RAISE EXCEPTION 'Vous ne pouvez pas modifier votre propre rôle'; END IF;
  UPDATE public.profiles SET role = p_role WHERE id = p_user_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_role(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_role(UUID, TEXT) TO authenticated;

-- Promotion par e-mail (pratique pour désigner un admin sans connaître son UID).
CREATE OR REPLACE FUNCTION public.admin_set_role_by_email(p_email TEXT, p_role TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_id UUID;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  IF p_role NOT IN ('member', 'partner', 'admin') THEN RAISE EXCEPTION 'Rôle invalide'; END IF;
  SELECT id INTO v_id FROM public.profiles WHERE LOWER(email) = LOWER(TRIM(p_email));
  IF v_id IS NULL THEN RAISE EXCEPTION 'Aucun utilisateur avec cet e-mail'; END IF;
  IF v_id = auth.uid() THEN RAISE EXCEPTION 'Vous ne pouvez pas modifier votre propre rôle'; END IF;
  UPDATE public.profiles SET role = p_role WHERE id = v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_role_by_email(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_role_by_email(TEXT, TEXT) TO authenticated;

-- ============================================================================
-- FIN
-- ============================================================================
