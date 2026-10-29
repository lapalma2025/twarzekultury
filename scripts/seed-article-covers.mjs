/**
 * Assigns demo cover images (Unsplash CDN) to every article so the site
 * doesn't show empty placeholders when you deploy / show a client.
 *
 * Updates:
 *   1) data/db.json (local store)
 *   2) Supabase public.articles (if env keys are set)
 *
 *   node scripts/seed-article-covers.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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

/** Stable Unsplash photos — already allowed in next.config images + CSP. */
const COVERS = {
  muzyka: [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=1400&q=80',
  ],
  film: [
    'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1400&q=80',
  ],
  sport: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1400&q=80',
  ],
  gry: [
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1400&q=80',
  ],
};

const counters = { muzyka: 0, film: 0, sport: 0, gry: 0 };

function pickCover(category) {
  const pool = COVERS[category] || COVERS.muzyka;
  const i = counters[category] ?? 0;
  counters[category] = i + 1;
  return pool[i % pool.length];
}

function needsCover(url) {
  if (!url) return true;
  // Local /uploads paths are gitignored — replace so production / client demo works.
  if (url.startsWith('/uploads/')) return true;
  return false;
}

const dbPath = resolve(process.cwd(), 'data/db.json');
if (!existsSync(dbPath)) {
  console.error('Brak data/db.json');
  process.exit(1);
}

const db = JSON.parse(readFileSync(dbPath, 'utf8'));
const articles = db.articles || [];
let localUpdated = 0;

for (const a of articles) {
  if (!needsCover(a.coverImageUrl)) continue;
  a.coverImageUrl = pickCover(a.category);
  a.coverImagePosition = a.coverImagePosition || '50% 35%';
  a.updatedAt = new Date().toISOString();
  localUpdated++;
}

writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Lokalnie: zaktualizowano okładki w ${localUpdated}/${articles.length} artykułach → data/db.json`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !secret) {
  console.log('Supabase: pominięto (brak URL/SECRET w .env.local).');
  console.log('Po podpięciu bazy odpal ponownie: node scripts/seed-article-covers.mjs');
  process.exit(0);
}

const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
  'User-Agent': 'twarze-kultury-seed-covers/1.0',
};

// Reset counters so Supabase gets the same mapping order as local
counters.muzyka = counters.film = counters.sport = counters.gry = 0;

// Re-read assignment from the file we just wrote
const assigned = JSON.parse(readFileSync(dbPath, 'utf8')).articles;
let remoteOk = 0;
let remoteFail = 0;

for (const a of assigned) {
  if (!a.coverImageUrl) continue;
  const res = await fetch(`${url}/rest/v1/articles?id=eq.${a.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      cover_image_url: a.coverImageUrl,
      cover_image_position: a.coverImagePosition || '50% 35%',
      updated_at: new Date().toISOString(),
    }),
  });
  if (res.ok || res.status === 204) remoteOk++;
  else {
    remoteFail++;
    const body = await res.text();
    console.warn(`  ! ${a.id}: ${res.status} ${body.slice(0, 120)}`);
  }
}

console.log(`Supabase: zaktualizowano ${remoteOk} artykułów${remoteFail ? `, błędów: ${remoteFail}` : ''}.`);
console.log('Gotowe — odśwież stronę, okładki powinny być widoczne.');
