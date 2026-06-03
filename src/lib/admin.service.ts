// Admin Service — IVOIRE BUSINESS CLUB (IBC)
// Lectures (RLS admin) + actions privilégiées (RPC SECURITY DEFINER).
// Requiert scripts/admin.sql appliqué sur Supabase.

import { supabase } from './supabase';

export interface AdminOverview {
  members_total: number;
  members_active: number;
  members_by_tier: Record<string, number>;
  partners_total: number;
  establishments_total: number;
  establishments_pending: number;
  tx_total: number;
  tx_pending: number;
  tx_volume: number;
  cashback_distributed: number;
  referrals_total: number;
  referral_bonus_total: number;
}

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  tier: string;
  balance: number;
  total_spent: number;
  points: number;
  active: boolean;
  created_at: string;
}

export interface AdminEstablishment {
  id: string;
  name: string;
  category: string;
  zone: string;
  cashback_rate: number;
  active: boolean;
  partner_id: string;
  created_at: string;
}

export interface AdminTransaction {
  id: string;
  amount: number;
  cashback_earned: number;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  memberName: string;
  establishmentName: string;
}

export interface AdminReferral {
  id: string;
  referee_name: string | null;
  referee_email: string | null;
  status: string;
  bonus: number;
  created_at: string;
}

// ─── Vue d'ensemble ─────────────────────────────────────────────────────────
export async function getAdminOverview(): Promise<AdminOverview | null> {
  const { data, error } = await supabase.rpc('admin_overview');
  if (error || !data) {
    console.error('admin_overview error:', error?.message);
    return null;
  }
  // Les parrainages dépendent de scripts/referrals.sql (peut ne pas exister).
  let referrals_total = 0;
  let referral_bonus_total = 0;
  try {
    const { data: refs } = await supabase.from('referrals').select('bonus, status');
    if (refs) {
      referrals_total = refs.length;
      referral_bonus_total = refs
        .filter((r: any) => r.status === 'active')
        .reduce((s: number, r: any) => s + (r.bonus || 0), 0);
    }
  } catch { /* table absente : on laisse 0 */ }

  return { ...(data as object), referrals_total, referral_bonus_total } as AdminOverview;
}

// ─── Membres ────────────────────────────────────────────────────────────────
export async function getAdminMembers(): Promise<AdminMember[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, whatsapp, tier, balance, total_spent, points, active, created_at')
    .eq('role', 'member')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as AdminMember[];
}

export async function setMemberActive(memberId: string, active: boolean): Promise<void> {
  const { error } = await supabase.rpc('admin_set_member_active', { p_member_id: memberId, p_active: active });
  if (error) throw new Error(error.message);
}

export async function setMemberTier(memberId: string, tier: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_member_tier', { p_member_id: memberId, p_tier: tier });
  if (error) throw new Error(error.message);
}

export async function adjustMemberBalance(memberId: string, amount: number): Promise<void> {
  const { error } = await supabase.rpc('admin_adjust_member_balance', { p_member_id: memberId, p_amount: amount });
  if (error) throw new Error(error.message);
}

// ─── Établissements ─────────────────────────────────────────────────────────
export async function getAdminEstablishments(): Promise<AdminEstablishment[]> {
  const { data, error } = await supabase
    .from('establishments')
    .select('id, name, category, zone, cashback_rate, active, partner_id, created_at')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as AdminEstablishment[];
}

export async function updateEstablishment(
  id: string,
  active: boolean,
  cashbackRate: number,
  imageUrl: string | null = null,
): Promise<void> {
  const { error } = await supabase.rpc('admin_update_establishment', {
    p_establishment_id: id,
    p_active: active,
    p_cashback_rate: cashbackRate,
    p_image_url: imageUrl,
  });
  if (error) throw new Error(error.message);
}

