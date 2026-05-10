// Partner Service — IVOIRE BUSINESS CLUB (IBC)
// Manages partner registration and QR code validation

import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, db } from './firebase';

export interface Partner {
  uid: string;
  businessName: string;
  email: string;
  whatsapp: string;
  category: string;
  cashbackRate: number;
  address: string;
  role: 'partner';
}

// ─── Register a new partner ───────────────────────────────────────────────────
export async function registerPartner(data: {
  businessName: string;
  email: string;
  password: string;
  whatsapp: string;
  category: string;
  address: string;
  cashbackRate?: number;
}): Promise<Partner> {
  const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);

  const partnerData = {
    businessName: data.businessName,
    email: data.email,
    whatsapp: data.whatsapp,
    category: data.category,
    address: data.address,
    cashbackRate: data.cashbackRate ?? 0.1, // default 10%
    role: 'partner' as const,
    status: 'pending', // admin must approve
    createdAt: serverTimestamp(),
  };

  await addDoc(doc(db, 'users', user.uid) as any, partnerData);
  // Use setDoc instead:
  const { setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'users', user.uid), partnerData);

  return { uid: user.uid, ...partnerData };
}

// ─── Get all active partners (for homepage / offers) ─────────────────────────
export async function getActivePartners(): Promise<Partner[]> {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'partner'),
    where('status', '==', 'active')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as Partner));
}

// ─── Validate a QR code scanned by a partner ─────────────────────────────────
export async function validateMemberQR(qrContent: string): Promise<{
  uid: string;
  name: string;
  tier: string;
  balance: number;
  valid: boolean;
} | null> {
  // QR format: IBC-MEMBER-NAME-TIER-UID
  const parts = qrContent.split('-');
  if (parts[0] !== 'IBC' || parts[1] !== 'MEMBER') return null;

  const uid = parts[parts.length - 1];

  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  return {
    uid,
    name: data.name,
    tier: data.tier,
    balance: data.balance,
    valid: true,
  };
}
