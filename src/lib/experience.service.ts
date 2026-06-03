// Experience Service — IVOIRE BUSINESS CLUB (IBC)
// Expériences (événements) + réservations membre. Requiert circles_experiences.sql.

import { supabase } from './supabase';

export interface Experience {
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

export interface Booking {
  id: string;
  experience_id: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

// Expériences actives (RLS : seules les actives sont visibles aux membres).
export async function getExperiences(): Promise<Experience[]> {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('event_date', { ascending: true });
    if (error || !data) return [];
    return data as Experience[];
  } catch {
    return [];
  }
}

export async function getMyBookings(uid: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, experience_id, status, created_at')
      .eq('member_id', uid);
    if (error || !data) return [];
    return data as Booking[];
  } catch {
    return [];
  }
}

export async function bookExperience(uid: string, experienceId: string): Promise<void> {
  const { error } = await supabase.from('bookings').insert({ experience_id: experienceId, member_id: uid });
  if (error) throw new Error(error.message);
}

export async function cancelBooking(uid: string, experienceId: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('experience_id', experienceId).eq('member_id', uid);
  if (error) throw new Error(error.message);
}
