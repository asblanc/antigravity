// Member Service — IVOIRE BUSINESS CLUB (IBC)
// Modules membre : Objectifs (goals) + Épargne (savings).
// Requiert scripts/member_savings.sql appliqué.

import { supabase } from './supabase';

export interface Goal {
  id: string;
  member_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  status: 'active' | 'reached' | 'archived';
  created_at: string;
}

export interface SavingsAccount {
  member_id: string;
  balance: number;
  updated_at: string;
}

// ─── Objectifs ───────────────────────────────────────────────────────────────
export async function getGoals(uid: string): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('member_id', uid)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as Goal[];
  } catch {
    return [];
  }
}

export async function createGoal(uid: string, title: string, targetAmount: number): Promise<void> {
  const { error } = await supabase.from('goals').insert({
    member_id: uid,
    title,
    target_amount: targetAmount,
  });
  if (error) throw new Error(error.message);
}

// Met à jour le montant épargné d'un objectif (et marque 'reached' si atteint).
export async function setGoalProgress(goal: Goal, newAmount: number): Promise<void> {
  const amount = Math.max(0, newAmount);
  const status = amount >= goal.target_amount ? 'reached' : 'active';
  const { error } = await supabase
    .from('goals')
    .update({ current_amount: amount, status })
    .eq('id', goal.id);
  if (error) throw new Error(error.message);
}

export async function deleteGoal(id: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ─── Épargne ─────────────────────────────────────────────────────────────────
export async function getSavings(uid: string): Promise<SavingsAccount | null> {
  try {
    const { data, error } = await supabase
      .from('savings_accounts')
      .select('*')
      .eq('member_id', uid)
      .maybeSingle();
    if (error || !data) return null;
    return data as SavingsAccount;
  } catch {
    return null;
  }
}

// Dépôt depuis la cagnotte cashback → renvoie le nouveau solde d'épargne.
export async function savingsDeposit(amount: number): Promise<number> {
  const { data, error } = await supabase.rpc('savings_deposit', { p_amount: amount });
  if (error) throw new Error(error.message);
  return data as number;
}

// Retrait de l'épargne vers la cagnotte → renvoie le nouveau solde d'épargne.
export async function savingsWithdraw(amount: number): Promise<number> {
  const { data, error } = await supabase.rpc('savings_withdraw', { p_amount: amount });
  if (error) throw new Error(error.message);
  return data as number;
}
