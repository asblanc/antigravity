// Seed script — IVOIRE BUSINESS CLUB (IBC)
// Run once to initialize Firestore with demo data and platform config
// Usage: node execution/seed_firestore.mjs

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ─── Config ───────────────────────────────────────────────────────────────────
// Utilise les Application Default Credentials (ADC)
// Commande avant d'exécuter : gcloud auth application-default login
initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || 'ivoire-business-club' });

const db = getFirestore();

// ─── Platform Config ──────────────────────────────────────────────────────────
async function seedConfig() {
  await db.collection('config').doc('platform').set({
    platformName      : 'Ivoire Business Club',
    contactPhone      : '+225 704 14 13 13',
    contactEmail      : 'contact@ivoirebusinessclub.com',
    whatsapp          : '225704141313',
    currency          : 'FCFA',
    partnerRate       : 0.90,
    commissionRate    : 0.07,
    cashbackRate      : 0.03,
    cashbackRates     : {
      BRONZE : 0.03,
      SILVER : 0.04,
      GOLD   : 0.05,
    },
    subscriptionAmount: 500,
    totalCommissions  : 0,
    totalTransactions : 0,
    updatedAt         : Timestamp.now(),
  });
  console.log('✅ Config platform seeded');
}

// ─── Demo Admin User ──────────────────────────────────────────────────────────
async function seedAdmin() {
  // Créer d'abord ce compte dans Firebase Auth Console
  // Email : admin@ivoirebusinessclub.com
  // Puis remplacer REPLACE_WITH_ADMIN_UID par le vrai UID
  const ADMIN_UID = 'REPLACE_WITH_ADMIN_UID';

  await db.collection('users').doc(ADMIN_UID).set({
    uid          : ADMIN_UID,
    role         : 'admin',
    firstName    : 'Admin',
    lastName     : 'IBC',
    email        : 'admin@ivoirebusinessclub.com',
    memberId     : 'IBC-ADMIN1',
    status       : 'GOLD',
    balance      : 0,
    cashbackTotal: 0,
    createdAt    : Timestamp.now(),
  });
  console.log('✅ Admin seeded — mets à jour le UID dans Firebase Auth Console');
}

// ─── Demo Partners ────────────────────────────────────────────────────────────
async function seedPartners() {
  const partners = [
    {
      structureName    : 'Le Grand Restaurant',
      email            : 'grandrestaurant@demo.ibc',
      activityType     : 'restaurant',
      city             : 'Abidjan - Plateau',
      address          : 'Avenue Botreau Roussel, Plateau, Abidjan',
      description      : 'Restaurant gastronomique premium au cœur du Plateau',
      isVerified       : true,
      revenue          : 0,
      totalTransactions: 0,
      memberId         : 'IBC-P-000001',
      stars            : 5,
      images           : [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'
      ],
      role             : 'partner',
      status           : 'active',
    },
    {
      structureName    : 'Assinie Villa',
      email            : 'assinie@demo.ibc',
      activityType     : 'hotel',
      city             : 'Assinie',
      address          : 'Bord de mer, Assinie-Mafia',
      description      : 'Villa de luxe en bord de mer à Assinie',
      isVerified       : true,
      revenue          : 0,
      totalTransactions: 0,
      memberId         : 'IBC-P-000002',
      stars            : 5,
      images           : [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'
      ],
      role             : 'partner',
      status           : 'active',
    },
    {
      structureName    : 'Sky Lounge',
      email            : 'skylounge@demo.ibc',
      activityType     : 'lounge',
      city             : 'Abidjan - Cocody',
      address          : 'Riviera 3, Cocody, Abidjan',
      description      : 'Lounge VIP avec vue panoramique sur Abidjan',
      isVerified       : true,
      revenue          : 0,
      totalTransactions: 0,
      memberId         : 'IBC-P-000003',
      stars            : 4,
      images           : [],
      role             : 'partner',
      status           : 'active',
    },
    {
      structureName    : 'Sofitel Abidjan Hôtel Ivoire',
      email            : 'sofitel@demo.ibc',
      activityType     : 'hotel',
      city             : 'Abidjan - Cocody',
      address          : 'Boulevard Hassan II, Cocody, Abidjan',
      description      : 'Palace 5 étoiles, piscine, spa, bowling et restaurants',
      isVerified       : true,
      revenue          : 0,
      totalTransactions: 0,
      memberId         : 'IBC-P-000004',
      stars            : 5,
      images           : [
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80'
      ],
      role             : 'partner',
      status           : 'active',
    },
    {
      structureName    : 'Pullman Abidjan',
      email            : 'pullman@demo.ibc',
      activityType     : 'hotel',
      city             : 'Abidjan - Plateau',
      address          : 'Avenue Houdaille, Plateau, Abidjan',
      description      : 'Hôtel business premium, piscine, spa et espaces événementiels',
      isVerified       : true,
      revenue          : 0,
      totalTransactions: 0,
      memberId         : 'IBC-P-000005',
      stars            : 5,
      images           : [
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80'
      ],
      role             : 'partner',
      status           : 'active',
    },
  ];

  for (const partner of partners) {
    const ref = db.collection('partners').doc();
    await ref.set({ ...partner, createdAt: Timestamp.now() });
    console.log(`✅ Partner seeded : ${partner.structureName} [${ref.id}]`);
  }
}

