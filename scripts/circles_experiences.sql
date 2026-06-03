-- ============================================================================
-- IBC — Modules membre : Cercle Évasion (circles) + Expériences (events/bookings)
-- ----------------------------------------------------------------------------
-- Script IDEMPOTENT à exécuter dans le SQL Editor de Supabase.
-- Dépend de public.is_admin() (scripts/security_hardening.sql).
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
-- 1. CERCLE ÉVASION (cagnottes de groupe)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.circles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  owner_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.circle_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id    UUID NOT NULL REFERENCES public.circles(id) ON DELETE CASCADE,
  member_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contribution NUMERIC NOT NULL DEFAULT 0,
  joined_at    TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (circle_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_circle_members_circle ON public.circle_members(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_members_member ON public.circle_members(member_id);

-- Helper anti-récursion RLS (bypasse la RLS car SECURITY DEFINER).
CREATE OR REPLACE FUNCTION public.is_circle_member(p_circle UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.circle_members WHERE circle_id = p_circle AND member_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_circle_member(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_circle_member(UUID) TO authenticated;

ALTER TABLE public.circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.circles FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.circle_members FROM anon, authenticated;

DROP POLICY IF EXISTS circles_select ON public.circles;
CREATE POLICY circles_select ON public.circles FOR SELECT
  USING (owner_id = auth.uid() OR public.is_circle_member(id) OR public.is_admin());

DROP POLICY IF EXISTS circle_members_select ON public.circle_members;
CREATE POLICY circle_members_select ON public.circle_members FOR SELECT
  USING (member_id = auth.uid() OR public.is_circle_member(circle_id) OR public.is_admin());

-- Créer un cercle (le créateur en devient membre).
CREATE OR REPLACE FUNCTION public.create_circle(p_name TEXT, p_target NUMERIC)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id UUID;
BEGIN
  IF COALESCE(TRIM(p_name), '') = '' THEN RAISE EXCEPTION 'Nom requis'; END IF;
  INSERT INTO public.circles (name, owner_id, target_amount)
  VALUES (p_name, auth.uid(), GREATEST(0, COALESCE(p_target, 0)))
  RETURNING id INTO v_id;
  INSERT INTO public.circle_members (circle_id, member_id) VALUES (v_id, auth.uid());
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_circle(TEXT, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_circle(TEXT, NUMERIC) TO authenticated;

-- Ajouter un membre par e-mail (réservé au propriétaire du cercle).
CREATE OR REPLACE FUNCTION public.add_circle_member_by_email(p_circle UUID, p_email TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_owner UUID; v_uid UUID;
BEGIN
  SELECT owner_id INTO v_owner FROM public.circles WHERE id = p_circle;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'Cercle introuvable'; END IF;
  IF v_owner <> auth.uid() THEN RAISE EXCEPTION 'Seul le propriétaire peut inviter'; END IF;
  SELECT id INTO v_uid FROM public.profiles WHERE LOWER(email) = LOWER(TRIM(p_email));
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Aucun membre avec cet e-mail'; END IF;
  INSERT INTO public.circle_members (circle_id, member_id) VALUES (p_circle, v_uid)
  ON CONFLICT (circle_id, member_id) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.add_circle_member_by_email(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_circle_member_by_email(UUID, TEXT) TO authenticated;

-- Contribuer à un cercle depuis la cagnotte cashback (atomique).
CREATE OR REPLACE FUNCTION public.circle_contribute(p_circle UUID, p_amount NUMERIC)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_cash NUMERIC;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'Montant invalide'; END IF;
  IF NOT public.is_circle_member(p_circle) THEN RAISE EXCEPTION 'Vous n''êtes pas membre de ce cercle'; END IF;
  SELECT balance INTO v_cash FROM public.profiles WHERE id = auth.uid();
  IF p_amount > COALESCE(v_cash, 0) THEN RAISE EXCEPTION 'Solde cashback insuffisant'; END IF;

  UPDATE public.profiles SET balance = balance - p_amount WHERE id = auth.uid();
  UPDATE public.circle_members SET contribution = contribution + p_amount
   WHERE circle_id = p_circle AND member_id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.circle_contribute(UUID, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.circle_contribute(UUID, NUMERIC) TO authenticated;

-- Quitter un cercle (sauf le propriétaire).
CREATE OR REPLACE FUNCTION public.leave_circle(p_circle UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_owner UUID;
BEGIN
  SELECT owner_id INTO v_owner FROM public.circles WHERE id = p_circle;
  IF v_owner = auth.uid() THEN RAISE EXCEPTION 'Le propriétaire ne peut pas quitter son cercle'; END IF;
  DELETE FROM public.circle_members WHERE circle_id = p_circle AND member_id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.leave_circle(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.leave_circle(UUID) TO authenticated;

-- Lecture : mes cercles (avec agrégats) + membres d'un cercle.
CREATE OR REPLACE FUNCTION public.get_my_circles()
RETURNS JSON LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT COALESCE(json_agg(r ORDER BY r.created_at DESC), '[]'::json) FROM (
    SELECT c.id, c.name, c.owner_id, c.target_amount, c.created_at,
      (c.owner_id = auth.uid()) AS is_owner,
      (SELECT count(*) FROM public.circle_members m WHERE m.circle_id = c.id) AS member_count,
      (SELECT COALESCE(sum(contribution), 0) FROM public.circle_members m WHERE m.circle_id = c.id) AS total_pooled,
      (SELECT COALESCE(contribution, 0) FROM public.circle_members m WHERE m.circle_id = c.id AND m.member_id = auth.uid()) AS my_contribution
    FROM public.circles c
    WHERE EXISTS (SELECT 1 FROM public.circle_members m WHERE m.circle_id = c.id AND m.member_id = auth.uid())
  ) r;
$$;
REVOKE ALL ON FUNCTION public.get_my_circles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_circles() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_circle_members(p_circle UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE result JSON;
BEGIN
  IF NOT public.is_circle_member(p_circle) AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Non autorisé';
  END IF;
  SELECT COALESCE(json_agg(json_build_object('name', p.name, 'contribution', m.contribution) ORDER BY m.contribution DESC), '[]'::json)
    INTO result
  FROM public.circle_members m JOIN public.profiles p ON p.id = m.member_id
  WHERE m.circle_id = p_circle;
  RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.get_circle_members(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_circle_members(UUID) TO authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. EXPÉRIENCES (événements admin) + RÉSERVATIONS (membres)
-- ════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.experiences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  location    TEXT,
  event_date  TIMESTAMPTZ,
  image_url   TEXT,
  price       NUMERIC NOT NULL DEFAULT 0,
  capacity    INTEGER,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at    TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (experience_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_bookings_member ON public.bookings(member_id);

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.experiences FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.bookings TO authenticated;

DROP POLICY IF EXISTS experiences_select_public ON public.experiences;
DROP POLICY IF EXISTS experiences_select_admin  ON public.experiences;
CREATE POLICY experiences_select_public ON public.experiences FOR SELECT USING (active = true);
CREATE POLICY experiences_select_admin  ON public.experiences FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS bookings_select_own   ON public.bookings;
DROP POLICY IF EXISTS bookings_select_admin ON public.bookings;
DROP POLICY IF EXISTS bookings_insert_own   ON public.bookings;
DROP POLICY IF EXISTS bookings_delete_own   ON public.bookings;
CREATE POLICY bookings_select_own   ON public.bookings FOR SELECT USING (member_id = auth.uid());
CREATE POLICY bookings_select_admin ON public.bookings FOR SELECT USING (public.is_admin());
CREATE POLICY bookings_insert_own   ON public.bookings FOR INSERT TO authenticated WITH CHECK (member_id = auth.uid());
CREATE POLICY bookings_delete_own   ON public.bookings FOR DELETE USING (member_id = auth.uid());

-- Gestion des expériences par l'admin (upsert + suppression).
CREATE OR REPLACE FUNCTION public.admin_save_experience(
  p_id UUID, p_title TEXT, p_description TEXT, p_location TEXT,
  p_event_date TIMESTAMPTZ, p_image_url TEXT, p_price NUMERIC, p_capacity INTEGER, p_active BOOLEAN
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id UUID;
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  IF COALESCE(TRIM(p_title), '') = '' THEN RAISE EXCEPTION 'Titre requis'; END IF;

  IF p_id IS NULL THEN
    INSERT INTO public.experiences (title, description, location, event_date, image_url, price, capacity, active)
    VALUES (p_title, p_description, p_location, p_event_date, p_image_url, COALESCE(p_price, 0), p_capacity, COALESCE(p_active, true))
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.experiences
       SET title = p_title, description = p_description, location = p_location, event_date = p_event_date,
           image_url = p_image_url, price = COALESCE(p_price, 0), capacity = p_capacity, active = COALESCE(p_active, true)
     WHERE id = p_id
     RETURNING id INTO v_id;
  END IF;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_save_experience(UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, NUMERIC, INTEGER, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_experience(UUID, TEXT, TEXT, TEXT, TIMESTAMPTZ, TEXT, NUMERIC, INTEGER, BOOLEAN) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_delete_experience(p_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Réservé aux administrateurs'; END IF;
  DELETE FROM public.experiences WHERE id = p_id;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_delete_experience(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_experience(UUID) TO authenticated;

-- ============================================================================
-- FIN
-- ============================================================================
