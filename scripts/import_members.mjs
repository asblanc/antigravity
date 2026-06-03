#!/usr/bin/env node
/**
 * import_members.mjs — IVOIRE BUSINESS CLUB
 * ----------------------------------------------------------------------------
 * Importe des membres depuis un fichier Excel vers Supabase :
 *   - crée le compte Auth (service_role) + déclenche le profil (trigger),
 *   - met à jour tier / points / balance / whatsapp.
 *
 * ⚠️ Utilise la clé SERVICE_ROLE (pleins pouvoirs) — À EXÉCUTER LOCALEMENT
 *    UNIQUEMENT, jamais côté navigateur.
 *
 * Prérequis (.env à la racine) :
 *   VITE_SUPABASE_URL=...                (ou SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY=...        (Dashboard Supabase > Settings > API)
 *
 * Usage :
 *   node scripts/import_members.mjs chemin/vers/membres.xlsx
 *
 * Colonnes reconnues (insensibles à la casse, ordre libre) :
 *   email (obligatoire), prenom/firstName, nom/lastName, name, whatsapp/phone,
 *   tier/niveau (bronze|silver|gold|platinum), points, balance/solde
 * ----------------------------------------------------------------------------
 */
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FILE = process.argv[2];

if (!URL || !KEY) {
  console.error('❌ VITE_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis dans .env');
  process.exit(1);
}
if (!FILE) {
  console.error('❌ Usage : node scripts/import_members.mjs <fichier.xlsx>');
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const TIERS = ['bronze', 'silver', 'gold', 'platinum'];
const norm = (s) => String(s ?? '').trim();
const num = (v) => { const n = Number(String(v ?? '').replace(/[^\d.-]/g, '')); return Number.isFinite(n) ? n : 0; };

// Récupère une valeur de ligne par mots-clés de colonne.
function pick(row, keys) {
  for (const k of Object.keys(row)) {
    const lk = k.toLowerCase().trim();
    if (keys.some((kw) => lk === kw || lk.includes(kw))) return row[k];
  }
  return undefined;
}

function randomPassword() {
  return 'Ibc' + Math.random().toString(36).slice(2, 10) + '!' + Math.floor(Math.random() * 90 + 10);
}

async function main() {
  const buf = await readFile(FILE);
  const wb = XLSX.read(buf, { type: 'buffer' });

  let imported = 0, skipped = 0, failed = 0;

  for (const sheetName of wb.SheetNames) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
    for (const row of rows) {
      const email = norm(pick(row, ['email', 'mail', 'e-mail'])).toLowerCase();
      if (!email || !email.includes('@')) { skipped++; continue; }

      const first = norm(pick(row, ['prenom', 'firstname', 'first name']));
      const last = norm(pick(row, ['nom', 'lastname', 'last name', 'surname']));
      const name = norm(pick(row, ['name', 'nom complet', 'fullname'])) || [first, last].filter(Boolean).join(' ') || 'Membre';
      const whatsapp = norm(pick(row, ['whatsapp', 'phone', 'tel', 'téléphone', 'telephone', 'mobile']));
      let tier = norm(pick(row, ['tier', 'niveau', 'plan'])).toLowerCase();
      if (!TIERS.includes(tier)) tier = 'bronze';
      const points = Math.round(num(pick(row, ['points', 'point'])));
      const balance = num(pick(row, ['balance', 'solde', 'cagnotte']));

      // 1) Création du compte Auth (le trigger crée le profil).
      const { data: created, error: cErr } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword(),
        email_confirm: true,
        user_metadata: { name, role: 'member' },
      });

      if (cErr) {
        if (/already|registered|exists/i.test(cErr.message)) { skipped++; }
        else { failed++; console.warn(`✗ ${email} : ${cErr.message}`); }
        continue;
      }

      const uid = created.user?.id;
      // 2) Mise à jour des champs privilégiés (service_role contourne la RLS).
      const { error: uErr } = await supabase
        .from('profiles')
        .update({ name, whatsapp, tier, points, balance })
        .eq('id', uid);

      if (uErr) { failed++; console.warn(`✗ profil ${email} : ${uErr.message}`); continue; }

      imported++;
      console.log(`✓ ${email} (${tier})`);
    }
  }

  console.log(`\n── Import terminé ──\n  Importés : ${imported}\n  Ignorés (existants/invalides) : ${skipped}\n  Échecs : ${failed}`);
}

main().catch((e) => { console.error('Erreur fatale :', e); process.exit(1); });
