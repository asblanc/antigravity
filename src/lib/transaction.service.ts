// Transaction Service — IVOIRE BUSINESS CLUB (IBC)
// Handles cashback transactions in Supabase

import { supabase } from './supabase';
import type { Transaction } from './mock-api';

// ─── Get member transactions ──────────────────────────────────────────────────
export async function getMemberTransactions(uid: string, maxItems = 20): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      cashback_earned,
      status,
      created_at,
      establishments ( name )
    `)
    .eq('member_id', uid)
    .order('created_at', { ascending: false })
    .limit(maxItems);

  if (error || !data) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    partnerName: d.establishments?.name || 'Partenaire Inconnu',
    date: d.created_at
      ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d.created_at))
      : 'Date inconnue',
    amount: d.amount,
    cashback: d.cashback_earned,
    status: d.status as 'confirmed' | 'pending',
  }));
}

// ─── Record a new cashback transaction ───────────────────────────────────────
export async function recordTransaction(data: {
  memberId: string;
  partnerId: string;
  partnerName: string;
  amount: number;
}): Promise<string> {
  
  // For demo, standard cashback is 5%
  const cashbackRate = 0.05;
  const memberCashback = Math.round(data.amount * cashbackRate);

  // We need to fetch the establishment ID from the partnerId to be clean, 
  // but let's assume we can fetch it or just get the first establishment of this partner
  const { data: estData } = await supabase
    .from('establishments')
    .select('id')
    .eq('partner_id', data.partnerId)
    .limit(1)
    .single();

  if (!estData) {
    throw new Error('Establishment not found for this partner');
  }

  const { data: txData, error } = await supabase
    .from('transactions')
    .insert({
      member_id: data.memberId,
      establishment_id: estData.id,
      amount: data.amount,
      cashback_earned: memberCashback,
      status: 'confirmed'
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error recording transaction:', error);
    throw error;
  }

  // Use an RPC (stored procedure) or two separate queries to update the user's balance
  // Since we don't have an RPC setup in our schema yet, we'll fetch then update.
  const { data: profile } = await supabase
    .from('profiles')
    .select('balance, total_spent')
    .eq('id', data.memberId)
    .single();

  if (profile) {
    await supabase
      .from('profiles')
      .update({
        balance: (profile.balance || 0) + memberCashback,
        total_spent: (profile.total_spent || 0) + data.amount,
      })
      .eq('id', data.memberId);
  }

  return txData.id;
}

// ─── Get partner's recent validated transactions ──────────────────────────────
export async function getPartnerTransactions(partnerId: string, maxItems = 50): Promise<any[]> {
  // We join transactions with establishments to ensure we only get txs for this partner
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      cashback_earned,
      status,
      created_at,
      establishments!inner ( id, partner_id )
    `)
    .eq('establishments.partner_id', partnerId)
    .order('created_at', { ascending: false })
    .limit(maxItems);

  if (error || !data) {
    console.error('Error fetching partner transactions:', error);
    return [];
  }

  return data.map((d: any) => ({
    id: d.id,
    amount: d.amount,
    cashback: d.cashback_earned,
    status: d.status,
    date: d.created_at
      ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d.created_at))
      : 'Date inconnue',
  }));
}
