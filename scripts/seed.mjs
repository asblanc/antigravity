import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, '../service-account-key.json');

initializeApp({
  credential: cert(serviceAccountPath)
});

const db = getFirestore();

async function seed() {
  console.log('🌱 Initialisation Firestore...\n');

  // CONFIG PLATFORM
  await db.collection('config').doc('platform').set({
    platformName      : 'Ivoire Business Club',
    contactPhone      : '+225 704 14 13 13',
    contactEmail      : 'contact@ivoirebusinessclub.com',
    whatsapp          : '225704141313',
    currency          : 'FCFA',
    partnerRate       : 0.90,
    commissionRate    : 0.07,
    cashbackRate      : 0.03,
    cashbackRates     : { BRONZE: 0.03, SILVER: 0.04, GOLD: 0.05 },
    subscriptionAmount: 500,
    totalCommissions  : 0,
    totalTransactions : 0,
    updatedAt         : Timestamp.now(),
  });
  console.log('✅ Config platform créée');

  // PARTENAIRES DEMO
  const partners = [
    {
      uid              : 'partner-demo-1',
      structureName    : 'Le Grand Restaurant',
      activityType     : 'restaurant',
      city             : 'Abidjan - Plateau',
      description      : 'Restaurant gastronomique premium',
      isVerified       : true,
      revenue          : 0,
      totalTransactions: 0,
      memberId         : 'IBC-P-000001',
      stars            : 5,
      images           : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'],
      role             : 'partner',
    },
    {
      uid              : 'partner-demo-2',
      structureName    : 'Assinie Villa',
      activityType     : 'hotel',
      city             : 'Assinie',
      description      : 'Villa de luxe en bord de mer',
      isVerified       : true,
      revenue          : 0,
      totalTransactions: 0,
      memberId         : 'IBC-P-000002',
      stars            : 5,
      images           : ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80'],
      role             : 'partner',
    },
    {
      uid              : 'partner-demo-3',
      structureName    : 'Sky Lounge',
      activityType     : 'lounge',
      city             : 'Abidjan - Cocody',
      description      : 'Lounge VIP vue panoramique',
      isVerified       : true,
      revenue          : 0,
      totalTransactions: 0,
      memberId         : 'IBC-P-000003',
      stars            : 4,
      images           : [],
      role             : 'partner',
    },
  ];

  for (const p of partners) {
    await db.collection('partners').doc(p.uid).set({
      ...p, createdAt: Timestamp.now()
    });
    console.log(`✅ Partenaire : ${p.structureName}`);
  }

  // SERVICES DEMO
  const services = [
    { partnerId:'partner-demo-1', name:'-15% sur tous les plats',
      description:'Réduction 15% sur la carte', price:0,
      category:'reduction', isActive:true },
    { partnerId:'partner-demo-1', name:'Menu VIP offert',
      description:'Menu dégustation membres Gold', price:0,
      category:'offre', isActive:true },
    { partnerId:'partner-demo-2', name:'-20% sur les chambres',
      description:'Réduction exclusive chambres', price:0,
      category:'reduction', isActive:true },
    { partnerId:'partner-demo-2', name:'Spa gratuit',
      description:'Accès spa avec réservation', price:0,
      category:'offre', isActive:true },
    { partnerId:'partner-demo-3', name:'-10% sur les consommations',
      description:'Réduction boissons et plats', price:0,
      category:'reduction', isActive:true },
    { partnerId:'partner-demo-3', name:'Accès VIP',
      description:'Zone VIP membres IBC', price:0,
      category:'offre', isActive:true },
  ];

  for (const s of services) {
    await db.collection('services').add({
      ...s, createdAt: Timestamp.now()
    });
    console.log(`✅ Service : ${s.name}`);
  }

  console.log('\n✅ Firestore initialisé avec succès !');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Erreur :', err);
  process.exit(1);
});
