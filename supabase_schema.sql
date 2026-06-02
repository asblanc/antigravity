-- Activer l'extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des Profils Utilisateurs (Membres, Partenaires, Admins)
-- Liée à la table auth.users de Supabase
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  whatsapp TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'partner', 'admin')),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  balance NUMERIC DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  points INTEGER DEFAULT 0,
  payment_method TEXT,
  qr_code TEXT UNIQUE,
  photo_url TEXT,
  company_name TEXT, -- Pour les partenaires
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table des Établissements (Catalogue)
CREATE TABLE public.establishments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.profiles(id), -- Le partenaire propriétaire
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  zone TEXT NOT NULL,
  description TEXT,
  cashback_rate NUMERIC DEFAULT 5.0, -- ex: 5.0 pour 5%
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Table des Transactions (Cashback)
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.profiles(id) NOT NULL,
  establishment_id UUID REFERENCES public.establishments(id) NOT NULL,
  amount NUMERIC NOT NULL,
  cashback_earned NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Sécurité
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS de base
-- Un utilisateur peut lire et modifier son propre profil
CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Tout le monde peut voir les établissements actifs
CREATE POLICY "Les établissements sont publics" ON public.establishments FOR SELECT USING (active = true);

-- Un membre peut voir ses transactions, un partenaire peut voir les transactions de son établissement
CREATE POLICY "Les membres voient leurs transactions" ON public.transactions FOR SELECT USING (auth.uid() = member_id);
-- (D'autres règles plus complexes pour les partenaires/admins seront ajoutées plus tard)

-- Création d'un trigger pour insérer automatiquement un profil lorsqu'un utilisateur s'inscrit via Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Utilisateur'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    COALESCE(NEW.raw_user_meta_data->>'tier', 'bronze')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
