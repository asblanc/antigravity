// Notification Service — IVOIRE BUSINESS CLUB (IBC)
// Notifications réelles (table notifications + RLS par audience).
// Requiert scripts/communication_and_roles.sql appliqué.

import { supabase } from './supabase';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_at: string;
}

// Notifications visibles par l'utilisateur courant (filtrées par RLS/audience).
export async function getNotifications(limit = 12): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, title, body, audience, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data as AppNotification[];
  } catch {
    return [];
  }
}
