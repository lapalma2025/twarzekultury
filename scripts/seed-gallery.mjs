/**
 * Uploads the 5 default gallery images to Supabase Storage and upserts
 * public.gallery_frames. Requires gallery.sql to have been run first.
 *
 *   node scripts/seed-gallery.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvLocal() {
  const p = resolve(process.cwd(), '.env.local');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    v = v.replace(/\\\$/g, '$');
    if (!(k in process.env)) process.env[k] = v;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!url || !secret) {
  console.error('Brak URL / SECRET w .env.local');
  process.exit(1);
}

const headersBase = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  'User-Agent': 'twarze-kultury-seed-gallery/1.0',
};

const FRAMES = [
  { slot: 1, file: 'dariusz-kozakiewicz.jpg', alt_pl: 'Dariusz Kozakiewicz', alt_en: 'Dariusz Kozakiewicz', parallax: 30 },
  { slot: 2, file: 'malgorzata-kozlowska.jpg', alt_pl: 'Małgorzata Kozłowska', alt_en: 'Małgorzata Kozłowska', parallax: -20 },
  { slot: 3, file: 'black-sabbath-1970.jpg', alt_pl: 'Black Sabbath', alt_en: 'Black Sabbath', parallax: 50 },
  { slot: 4, file: 'piotr-rogucki.jpg', alt_pl: 'Piotr Rogucki', alt_en: 'Piotr Rogucki', parallax: -40 },
  { slot: 5, file: 'david-bowie-1967.png', alt_pl: 'David Bowie', alt_en: 'David Bowie', parallax: 25 },
];

// Check table
{
  const res = await fetch(`${url}/rest/v1/gallery_frames?select=slot&limit=1`, { headers: headersBase });
  if (res.status === 404) {
    const body = await res.text();
    console.error(
      'Tabela gallery_frames nie istnieje.\n' +
        'Uruchom w SQL Editor plik supabase/gallery.sql, potem odpal ten skrypt ponownie.\n' +
        body
    );
    process.exit(1);
  }
}

const rows = [];
for (const f of FRAMES) {
  const localPath = resolve(process.cwd(), 'public/uploads', f.file);
  if (!existsSync(localPath)) {
    console.error('Brak pliku', localPath);
    process.exit(1);
  }
  const bytes = readFileSync(localPath);
  const contentType = f.file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const objectPath = `gallery/${f.file}`;

  const up = await fetch(`${url}/storage/v1/object/article-images/${objectPath}`, {
    method: 'POST',
    headers: {
      ...headersBase,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: bytes,
  });
  if (!up.ok && up.status !== 200) {
    // 409 might mean exists — try upsert already set; otherwise show error
    const text = await up.text();
    if (up.status !== 400) {
      console.error(`Upload slot ${f.slot} failed (${up.status}):`, text);
      process.exit(1);
    }
  }

  const publicUrl = `${url}/storage/v1/object/public/article-images/${objectPath}`;
  rows.push({
    slot: f.slot,
    image_url: publicUrl,
    alt_pl: f.alt_pl,
    alt_en: f.alt_en,
    parallax: f.parallax,
  });
  console.log(`✓ slot ${f.slot}: ${f.file}`);
}

const upsert = await fetch(`${url}/rest/v1/gallery_frames?on_conflict=slot`, {
  method: 'POST',
  headers: {
    ...headersBase,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=representation',
  },
  body: JSON.stringify(rows),
});
if (!upsert.ok) {
  console.error('Upsert failed:', upsert.status, await upsert.text());
  process.exit(1);
}

console.log('\nGotowe — 5 kadrów w Supabase. Edycja: /admin/gallery');
