// Authentication Service — IVOIRE BUSINESS CLUB (IBC)
// Replaces mock-api.ts auth methods with real Firebase Auth

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { auth, db, storage } from './firebase';
import type { Member } from './mock-api';

// ─── Register a new member ────────────────────────────────────────────────────
export async function registerMember(data: {
  name: string;
  email: string;
  password: string;
  whatsapp: string;
  plan: 'bronze' | 'silver' | 'gold';
  paymentMethod?: string;
  photoFile?: File | null;
}): Promise<Member> {
  // 1. Create Firebase Auth user
  const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);

  // 2. Generate member code (e.g. IBC00042)
  const memberCode = `IBC${user.uid.slice(0, 5).toUpperCase()}`;

  // 3. Build QR code payload
  const qrCode = `IBC-MEMBER-${data.name.toUpperCase().replace(/\s+/g, '-')}-${data.plan.toUpperCase()}-${user.uid}`;
  const defaultPhotoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=1B3A2D&color=C9A84C&bold=true`;
  const paymentMethod = data.paymentMethod || 'orange';

  let photoURL = defaultPhotoUrl;
  if (data.photoFile) {
    const extension = data.photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const storageRef = ref(storage, `users/${user.uid}/profile-photo.${extension}`);
    await uploadBytes(storageRef, data.photoFile);
    photoURL = await getDownloadURL(storageRef);
  }

  // 4. Set Firebase Auth display info for consistent profile data
  await updateProfile(user, {
    displayName: data.name,
    photoURL,
  });

  // 5. Build the Firestore document
  const memberData: Omit<Member, 'uid'> & { role: string; createdAt: unknown; memberCode: string } = {
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    photoURL,
    paymentMethod,
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

// ─── Translate Firebase Auth error codes → French messages ───────────────────
export function translateAuthError(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use':    'Cet e-mail est déjà associé à un compte.',
    'auth/invalid-email':           'L\'adresse e-mail n\'est pas valide.',
    'auth/user-not-found':          'Aucun compte trouvé avec cet e-mail.',
    'auth/wrong-password':          'Mot de passe incorrect.',
    'auth/invalid-credential':      'E-mail ou mot de passe incorrect.',
    'auth/too-many-requests':       'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
    'auth/network-request-failed':  'Erreur réseau. Vérifiez votre connexion internet.',
    'auth/user-disabled':           'Ce compte a été désactivé. Contactez le support IBC.',
    'auth/weak-password':           'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/operation-not-allowed':   'Cette méthode de connexion n\'est pas activée.',
    'auth/popup-closed-by-user':    'La fenêtre de connexion a été fermée.',
    'auth/requires-recent-login':   'Veuillez vous reconnecter pour effectuer cette action.',
  };
  return messages[code] ?? 'Une erreur est survenue. Veuillez réessayer.';
}

// ─── Send password reset email ────────────────────────────────────────────────
export async function sendPasswordReset(email: string): Promise<void> {
  const { sendPasswordResetEmail } = await import('firebase/auth');
  await sendPasswordResetEmail(auth, email);
}
