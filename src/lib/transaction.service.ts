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
// La création de la transaction ET le crédit du solde sont effectués de façon
// ATOMIQUE et sécurisée côté serveur par la fonction RPC `record_transaction`
// (SECURITY DEFINER). Le client ne peut plus écrire directement balance/transactions.
export async function recordTransaction(data: {
  memberId: string;
  partnerId: string;
  partnerName: string;
  amount: number;
}): Promise<string> {
  // Résoudre l'établissement du partenaire (RLS: le partenaire voit le sien)
  const { data: estData, error: estError } = await supabase
    .from('establishments')
    .select('id')
    .eq('partner_id', data.partnerId)
    .limit(1)
    .single();

  if (estError || !estData) {
    throw new Error('Establishment not found for this partner');
  }

  const { data: txId, error } = await supabase.rpc('record_transaction', {
    p_member_id: data.memberId,
    p_establishment_id: estData.id,
    p_amount: data.amount,
  });

  if (error) {
    console.error('Error recording transaction:', error);
    throw error;
  }

  return txId as string;
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
