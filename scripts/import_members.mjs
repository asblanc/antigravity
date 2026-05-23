#!/usr/bin/env node
/**
 * Import members from XLSX file to Firestore
 * Header-aware: detects columns by header name, not fixed position.
 *
 * Usage:
 *   node scripts/import_members.mjs <path-to-xlsx>
 *
 * Example:
 *   node scripts/import_members.mjs "/Users/info/Downloads/Membre du Club.xlsx"
 *
 * The XLSX file must have sheets named Bronze, Argent, Or (or similar).
 * Headers are matched flexibly (casse, accents, espaces ignorés).
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, '../service-account-key.json');

// ─── Firebase Admin init ───────────────────────────────────────────────────
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ service-account-key.json introuvable. Placez-le à la racine du projet.');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccountPath) });
const db = getFirestore();

// ─── Column mapping (flexible matching) ────────────────────────────────────

/**
 * Normalize a header string for matching:
 * - lowercase, remove accents, trim, collapse whitespace, remove punctuation
 */
function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove accents
    .replace(/[^a-z0-9\s]/g, '')                       // remove punctuation
    .replace(/\s+/g, ' ')                               // collapse spaces
    .trim();
}

/** Known column patterns with their target field name and aliases */
const COLUMN_PATTERNS = [
  { field: 'cardNumber', patterns: ['carte n', 'carte', 'numero carte', 'n carte', 'no carte', 'card number', 'n° carte'] },
  { field: 'lastName',   patterns: ['nom', 'last name', 'surname', 'family name', 'nom de famille'] },
  { field: 'firstName',  patterns: ['prenoms', 'prenom', 'first name', 'given name', 'firstnames'] },
  { field: 'phone',      patterns: ['mobil', 'mobile', 'telephone', 'phone', 'tel', 'portable', 'cellulaire'] },
  { field: 'whatsapp',   patterns: ['whatsapp', 'whats app', 'whats'] },
  { field: 'email',      patterns: ['email', 'e mail', 'courriel', 'mail'] },
  { field: 'company',    patterns: ['compagnie', 'company', 'societe', 'entreprise', 'structure', 'employeur'] },
  { field: 'joinDate',   patterns: ["date d adhesion", "date adhesion", "date d'inscription", "join date", "inscription", 'adhesion'] },
  { field: 'expireDate', patterns: ["date d expiration", "date expiration", "expiration", "expire date", "date d'expiration"] },
  { field: 'points',     patterns: ['nbre de points', 'points', 'nombre points', 'nb points', 'total points', 'point'] },
];

/** Find which field a header maps to, or null if unknown */
function matchColumn(header) {
  const n = normalize(header);
  if (!n) return null;
  for (const col of COLUMN_PATTERNS) {
    for (const pat of col.patterns) {
      const np = normalize(pat);
      if (n === np || n.includes(np) || np.includes(n)) return col.field;
    }
  }
  return null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Convert Excel serial date number to Date object */
function excelSerialToDate(serial) {
  if (typeof serial !== 'number') return null;
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(epoch.getTime() + serial * 86400000);
  return isNaN(date.getTime()) ? null : date;
}

/** Parse a cell value as Firestore Timestamp */
function parseDateCell(cellValue) {
  if (cellValue == null) return null;
  if (typeof cellValue === 'number') {
    const d = excelSerialToDate(cellValue);
    return d ? Timestamp.fromDate(d) : null;
  }
  if (typeof cellValue === 'string') {
    const trimmed = cellValue.trim();
    if (!trimmed) return null;
    // direct parse
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return Timestamp.fromDate(d);
    // dd/mm/yyyy
    const parts = trimmed.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const d2 = new Date(Date.UTC(year, month, day));
        if (!isNaN(d2.getTime())) return Timestamp.fromDate(d2);
      }
    }
  }
  return null;
}

function cleanStr(val) {
  if (val == null) return '';
  if (typeof val === 'number') return String(val);
  return String(val).trim();
}

// ─── Main import ──────────────────────────────────────────────────────────

