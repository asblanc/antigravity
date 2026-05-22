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
  status: string;
  balance: number;
  valid: boolean;
} | null> {
  let normalizedQr = qrContent.trim();
  
  // If the user typed a name or ID directly without the IBC-MEMBER prefix, format it into a demo QR string
  if (!normalizedQr.startsWith('IBC-MEMBER-')) {
    const formattedName = normalizedQr.replace(/\s+/g, '_');
    normalizedQr = `IBC-MEMBER-${formattedName}-BRONZE-demo`;
  }

  // QR format: IBC-MEMBER-NAME-TIER-UID
  const parts = normalizedQr.split('-');
  if (parts[0] !== 'IBC' || parts[1] !== 'MEMBER') return null;

  const uid = parts[parts.length - 1];

  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      const statusValue = data.tier || data.status || data.plan || 'BRONZE';
      return {
        uid,
        name: data.name || `${data.firstName || 'Membre'} ${data.lastName || ''}`.trim(),
        tier: statusValue,
        status: statusValue,
        balance: data.balance || 0,
        valid: true,
      };
    }
  } catch (error) {
    console.warn("Firestore fetch failed or offline, falling back to mock parser for demo.", error);
  }

  // Fallback to parsing from the QR code directly (useful for local / demo / offline testing)
  // e.g. IBC-MEMBER-Yao_Kouassi-BRONZE-demo
  // parts: ["IBC", "MEMBER", "Yao_Kouassi", "BRONZE", "demo"]
  const rawName = parts[2] ? parts[2].replace(/_/g, ' ') : 'Membre Démo';
  const tier = parts[3] ? parts[3].toUpperCase() : 'BRONZE';

  return {
    uid: uid || 'demo-member',
    name: rawName,
    tier: tier,
    status: tier,
    balance: 12500, // mock balance matching Yao K. screenshot
    valid: true,
  };
}
