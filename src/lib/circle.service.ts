// Circle Service — IVOIRE BUSINESS CLUB (IBC)
// Cercle Évasion : cagnottes de groupe. Requiert scripts/circles_experiences.sql.

import { supabase } from './supabase';

export interface Circle {
  id: string;
  name: string;
  owner_id: string;
  target_amount: number;
  created_at: string;
  is_owner: boolean;
  member_count: number;
  total_pooled: number;
  my_contribution: number;
}

export interface CircleMember {
  name: string;
  contribution: number;
}

export async function getMyCircles(): Promise<Circle[]> {
  const { data, error } = await supabase.rpc('get_my_circles');
  if (error || !data) return [];
  return data as Circle[];
}

export async function getCircleMembers(circleId: string): Promise<CircleMember[]> {
  const { data, error } = await supabase.rpc('get_circle_members', { p_circle: circleId });
  if (error || !data) return [];
  return data as CircleMember[];
}

export async function createCircle(name: string, target: number): Promise<void> {
  const { error } = await supabase.rpc('create_circle', { p_name: name, p_target: target });
  if (error) throw new Error(error.message);
}

export async function inviteToCircle(circleId: string, email: string): Promise<void> {
  const { error } = await supabase.rpc('add_circle_member_by_email', { p_circle: circleId, p_email: email });
  if (error) throw new Error(error.message);
}

export async function contributeCircle(circleId: string, amount: number): Promise<void> {
  const { error } = await supabase.rpc('circle_contribute', { p_circle: circleId, p_amount: amount });
  if (error) throw new Error(error.message);
}

export async function leaveCircle(circleId: string): Promise<void> {
  const { error } = await supabase.rpc('leave_circle', { p_circle: circleId });
  if (error) throw new Error(error.message);
}