// ─── Demo Services ────────────────────────────────────────────────────────────
async function seedServices() {
  const services = [
    {
      partnerId  : 'partner-demo-1',
      name       : '-15% sur tous les plats',
      description: 'Réduction de 15% sur l\'ensemble de la carte',
      price      : 0,
      category   : 'reduction',
      isActive   : true,
    },
    {
      partnerId  : 'partner-demo-1',
      name       : 'Menu VIP offert',
      description: 'Menu dégustation offert pour les membres Gold',
      price      : 0,
      category   : 'offre',
      isActive   : true,
    },
    {
      partnerId  : 'partner-demo-2',
      name       : '-20% sur les chambres',
      description: 'Réduction exclusive sur toutes les chambres',
      price      : 0,
      category   : 'reduction',
      isActive   : true,
    },
    {
      partnerId  : 'partner-demo-2',
      name       : 'Spa gratuit',
      description: 'Accès spa offert avec toute réservation',
      price      : 0,
      category   : 'offre',
      isActive   : true,
    },
    {
      partnerId  : 'partner-demo-3',
      name       : '-10% sur les consommations',
      description: 'Réduction sur toutes les boissons et plats',
      price      : 0,
      category   : 'reduction',
      isActive   : true,
    },
    {
      partnerId  : 'partner-demo-3',
      name       : 'Accès VIP',
      description: 'Accès zone VIP réservée aux membres IBC',
      price      : 0,
      category   : 'offre',
      isActive   : true,
    },
  ];

  for (const service of services) {
    const ref = db.collection('services').doc();
    await ref.set({ ...service, createdAt: Timestamp.now() });
    console.log(`✅ Service seeded : ${service.name}`);
  }
}

// ─── Demo Member ──────────────────────────────────────────────────────────────
async function seedDemoMember() {
  // Créer d'abord ce compte dans Firebase Auth Console
  // Email : demo@ibc.ci | Password : Demo1234!
  // Puis remplacer REPLACE_WITH_DEMO_MEMBER_UID par le vrai UID
  const DEMO_UID = 'REPLACE_WITH_DEMO_MEMBER_UID';

  await db.collection('users').doc(DEMO_UID).set({
    uid          : DEMO_UID,
    role         : 'member',
    firstName    : 'Kofi',
    lastName     : 'Kouassi',
    email        : 'demo@ibc.ci',
    phone        : '+225 07 00 00 00 00',
    idCard       : 'CNI-DEMO-0001',
    memberId     : 'IBC-DM0001',
    status       : 'BRONZE',
    balance      : 0,
    cashbackTotal: 0,
    subscription : {
      active         : true,
      amount         : 500,
      nextBillingDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    createdAt    : Timestamp.now(),
  });

  await db.collection('wallets').doc(DEMO_UID).set({
    userId      : DEMO_UID,
    balance     : 0,
    transactions: [],
    createdAt   : Timestamp.now(),
  });

  console.log('✅ Demo member seeded');
}

// ─── Run ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding Firestore — IVOIRE BUSINESS CLUB...\n');
  await seedConfig();
  await seedAdmin();
  await seedPartners();
  await seedServices();
  await seedDemoMember();
  console.log('\n✅ Tout est prêt ! Vérifie Firebase Console → Firestore');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed :', err);
  process.exit(1);
});
