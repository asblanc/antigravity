-- ============================================================================
-- IBC — Statistiques publiques (compteurs page d'accueil)
-- ----------------------------------------------------------------------------
-- À exécuter dans le SQL Editor de Supabase.
-- RPC SECURITY DEFINER qui renvoie de simples COMPTEURS (aucune donnée
-- personnelle) — accessible publiquement pour afficher des chiffres réels.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.public_stats()
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT json_build_object(
    'members',        (SELECT count(*) FROM public.profiles WHERE role = 'member'),
    'partners',       (SELECT count(*) FROM public.profiles WHERE role = 'partner'),
    'establishments', (SELECT count(*) FROM public.establishments WHERE active)
  );
$$;

REVOKE ALL ON FUNCTION public.public_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_stats() TO anon, authenticated;

-- ============================================================================
-- FIN
-- ============================================================================
