import { supabase } from './supabase';

export interface Partner {
  uid: string;
  businessName: string;
  email: string;
  whatsapp: string;
  category: string;
  cashbackRate: number;
  address: string;
  role: 'partner';
}

// ─── Register a new partner ───────────────────────────────────────────────────
export async function registerPartner(data: {
  businessName: string;
  email: string;
  password: string;
  whatsapp: string;
  category: string;
  address: string;
  description?: string;
  cashbackRate?: number;
  imageFile?: File | null;
}): Promise<Partner> {
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.businessName,
        role: 'partner',
      }
    }
  });

  if (signUpError) throw signUpError;
  if (!authData.user) throw new Error('Failed to create partner user');

  const user = authData.user;

  // Upload de la photo de l'établissement (bucket public 'establishments')
  let imageUrl: string | null = null;
  if (data.imageFile) {
    try {
      const ext = data.imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/cover.${ext}`;
      const { error: upErr } = await supabase.storage.from('establishments').upload(path, data.imageFile, { upsert: true });
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from('establishments').getPublicUrl(path);
        imageUrl = publicUrl;
      }
    } catch { /* photo optionnelle */ }
  }

  // Insert into establishments for the partner
  const { error: estError } = await supabase.from('establishments').insert({
    partner_id: user.id,
    name: data.businessName,
    category: data.category,
    zone: data.address,
    description: data.description || null,
    cashback_rate: data.cashbackRate ?? 5.0,
    image_url: imageUrl,
    active: false // Needs admin approval
  });

  if (estError) console.error('Error creating establishment:', estError);

  return {
    uid: user.id,
    businessName: data.businessName,
    email: data.email,
    whatsapp: data.whatsapp,
    category: data.category,
    address: data.address,
    cashbackRate: data.cashbackRate ?? 5.0,
    role: 'partner'
  };
}

// ─── Get all active partners (for homepage / offers) ─────────────────────────
export async function getActivePartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from('establishments')
    .select('*, profiles(email, whatsapp)')
    .eq('active', true);

  if (error || !data) return [];

  return data.map((d: any) => ({
    uid: d.partner_id,
    businessName: d.name,
    email: d.profiles?.email || '',
    whatsapp: d.profiles?.whatsapp || '',
    category: d.category,
    cashbackRate: d.cashback_rate,
    address: d.zone,
    role: 'partner'
  }));
}

// ─── Validate a QR code scanned by a partner ─────────────────────────────────
export async function validateMemberQR(qrContent: string): Promise<{
  uid: string;
  name: string;
  tier: string;
  status: string;
  balance: number;
  valid: boolean;
} | null> {
  let normalizedQr = qrContent.trim();
  
  if (!normalizedQr.startsWith('IBC-MEMBER-')) {
    const formattedName = normalizedQr.replace(/\s+/g, '_');
    normalizedQr = `IBC-MEMBER-${formattedName}-BRONZE-demo`;
  }

  const parts = normalizedQr.split('-');
  if (parts[0] !== 'IBC' || parts[1] !== 'MEMBER') return null;

  const uid = parts[parts.length - 1];

  try {
    // RPC sécurisée : renvoie le strict nécessaire, réservée partenaires/admins.
    // Évite d'exposer toute la table profiles à un partenaire.
    const { data, error } = await supabase.rpc('get_member_card', { p_uid: uid });
    const card = Array.isArray(data) ? data[0] : data;
    if (!error && card) {
      return {
        uid,
        name: card.name,
        tier: card.tier,
        status: card.tier,
        balance: card.balance || 0,
        valid: true,
      };
    }
  } catch (error) {
    console.warn("Supabase fetch failed or offline, falling back to mock parser for demo.", error);
  }

  const rawName = parts[2] ? parts[2].replace(/_/g, ' ') : 'Membre Démo';
  const tier = parts[3] ? parts[3].toUpperCase() : 'BRONZE';

  return {
    uid: uid || 'demo-member',
    name: rawName,
    tier: tier,
    status: tier,
    balance: 12500,
    valid: true,
  };
}
