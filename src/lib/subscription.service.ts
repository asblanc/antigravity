// Subscription Service — IVOIRE BUSINESS CLUB (IBC)
// Adhésions payantes. Requiert scripts/subscriptions.sql appliqué.

import { supabase } from './supabase';

export interface Subscription {
  id: string;
  plan: string;
  amount: number;
  payment_method: string | null;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
}

// Tarifs affichés côté client (⚠️ doivent rester alignés avec plan_price() en SQL).
export const PLAN_PRICES: Record<string, number> = {
  bronze: 500,
  silver: 2000,
  gold: 5000,
  platinum: 10000,
};

// Abonnement le plus récent du membre (pour afficher son statut).
export async function getMySubscription(uid: string): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('member_id', uid)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return data as Subscription;
  } catch {
    return null;
  }
}

// Souscrire à un plan : crée une demande 'pending' (paiement PSP à venir).
export async function subscribe(plan: string, paymentMethod: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('subscribe', { p_plan: plan, p_payment_method: paymentMethod });
  if (error) {
    console.error('subscribe error:', error.message);
    throw new Error(error.message);
  }
  return data as string;
}
