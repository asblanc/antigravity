// Authentication Service — IVOIRE BUSINESS CLUB (IBC)
// Replaces mock-api.ts auth methods with real Firebase Auth

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import type { Member } from './mock-api';

// ─── Register a new member ────────────────────────────────────────────────────
export async function registerMember(data: {
  name: string;
  email: string;
  password: string;
  whatsapp: string;
  plan: 'bronze' | 'silver' | 'gold';
}): Promise<Member> {
  // 1. Create Firebase Auth user
  const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);

  // 2. Generate member code (e.g. IBC00042)
  const memberCode = `IBC${user.uid.slice(0, 5).toUpperCase()}`;

  // 3. Build QR code payload
  const qrCode = `IBC-MEMBER-${data.name.toUpperCase().replace(/\s+/g, '-')}-${data.plan.toUpperCase()}-${user.uid}`;

  // 4. Build the Firestore document
  const memberData: Omit<Member, 'uid'> & { role: string; createdAt: unknown; memberCode: string } = {
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    tier: data.plan,
    balance: 0,
    totalSpent: 0,
    visitsThisMonth: 0,
    qrCode,
    role: 'member',
    memberCode,
    createdAt: serverTimestamp(),
  };

  // 5. Write to Firestore: users/{uid}
  await setDoc(doc(db, 'users', user.uid), memberData);

  return { uid: user.uid, ...memberData };
}

// ─── Login (member or partner) ────────────────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<Member> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);

  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) throw new Error('Profil introuvable. Contactez le support IBC.');

  return { uid: user.uid, ...snap.data() } as Member;
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// ─── Get current member profile from Firestore ───────────────────────────────
export async function getCurrentMemberProfile(uid: string): Promise<Member | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as Member;
}

// ─── Auth state observer (for App-level listener) ────────────────────────────
export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
