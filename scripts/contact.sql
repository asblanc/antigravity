-- ============================================================================
-- IBC — Page Contact (messages)
-- ----------------------------------------------------------------------------
-- Script IDEMPOTENT à exécuter dans le SQL Editor de Supabase.
-- Dépend de public.is_admin() (scripts/security_hardening.sql).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  handled    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
CREATE INDEX IF NOT EXISTS idx_contact_created ON public.contact_messages(created_at DESC);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- N'importe qui (même non connecté) peut ENVOYER un message ; personne ne peut
-- le lire sauf l'admin. Pas de modification/suppression directe (RPC admin).
REVOKE UPDATE, DELETE ON public.contact_messages FROM anon, authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;

DROP POLICY IF EXISTS contact_insert_any   ON public.contact_messages;
DROP POLICY IF EXISTS contact_select_admin ON public.contact_messages;

CREATE POLICY contact_insert_any ON public.contact_messages
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY contact_select_admin ON public.contact_messages
  FOR SELECT USING (public.is_admin());

-- Marquer un message comme traité / non traité (admin).
CREATE OR REPLACE FUNCTION public.admin_set_message_handled(p_id UUID, p_handled BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  UPDATE public.contact_messages SET handled = p_handled WHERE id = p_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_message_handled(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_message_handled(UUID, BOOLEAN) TO authenticated;

-- Supprimer un message (admin).
CREATE OR REPLACE FUNCTION public.admin_delete_message(p_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  DELETE FROM public.contact_messages WHERE id = p_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_delete_message(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_message(UUID) TO authenticated;

-- ============================================================================
-- FIN
-- ============================================================================
