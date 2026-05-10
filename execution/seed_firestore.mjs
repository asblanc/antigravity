// Seed script — IVOIRE BUSINESS CLUB (IBC)
// Run once to initialize Firestore with demo data and platform config
// Usage: node execution/seed_firestore.mjs

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// ─── Config ──────────────────────────────────────────────────────────────────
// Option A: Use service account JSON
// const serviceAccount = JSON.parse(readFileSync('./credentials.json', 'utf8'));
// initializeApp({ credential: cert(serviceAccount), projectId: 'ivoire-business-club' });

// Option B: Use Application Default Credentials (ADC) — works after `gcloud auth login`
initializeApp({ projectId: 'ivoire-business-club' });

const db = getFirestore();

// ─── Platform Config ─────────────────────────────────────────────────────────
async function seedConfig() {
  await db.collection('config').doc('cashback').set({
    defaultRate: 0.10,          // 10% cashback for all partners
    membershipFee: 500,         // FCFA/month
    tiers: {
      bronze: { minSpent: 0,      cashbackBonus: 0 },
      silver: { minSpent: 500000, cashbackBonus: 0.02 }, // +2%
      gold:   { minSpent: 2000000, cashbackBonus: 0.05 }, // +5%
    },
    updatedAt: Timestamp.now(),
  });
  console.log('✅ Config seeded');
}

// ─── Demo Admin User ──────────────────────────────────────────────────────────
async function seedAdmin() {
  // NOTE: Create this user first in Firebase Auth console, then update the UID here
  const ADMIN_UID = 'REPLACE_WITH_ADMIN_UID';
  await db.collection('users').doc(ADMIN_UID).set({
    name: 'Admin IBC',
    email: 'admin@ivoirebusinessclub.com',
    role: 'admin',
    createdAt: Timestamp.now(),
  });
  console.log('✅ Admin user seeded (update UID in Auth console)');
}

// ─── Demo Partners ────────────────────────────────────────────────────────────
async function seedPartners() {
  const partners = [
    {
      businessName: 'Sofitel Abidjan Hôtel Ivoire',
      email: 'sofitel@demo.ibc',
      category: 'hotel',
      address: 'Boulevard Hassan II, Cocody, Abidjan',
      cashbackRate: 0.10,
      status: 'active',
      role: 'partner',
      whatsapp: '+225 27 20 49 00 00',
    },
    {
      businessName: 'Le Grand Large',
      email: 'grandlarge@demo.ibc',
      category: 'restaurant',
      address: 'Zone 4C, Marcory, Abidjan',
      cashbackRate: 0.10,
      status: 'active',
      role: 'partner',
      whatsapp: '+225 07 00 00 00 01',
    },
    {
      businessName: 'Pullman Abidjan',
      email: 'pullman@demo.ibc',
      category: 'hotel',
      address: 'Avenue Houdaille, Plateau, Abidjan',
      cashbackRate: 0.10,
      status: 'active',
      role: 'partner',
      whatsapp: '+225 27 20 20 63 00',
    },
  ];

  for (const partner of partners) {
    const ref = db.collection('users').doc();
    await ref.set({ ...partner, createdAt: Timestamp.now() });
    console.log(`✅ Partner seeded: ${partner.businessName} [${ref.id}]`);
  }
}

// ─── Demo Member ──────────────────────────────────────────────────────────────
async function seedDemoMember() {
  // NOTE: Create this user in Firebase Auth first (email: demo@ibc.ci, password: Demo1234!)
  const DEMO_UID = 'REPLACE_WITH_DEMO_MEMBER_UID';
  await db.collection('users').doc(DEMO_UID).set({
    name: 'M. Kouassi',
    email: 'demo@ibc.ci',
    whatsapp: '+225 07 00 00 00 00',
    tier: 'silver',
    balance: 45000,
    totalSpent: 1250000,
    visitsThisMonth: 14,
    qrCode: `IBC-MEMBER-M-KOUASSI-SILVER-${DEMO_UID}`,
    memberCode: 'IBC00001',
    role: 'member',
    createdAt: Timestamp.now(),
  });
  console.log('✅ Demo member seeded');
}

// ─── Run ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding Firestore for IVOIRE BUSINESS CLUB...\n');
  await seedConfig();
  await seedAdmin();
  await seedPartners();
  await seedDemoMember();
  console.log('\n✅ All done! Check Firebase Console → Firestore');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
