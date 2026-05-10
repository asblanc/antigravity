// Transaction Service — IVOIRE BUSINESS CLUB (IBC)
// Handles cashback transactions in Firestore

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction } from './mock-api';

// ─── Get member transactions ──────────────────────────────────────────────────
export async function getMemberTransactions(uid: string, maxItems = 20): Promise<Transaction[]> {
  const q = query(
    collection(db, 'transactions'),
    where('memberId', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(maxItems)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      partnerName: data.partnerName,
      date: data.createdAt?.toDate
        ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(data.createdAt.toDate())
        : 'Date inconnue',
      amount: data.amount,
      cashback: data.cashback,
      status: data.status as 'confirmed' | 'pending',
    };
  });
}

// ─── Record a new cashback transaction ───────────────────────────────────────
export async function recordTransaction(data: {
  memberId: string;
  partnerId: string;
  partnerName: string;
  amount: number;
}): Promise<string> {
  // 1. Fetch platform config and member status
  const configSnap = await getDoc(doc(db, 'config', 'platform'));
  const config = configSnap.data() || { cashbackRates: { BRONZE: 0.03, SILVER: 0.04, GOLD: 0.05 }, cashbackRate: 0.03, partnerRate: 0.07 };
  
  const memberSnap = await getDoc(doc(db, 'users', data.memberId));
  const memberStatus = memberSnap.data()?.status ?? 'BRONZE';
  
  const cashbackRate = config.cashbackRates?.[memberStatus] ?? config.cashbackRate ?? 0.03;
  const partnerRate = config.partnerRate ?? 0.07;
  
  const memberCashback = Math.round(data.amount * cashbackRate);
  const partnerShare   = Math.round(data.amount * partnerRate);
  const platformFee    = data.amount - memberCashback - partnerShare;

  // 2. Create transaction document
  const txRef = await addDoc(collection(db, 'transactions'), {
    memberId: data.memberId,
    partnerId: data.partnerId,
    partnerName: data.partnerName,
    amount: data.amount,
    cashback: memberCashback,
    cashbackRate: cashbackRate,
    partnerShare,
    platformCommission: platformFee,
    status: 'confirmed',
    createdAt: serverTimestamp(),
  });

  // 3. Increment member balance and totalSpent
  await updateDoc(doc(db, 'users', data.memberId), {
    balance: increment(memberCashback),
    totalSpent: increment(data.amount),
    visitsThisMonth: increment(1),
  });

  return txRef.id;
}

// ─── Get partner's recent validated transactions ──────────────────────────────
export async function getPartnerTransactions(partnerId: string, maxItems = 50): Promise<any[]> {
  const q = query(
    collection(db, 'transactions'),
    where('partnerId', '==', partnerId),
    orderBy('createdAt', 'desc'),
    limit(maxItems)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const { platformCommission, ...publicData } = data;
    return {
      id: d.id,
      ...publicData,
      date: data.createdAt?.toDate
        ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(data.createdAt.toDate())
        : 'Date inconnue',
    };
  });
}
