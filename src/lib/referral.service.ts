// Referral Service — IVOIRE BUSINESS CLUB (IBC)
// Données réelles depuis Supabase (table `referrals` + RPC `record_referral`).

import { supabase } from './supabase';

export interface Referral {
  id: string;
  refereeName: string;
  email: string;
  date: string;
  status: 'active' | 'pending';
  bonus: number;
}

export interface ReferralStats {
  refereeCount: number;      // "Mes filleuls" (total invités)
  activeCount: number;       // Filleuls activés (ayant rejoint)
  referralBonus: number;     // "Bonus gagnés" (somme des bonus)
  referralLink: string;      // "Mon lien de parrainage"
}

// Lien de parrainage : page d'inscription préremplie avec l'id du parrain.
// Utilise l'origine courante pour fonctionner sur n'importe quel domaine.
export function generateReferralLink(_displayName: string, uid: string): string {
  const base = (typeof window !== 'undefined' && window.location?.origin)
    ? window.location.origin
    : 'https://ivoire-business-club.vercel.app';
  return `${base}/member-registration?ref=${uid}`;
}

export async function getMemberReferrals(uid: string): Promise<Referral[]> {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', uid)
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      refereeName: d.referee_name || 'Membre invité',
      email: d.referee_email || '',
      date: d.created_at
        ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(d.created_at))
        : 'Récemment',
      status: d.status as 'active' | 'pending',
      bonus: d.bonus || 0,
    }));
  } catch (error) {
    console.warn('getMemberReferrals error:', error);
    return [];
  }
}

// ─── Stats de parrainage du membre ──────────────────────────────────────────
export async function getReferralStats(uid: string, displayName: string): Promise<ReferralStats> {
  const referrals = await getMemberReferrals(uid);
  return {
    refereeCount: referrals.length,
    activeCount: referrals.filter(r => r.status === 'active').length,
    referralBonus: referrals.reduce((sum, r) => sum + r.bonus, 0),
    referralLink: generateReferralLink(displayName, uid),
  };
}

// ─── Enregistrer un parrainage (appelé après l'inscription du filleul) ───────
export async function recordReferral(referrerId: string): Promise<void> {
  if (!referrerId) return;
  const { error } = await supabase.rpc('record_referral', { p_referrer_id: referrerId });
  if (error) console.warn('record_referral failed:', error.message);
}
