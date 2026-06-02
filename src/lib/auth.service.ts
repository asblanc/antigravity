/**
 * Authentication Service — IVOIRE BUSINESS CLUB (IBC)
 * Supabase Migration Implementation
 */

import { supabase } from './supabase';
import type { Member } from './mock-api';

// ─── Helpers ───────────────────────────────────────────────────────────────

function generateMemberCode(uid: string): string {
  return `IBC${uid.slice(0, 5).toUpperCase()}`;
}

function generateQrCode(name: string, plan: string, uid: string): string {
  return `IBC-MEMBER-${name.toUpperCase().replace(/\s+/g, '-')}-${plan.toUpperCase()}-${uid}`;
}

function defaultAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1B3A2D&color=C9A84C&bold=true&size=256`;
}

function detectRole(email: string): 'member' | 'partner' | 'admin' {
  const e = email.toLowerCase();
  if (e.includes('+admin') || e.endsWith('@ibc.ci') || e.endsWith('@ivoirebusinessclub.com')) return 'admin';
  if (e.includes('+partner') || e.includes('partner')) return 'partner';
  return 'member';
}

async function writeMemberProfile(uid: string, data: Record<string, any>): Promise<void> {
  const { error } = await supabase.from('profiles').upsert({ id: uid, ...data });
  if (error) {
    console.error('Error writing profile:', error);
    throw new Error("Erreur lors de la création du profil: " + error.message);
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

// ─── 1. Email & Password Registration ─────────────────────────────────────
export async function registerMember(data: {
  name: string;
  email: string;
  password: string;
  whatsapp: string;
  plan: 'bronze' | 'silver' | 'gold';
  paymentMethod?: string;
  photoFile?: File | null;
}): Promise<Member> {
  // DEMO MODE BYPASS
  if (data.email.toLowerCase().includes('demo')) {
    return {
      uid: 'demo-uid-123',
      name: data.name || 'Utilisateur Démo',
      email: data.email,
      whatsapp: data.whatsapp || '+225 00 00 00 00',
      photoURL: defaultAvatar(data.name || 'Demo'),
      paymentMethod: data.paymentMethod || 'orange',
      tier: data.plan || 'bronze',
      balance: 15000,
      totalSpent: 45000,
      visitsThisMonth: 3,
      qrCode: 'IBC-MEMBER-DEMO',
      role: detectRole(data.email),
      memberCode: 'IBCDEMO',
    } as any;
  }

  const role = detectRole(data.email);
  const photoURL = defaultAvatar(data.name);

  // 1. Create Supabase Auth user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        role: role,
        tier: data.plan
      }
    }
  });

  if (signUpError) throw signUpError;
  if (!authData.user) throw new Error('Failed to create user');

  const user = authData.user;
  const memberCode = generateMemberCode(user.id);
  const qrCode = generateQrCode(data.name, data.plan, user.id);
  const paymentMethod = data.paymentMethod || 'orange';

  // 2. Upload photo if provided
  let finalPhotoURL = photoURL;
  if (data.photoFile) {
    try {
      const extension = data.photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/profile-photo.${extension}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, data.photoFile, { upsert: true });
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        finalPhotoURL = publicUrl;
      }
    } catch { /* fallback to default */ }
  }

  // 3. Write profile (Supabase trigger handle_new_user should have inserted it, we just update it)
  const profile = {
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    photo_url: finalPhotoURL,
    payment_method: paymentMethod,
    role,
    qr_code: qrCode,
    tier: data.plan,
  };

  await writeMemberProfile(user.id, profile);
  
  return { 
    uid: user.id, 
    ...profile, 
    photoURL: finalPhotoURL,
    memberCode,
    balance: 0,
    totalSpent: 0,
    visitsThisMonth: 0,
    active: true 
  } as unknown as Member;
}

// ─── 2. Email & Password Login ────────────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<Member> {
  if (email.toLowerCase().includes('demo')) {
    return {
      uid: 'demo-uid-123',
      name: 'Utilisateur Démo',
      email,
      whatsapp: '+225 00 00 00 00',
      photoURL: defaultAvatar('Demo'),
      paymentMethod: 'orange',
      tier: 'gold',
      balance: 15000,
      totalSpent: 45000,
      visitsThisMonth: 3,
      qrCode: 'IBC-MEMBER-DEMO',
      role: detectRole(email),
      memberCode: 'IBCDEMO',
    } as any;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user) throw new Error('Login failed');

  const profile = await getCurrentMemberProfile(data.user.id);
  if (!profile) throw new Error('Profile not found');
  return profile;
}

// ─── 3. Social Login (Google, Facebook, Microsoft) ────────────────────────
export async function loginWithGoogle(): Promise<Member> {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) throw error;
  // Page will redirect, profile will be fetched on load
  return {} as Member;
}

export async function loginWithFacebook(): Promise<Member> {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'facebook' });
  if (error) throw error;
  return {} as Member;
}

export async function loginWithMicrosoft(): Promise<Member> {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'azure' });
  if (error) throw error;
  return {} as Member;
}

// ─── 4. Phone / OTP Authentication ────────────────────────────────────────
export function initRecaptcha(containerId: string = 'recaptcha-container'): void {
  // Not natively supported by Supabase like Firebase RecaptchaVerifier
}

export async function sendPhoneOTP(phoneNumber: string): Promise<any> {
  const { data, error } = await supabase.auth.signInWithOtp({ phone: phoneNumber });
  if (error) throw error;
  return { phone: phoneNumber };
}

export async function verifyPhoneOTP(confirmation: any, otp: string): Promise<Member> {
  const { data, error } = await supabase.auth.verifyOtp({ phone: confirmation.phone, token: otp, type: 'sms' });
  if (error) throw error;
  if (!data.user) throw new Error('Verification failed');
  
  const profile = await getCurrentMemberProfile(data.user.id);
  return profile as Member;
}

// ─── 5. Password Reset ────────────────────────────────────────────────────
export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

// ─── 6. Logout ────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── 7. Get Profile ──────────────────────────────────────────────────────
export async function getCurrentMemberProfile(uid: string): Promise<Member | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
  if (error || !data) return null;
  
  return {
    uid: data.id,
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    role: data.role,
    tier: data.tier,
    balance: data.balance || 0,
    totalSpent: data.total_spent || 0,
    paymentMethod: data.payment_method,
    photoURL: data.photo_url || defaultAvatar(data.name),
    qrCode: data.qr_code,
    memberCode: generateMemberCode(data.id),
    active: data.active,
    company: data.company_name
  } as unknown as Member;
}

// ─── 8. Auth State Observer ───────────────────────────────────────────────
export function subscribeToAuthState(callback: (user: any | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session?.user || null);
    }
  );
  return () => {
    subscription.unsubscribe();
  };
}

// ─── 9. Translate Supabase Auth error codes → French ─────────────────────
export function translateAuthError(code: string): string {
  const errorMsg = code?.toLowerCase() || '';
  if (errorMsg.includes('already registered')) return 'Cet e-mail est déjà associé à un compte.';
  if (errorMsg.includes('invalid login credentials')) return 'E-mail ou mot de passe incorrect.';
  if (errorMsg.includes('user not found')) return 'Aucun compte trouvé avec cet e-mail.';
  if (errorMsg.includes('password')) return 'Mot de passe incorrect ou trop faible.';
  return 'Une erreur est survenue. Veuillez réessayer.';
}

export function translateSocialAuthError(error: any): string {
  return translateAuthError(error?.message || '');
}