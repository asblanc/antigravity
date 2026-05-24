/**
 * Authentication Service — IVOIRE BUSINESS CLUB (IBC)
 * Supports: Email/Password, Google, Facebook, Microsoft, Phone/OTP
 *
 * Architecture:
 *   Firebase Auth = authentication (who you are)
 *   Firestore users/{uid} = profile data (role, tier, balance, etc.)
 *   Firestore members/{uid} = same document, for admin querying
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  type User,
  type ConfirmationResult,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import type { Member } from './mock-api';

// ─── Providers ─────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({ display: 'popup' });

const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({ prompt: 'select_account', tenant: 'consumers' });

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Generate a unique member code */
function generateMemberCode(uid: string): string {
  return `IBC${uid.slice(0, 5).toUpperCase()}`;
}

/** Generate QR Code payload */
function generateQrCode(name: string, plan: string, uid: string): string {
  return `IBC-MEMBER-${name.toUpperCase().replace(/\s+/g, '-')}-${plan.toUpperCase()}-${uid}`;
}

/** Get default avatar URL */
function defaultAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1B3A2D&color=C9A84C&bold=true&size=256`;
}

/** Detect role from email (admin/partner patterns) */
function detectRole(email: string): 'member' | 'partner' | 'admin' {
  const e = email.toLowerCase();
  if (e.includes('+admin') || e.endsWith('@ibc.ci') || e.endsWith('@ivoirebusinessclub.com')) return 'admin';
  if (e.includes('+partner') || e.includes('partner')) return 'partner';
  return 'member';
}

/** Extract provider name from User object */
function getProviderName(user: User): string {
  const p = user.providerData?.[0]?.providerId;
  if (p === 'password') return 'email';
  if (p === 'google.com') return 'google';
  if (p === 'facebook.com') return 'facebook';
  if (p === 'microsoft.com') return 'microsoft';
  if (p === 'phone') return 'phone';
  return p || 'unknown';
}

/** Write (or merge) a member profile to Firestore in both users/{uid} and members/{uid} */
async function writeMemberProfile(uid: string, data: Record<string, any>): Promise<void> {
  const profile = {
    uid,
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Write to both collections for flexible querying
  await setDoc(doc(db, 'users', uid), profile, { merge: true });
  await setDoc(doc(db, 'members', uid), profile, { merge: true });
}

/** Ensure a Firestore profile exists for a social login user */
async function ensureProfileExists(user: User): Promise<Member> {
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (snap.exists()) {
    return { uid: user.uid, ...snap.data() } as Member;
  }

  // First-time social login → create profile
  const name = user.displayName || user.email?.split('@')[0] || 'Membre IBC';
  const email = user.email || '';
  const photoURL = user.photoURL || defaultAvatar(name);
  const provider = getProviderName(user);
  const role = detectRole(email);
  const memberCode = generateMemberCode(user.uid);
  const qrCode = generateQrCode(name, 'bronze', user.uid);

  const profile = {
    name,
    email,
    photoURL,
    provider,
    role,
    memberCode,
    qrCode,
    tier: 'bronze',
    balance: 0,
    totalSpent: 0,
    visitsThisMonth: 0,
    whatsapp: user.phoneNumber || '',
    phone: user.phoneNumber || '',
    active: true,
    createdAt: serverTimestamp(),
  };

  await writeMemberProfile(user.uid, profile);
  return { uid: user.uid, ...profile } as Member;
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
  // ─── DEMO MODE BYPASS ──────────────────────────────────────────────────
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
    };
  }

  // 1. Create Firebase Auth user
  const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);

  // 2. Prepare profile data
  const memberCode = generateMemberCode(user.uid);
  const qrCode = generateQrCode(data.name, data.plan, user.uid);
  const photoURL = data.photoFile ? defaultAvatar(data.name) : defaultAvatar(data.name);
  const role = detectRole(data.email);
  const paymentMethod = data.paymentMethod || 'orange';

  // 3. Upload photo if provided
  let finalPhotoURL = photoURL;
  if (data.photoFile) {
    try {
      const extension = data.photoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const storageRef = ref(storage, `users/${user.uid}/profile-photo.${extension}`);
      await uploadBytes(storageRef, data.photoFile);
      finalPhotoURL = await getDownloadURL(storageRef);
    } catch { /* fallback to default */ }
  }

  // 4. Update Auth profile
  try {
    await updateProfile(user, { displayName: data.name, photoURL: finalPhotoURL });
  } catch { /* non-critical */ }

  // 5. Build and write Firestore document
  const profile = {
    name: data.name,
    email: data.email,
    whatsapp: data.whatsapp,
    photoURL: finalPhotoURL,
    paymentMethod,
    provider: 'email',
    role,
    memberCode,
    qrCode,
    tier: data.plan,
    balance: 0,
    totalSpent: 0,
    visitsThisMonth: 0,
    active: true,
    createdAt: serverTimestamp(),
  };

  await writeMemberProfile(user.uid, profile);
  return { uid: user.uid, ...profile } as Member;
}

// ─── 2. Email & Password Login ────────────────────────────────────────────
export async function loginUser(email: string, password: string): Promise<Member> {
  // ─── DEMO MODE BYPASS ──────────────────────────────────────────────────
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
    };
  }

  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return ensureProfileExists(user);
}

// ─── 3. Social Login (Google, Facebook, Microsoft) ────────────────────────
export async function loginWithGoogle(): Promise<Member> {
  const result = await signInWithPopup(auth, googleProvider);
  return ensureProfileExists(result.user);
}

export async function loginWithFacebook(): Promise<Member> {
  const result = await signInWithPopup(auth, facebookProvider);
  return ensureProfileExists(result.user);
}

export async function loginWithMicrosoft(): Promise<Member> {
  const result = await signInWithPopup(auth, microsoftProvider);
  return ensureProfileExists(result.user);
}

// ─── 4. Phone / OTP Authentication ────────────────────────────────────────
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function initRecaptcha(containerId: string = 'recaptcha-container'): void {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => { /* reCAPTCHA solved */ },
    });
  }
}

export async function sendPhoneOTP(phoneNumber: string): Promise<ConfirmationResult> {
  if (!recaptchaVerifier) {
    initRecaptcha();
  }
  const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier!);
  return confirmation;
}

export async function verifyPhoneOTP(
  confirmation: ConfirmationResult,
  otp: string
): Promise<Member> {
  const result = await confirmation.confirm(otp);
  return ensureProfileExists(result.user);
}

// ─── 5. Password Reset ────────────────────────────────────────────────────
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// ─── 6. Logout ────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// ─── 7. Get Profile ──────────────────────────────────────────────────────
export async function getCurrentMemberProfile(uid: string): Promise<Member | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as Member;
}

// ─── 8. Auth State Observer ───────────────────────────────────────────────
export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ─── 9. Translate Firebase Auth error codes → French ─────────────────────
export function translateAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use':      'Cet e-mail est déjà associé à un compte.',
    'auth/invalid-email':             "L'adresse e-mail n'est pas valide.",
    'auth/user-not-found':            'Aucun compte trouvé avec cet e-mail.',
    'auth/wrong-password':            'Mot de passe incorrect.',
    'auth/invalid-credential':        'E-mail ou mot de passe incorrect.',
    'auth/too-many-requests':         'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
    'auth/network-request-failed':    'Erreur réseau. Vérifiez votre connexion internet.',
    'auth/user-disabled':             'Ce compte a été désactivé. Contactez le support IBC.',
    'auth/weak-password':             'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/operation-not-allowed':     'Cette méthode de connexion n\'est pas activée.',
    'auth/popup-closed-by-user':      'La fenêtre de connexion a été fermée.',
    'auth/requires-recent-login':     'Veuillez vous reconnecter pour effectuer cette action.',
    'auth/account-exists-with-different-credential': 'Un compte existe déjà avec cet e-mail via une autre méthode de connexion.',
    'auth/credential-already-in-use': 'Ces identifiants sont déjà associés à un compte.',
    'auth/invalid-verification-code': 'Code de vérification invalide.',
    'auth/invalid-phone-number':      'Numéro de téléphone invalide. Utilisez le format international (+225).',
    'auth/quota-exceeded':            'Trop de tentatives SMS. Veuillez réessayer dans une heure.',
    'auth/captcha-check-failed':      'Vérification anti-robot échouée. Veuillez réessayer.',
    'auth/missing-phone-number':      'Veuillez saisir votre numéro de téléphone.',
  };
  return map[code] ?? 'Une erreur est survenue. Veuillez réessayer.';
}

// ─── 10. Social auth error helper ─────────────────────────────────────────
export function translateSocialAuthError(error: any): string {
  if (!error) return 'Erreur inconnue.';
  const code = error.code || '';
  if (code === 'auth/popup-blocked') {
    return 'La fenêtre de connexion a été bloquée. Autorisez les popups pour ce site.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Connexion annulée.';
  }
  if (code?.includes('microsoft')) {
    return 'La connexion Microsoft a échoué. Vérifiez que le provider est activé dans Firebase.';
  }
  return translateAuthError(code);
}