async function importMembers(xlsxPath) {
  if (!xlsxPath) {
    console.error('❌ Usage: node scripts/import_members.mjs <path-to-xlsx>');
    process.exit(1);
  }

  if (!fs.existsSync(xlsxPath)) {
    console.error(`❌ Fichier introuvable : ${xlsxPath}`);
    process.exit(1);
  }

  console.log(`📂 Lecture du fichier : ${xlsxPath}\n`);

  const workbook = XLSX.readFile(xlsxPath);
  const sheetNames = workbook.SheetNames;

  // Try to match sheets to tiers
  const tierMap = {};
  for (const name of sheetNames) {
    const n = normalize(name);
    if (n.includes('bronze') || n.includes('bronz')) tierMap[name] = 'bronze';
    else if (n.includes('argent') || n.includes('silver')) tierMap[name] = 'silver';
    else if (n.includes('or') || n.includes('gold')) tierMap[name] = 'gold';
    else tierMap[name] = 'bronze'; // default fallback
  }

  let totalImported = 0;
  let totalSkipped = 0;
  const report = []; // per-sheet summary

  for (const sheetName of sheetNames) {
    const tier = tierMap[sheetName];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    console.log(`\n📋 Feuille : "${sheetName}" → niveau "${tier}" — ${rows.length} lignes brutes`);

    // Find header row by scanning for known column headers
    let headerRowIdx = -1;
    let headerRow = null;
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const row = rows[i];
      if (!Array.isArray(row)) continue;
      const matched = row.map(h => matchColumn(cleanStr(h))).filter(Boolean);
      if (matched.length >= 2) {
        headerRowIdx = i;
        headerRow = row;
        break;
      }
    }

    if (headerRowIdx === -1) {
      console.warn(`⚠️  Aucun en-tête reconnu dans la feuille "${sheetName}". Ignorée.`);
      report.push({ sheet: sheetName, tier, status: '⚠️ En-tête non trouvé', imported: 0, skipped: 0, recognized: [] });
      continue;
    }

    // Build column mapping: index → field name
    const columnMap = {};
    const recognizedCols = [];
    const ignoredCols = [];
    for (let c = 0; c < headerRow.length; c++) {
      const h = cleanStr(headerRow[c]);
      const field = matchColumn(h);
      if (field) {
        columnMap[c] = field;
        recognizedCols.push(h);
      } else if (h) {
        ignoredCols.push(h);
      }
    }

    console.log(`  ✅ En-tête reconnu : ${recognizedCols.length} colonne(s) → ${recognizedCols.join(', ')}`);
    if (ignoredCols.length > 0) {
      console.log(`  ⚠️  Colonnes ignorées : ${ignoredCols.join(', ')}`);
    }

    // Check required fields
    const hasRequired = columnMap.cardNumber != null || columnMap.email != null;
    const hasName = columnMap.lastName != null || columnMap.firstName != null;
    if (!hasRequired || !hasName) {
      console.warn(`  ⚠️  Champs obligatoires manquants (Carte N° ou Email + Nom/Prénom). Feuille ignorée.`);
      report.push({ sheet: sheetName, tier, status: '⚠️ Obligatoires manquants', imported: 0, skipped: rows.length - headerRowIdx - 1, recognized: recognizedCols });
      continue;
    }

    // Check for optional warnings
    if (columnMap.points == null) console.log('  ⚠️  Colonne "Nbre de points" absente — les points seront à 0');
    if (columnMap.joinDate == null) console.log('  ⚠️  Colonne "Date d\'adhésion" absente');
    if (columnMap.expireDate == null) console.log('  ⚠️  Colonne "Date d\'expiration" absente');

    // Process data rows
    const dataRows = rows.slice(headerRowIdx + 1);
    let sheetImported = 0;
    let sheetSkipped = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      if (!Array.isArray(row)) { sheetSkipped++; continue; }

      // Extract fields using the column map
      const getField = (field) => {
        for (const [colIdx, f] of Object.entries(columnMap)) {
          if (f === field) return row[parseInt(colIdx)];
        }
        return undefined;
      };

      const cardNumber = cleanStr(getField('cardNumber'));
      const lastName   = cleanStr(getField('lastName'));
      const firstName  = cleanStr(getField('firstName'));

      // Skip rows without at least cardNumber OR (lastName or firstName)
      if (!cardNumber && !lastName && !firstName) { sheetSkipped++; continue; }

      const phone      = cleanStr(getField('phone'));
      const whatsapp   = cleanStr(getField('whatsapp'));
      const email      = cleanStr(getField('email'));
      const company    = cleanStr(getField('company'));
      const joinDate   = parseDateCell(getField('joinDate'));
      const expireDate = parseDateCell(getField('expireDate'));
      const pointsRaw  = getField('points');
      const points     = typeof pointsRaw === 'number' ? Math.round(pointsRaw) : 0;

      // Generate uid: prefer cardNumber, then email hash, then fallback
      let uid;
      if (cardNumber) {
        uid = `member-${cardNumber}`;
      } else if (email) {
        uid = `member-${email.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
      } else {
        uid = `member-${tier}-${lastName}-${firstName}`.toLowerCase().replace(/\s+/g, '-');
      }

      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || `Membre ${tier}`;

      const memberDoc = {
        cardNumber: cardNumber || null,
        firstName: firstName || null,
        lastName: lastName || null,
        name: fullName,
        phone: phone || null,
        whatsapp: whatsapp || null,
        email: email || null,
        company: company || null,
        tier,
        points,
        joinDate: joinDate || null,
        expireDate: expireDate || null,
        balance: 0,
        totalSpent: 0,
        visitsThisMonth: 0,
        role: 'member',
        active: true,
        importedAt: Timestamp.now(),
      };

      try {
        await db.collection('members').doc(uid).set(memberDoc, { merge: true });
        sheetImported++;
        totalImported++;
      } catch (err) {
        console.error(`  ❌ Erreur sur ${uid} : ${err.message}`);
        sheetSkipped++;
      }
    }

    const sheetTotal = dataRows.length;
    console.log(`  → Importés: ${sheetImported} | Ignorés: ${sheetSkipped} (sur ${sheetTotal} lignes de données)`);
    report.push({ sheet: sheetName, tier, status: '✅ OK', imported: sheetImported, skipped: sheetSkipped, total: sheetTotal, recognized: recognizedCols, ignored: ignoredCols });
  }

  // ─── Final summary ──────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉCAPITULATIF FINAL');
  console.log('='.repeat(60));
  for (const r of report) {
    console.log(`  ${r.status} "${r.sheet}" (${r.tier}) → ${r.imported} importés, ${r.skipped} ignorés`);
    if (r.recognized?.length) console.log(`    Colonnes reconnues : ${r.recognized.join(', ')}`);
    if (r.ignored?.length) console.log(`    Colonnes ignorées  : ${r.ignored.join(', ')}`);
  }
  console.log('-'.repeat(60));
  console.log(`📦 TOTAL : ${totalImported} membres importés, ${totalSkipped} ignorés`);
  console.log('✅ Import terminé.');
  process.exit(0);
}

// ─── Run ───────────────────────────────────────────────────────────────────
const xlsxArg = process.argv[2];
importMembers(xlsxArg).catch((err) => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});