// Upload de la photo de couverture d'un établissement (bucket 'establishments').
export async function uploadEstablishmentImage(id: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${id}/cover.${ext}`;
  const { error } = await supabase.storage.from('establishments').upload(path, file, { upsert: true });
  if (error) throw new Error(error.message);
  const { data: { publicUrl } } = supabase.storage.from('establishments').getPublicUrl(path);
  return `${publicUrl}?t=${Date.now()}`;
}

// ─── Transactions ───────────────────────────────────────────────────────────
export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, cashback_earned, status, created_at, establishments(name), member:profiles!member_id(name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error || !data) {
    console.error('getAdminTransactions error:', error?.message);
    return [];
  }
  return data.map((d: any) => ({
    id: d.id,
    amount: d.amount,
    cashback_earned: d.cashback_earned,
    status: d.status,
    created_at: d.created_at,
    memberName: d.member?.name || 'Membre',
    establishmentName: d.establishments?.name || 'Établissement',
  }));
}

export async function reviewTransaction(
  txId: string,
  status: 'pending' | 'confirmed' | 'rejected',
): Promise<void> {
  const { error } = await supabase.rpc('admin_review_transaction', { p_tx_id: txId, p_status: status });
  if (error) throw new Error(error.message);
}

// ─── Parrainages ────────────────────────────────────────────────────────────
export async function getAdminReferrals(): Promise<AdminReferral[]> {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('id, referee_name, referee_email, status, bonus, created_at')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as AdminReferral[];
  } catch {
    return [];
  }
}

// ─── Abonnements ─────────────────────────────────────────────────────────────
export interface AdminSubscription {
  id: string;
  plan: string;
  amount: number;
  payment_method: string | null;
  status: 'pending' | 'active' | 'expired' | 'cancelled';
  started_at: string | null;
  expires_at: string | null;
  created_at: string;
  memberName: string;
}

export async function getAdminSubscriptions(): Promise<AdminSubscription[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, plan, amount, payment_method, status, started_at, expires_at, created_at, member:profiles!member_id(name)')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      plan: d.plan,
      amount: d.amount,
      payment_method: d.payment_method,
      status: d.status,
      started_at: d.started_at,
      expires_at: d.expires_at,
      created_at: d.created_at,
      memberName: d.member?.name || 'Membre',
    }));
  } catch {
    return [];
  }
}

export async function reviewSubscription(
  id: string,
  status: 'active' | 'cancelled' | 'expired',
): Promise<void> {
  const { error } = await supabase.rpc('admin_review_subscription', { p_id: id, p_status: status });
  if (error) throw new Error(error.message);
}

// ─── Communication / Notifications ───────────────────────────────────────────
export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_at: string;
}

export async function getAdminNotifications(): Promise<AdminNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, body, audience, created_at')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as AdminNotification[];
  } catch {
    return [];
  }
}

export async function sendNotification(title: string, body: string, audience: string): Promise<void> {
  const { error } = await supabase.rpc('admin_send_notification', { p_title: title, p_body: body, p_audience: audience });
  if (error) throw new Error(error.message);
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_notification', { p_id: id });
  if (error) throw new Error(error.message);
}

// ─── Rôles / Admins ──────────────────────────────────────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export async function getAdmins(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .eq('role', 'admin')
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as AdminUser[];
}

export async function setUserRole(userId: string, role: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_role', { p_user_id: userId, p_role: role });
  if (error) throw new Error(error.message);
}

export async function setRoleByEmail(email: string, role: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_role_by_email', { p_email: email, p_role: role });
  if (error) throw new Error(error.message);
}

// ─── Expériences (événements) ────────────────────────────────────────────────
export interface AdminExperience {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string | null;
  image_url: string | null;
  price: number;
  capacity: number | null;
  active: boolean;
  created_at: string;
}

export async function getAllExperiences(): Promise<AdminExperience[]> {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as AdminExperience[];
  } catch {
    return [];
  }
}

export interface ExperiencePayload {
  id?: string | null;
  title: string;
  description?: string;
  location?: string;
  event_date?: string | null;
  image_url?: string;
  price?: number;
  capacity?: number | null;
  active?: boolean;
}

export async function saveExperience(p: ExperiencePayload): Promise<void> {
  const { error } = await supabase.rpc('admin_save_experience', {
    p_id: p.id ?? null,
    p_title: p.title,
    p_description: p.description ?? null,
    p_location: p.location ?? null,
    p_event_date: p.event_date || null,
    p_image_url: p.image_url ?? null,
    p_price: p.price ?? 0,
    p_capacity: p.capacity ?? null,
    p_active: p.active ?? true,
  });
  if (error) throw new Error(error.message);
}

export async function deleteExperience(id: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_experience', { p_id: id });
  if (error) throw new Error(error.message);
}

// ─── Messages de contact ─────────────────────────────────────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  handled: boolean;
  created_at: string;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as ContactMessage[];
  } catch {
    return [];
  }
}

export async function setMessageHandled(id: string, handled: boolean): Promise<void> {
  const { error } = await supabase.rpc('admin_set_message_handled', { p_id: id, p_handled: handled });
  if (error) throw new Error(error.message);
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_message', { p_id: id });
  if (error) throw new Error(error.message);
}
