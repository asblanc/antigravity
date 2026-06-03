-- ============================================================================
-- IBC — Activer le temps réel (Supabase Realtime)
-- ----------------------------------------------------------------------------
-- À exécuter dans le SQL Editor de Supabase.
-- Ajoute les tables à la publication 'supabase_realtime' pour que le client
-- reçoive les changements en direct (solde crédité, nouvelles transactions...).
-- La RLS s'applique : chaque membre ne reçoit que SES lignes.
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ⚠️ Si une table est déjà dans la publication, Postgres renvoie une erreur
--    "is already member of publication" — sans gravité, ignorez-la.
-- ============================================================================
