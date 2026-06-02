#!/usr/bin/env node
/**
 * optimize_images.mjs — IVOIRE BUSINESS CLUB
 * ----------------------------------------------------------------------------
 * Compresse et convertit en WebP les images lourdes de public/ (hero ~900 Ko,
 * logo ~640 Ko). Génère des variantes optimisées sans écraser les originaux.
 *
 * Prérequis : npm i -D sharp
 * Usage     : npm run optimize:images
 *
 * Sortie : public/<nom>.webp (qualité 78) + public/<nom>-1280.webp pour les hero.
 * Ensuite, référencer les .webp dans le code (ou via <picture>) pour le gain LCP.
 */
import { readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, '..', 'public');

// fichier source -> { widths: [...], quality }
const TARGETS = {
  'hero-lounge.jpg':     { widths: [1920, 1280], quality: 78 },
  'hero-restaurant.jpg': { widths: [1920, 1280], quality: 78 },
  'hero-beach.jpg':      { widths: [1920, 1280], quality: 78 },
  'ibc-logo.png':        { widths: [256],        quality: 90 },
};

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('\n❌ Le paquet "sharp" est requis.\n   Installez-le puis relancez :\n     npm i -D sharp && npm run optimize:images\n');
  process.exit(1);
}

const kb = (n) => `${Math.round(n / 1024)} Ko`;

for (const [file, cfg] of Object.entries(TARGETS)) {
  const src = path.join(PUBLIC, file);
  let input;
  try {
    input = await readFile(src);
  } catch {
    console.warn(`⚠️  ignoré (introuvable) : ${file}`);
    continue;
  }
  const before = (await stat(src)).size;
  const base = file.replace(/\.[^.]+$/, '');

  for (let i = 0; i < cfg.widths.length; i++) {
    const w = cfg.widths[i];
    // Le plus grand garde le nom de base ; les autres reçoivent un suffixe -<width>.
    const suffix = i === 0 ? '' : `-${w}`;
    const out = path.join(PUBLIC, `${base}${suffix}.webp`);
    const buf = await sharp(input)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: cfg.quality })
      .toBuffer();
    await writeFile(out, buf);
    console.log(`✅ ${path.basename(out)}  ${kb(before)} → ${kb(buf.length)}`);
  }
}

console.log('\n✨ Terminé. Pensez à référencer les .webp dans le code (idéalement via <picture> + srcset).');
