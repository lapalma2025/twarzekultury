/**
 * Migrates data/db.json articles into Supabase public.articles.
 * Safe to re-run (upsert by id).
 *
 *   node scripts/migrate-articles-to-supabase.mjs
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
  console.error('Brak NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY');
  process.exit(1);
}

const dbPath = resolve(process.cwd(), 'data/db.json');
const { articles } = JSON.parse(readFileSync(dbPath, 'utf8'));
if (!Array.isArray(articles) || !articles.length) {
  console.error('Brak artykułów w data/db.json');
  process.exit(1);
}

function toRow(a) {
  return {
    id: a.id,
    category: a.category,
    subcategory: a.subcategory ?? null,
    slug_pl: a.slug.pl,
    slug_en: a.slug.en,
    title_pl: a.title.pl,
    title_en: a.title.en,
    lead_pl: a.lead?.pl ?? '',
    lead_en: a.lead?.en ?? '',
    body_pl: a.body?.pl ?? '',
    body_en: a.body?.en ?? '',
    cover_image_url: a.coverImageUrl ?? null,
    cover_image_position: a.coverImagePosition || '50% 50%',
    author: a.author || 'Redakcja',
    reading_time_min: a.readingTimeMin ?? 5,
    rating: a.rating ?? null,
    tags: a.tags ?? [],
    status: a.status || 'draft',
    featured: Boolean(a.featured),
    published_at: a.publishedAt ?? null,
    created_at: a.createdAt ?? new Date().toISOString(),
    updated_at: a.updatedAt ?? new Date().toISOString(),
  };
}

const rows = articles.map(toRow);
const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=minimal',
  'User-Agent': 'twarze-kultury-migrate/1.0',
};

// Upsert in batches of 10
const batchSize = 10;
let ok = 0;
for (let i = 0; i < rows.length; i += batchSize) {
  const batch = rows.slice(i, i + batchSize);
  const res = await fetch(`${url}/rest/v1/articles?on_conflict=id`, {
    method: 'POST',
    headers,
    body: JSON.stringify(batch),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Batch ${i / batchSize + 1} failed (${res.status}):`, text);
    process.exit(1);
  }
  ok += batch.length;
  console.log(`✓ upsert ${ok}/${rows.length}`);
}

const check = await fetch(`${url}/rest/v1/articles?select=id,category,status,slug_pl&order=published_at.desc.nullslast`, {
  headers: { apikey: secret, Authorization: `Bearer ${secret}`, 'User-Agent': 'twarze-kultury-migrate/1.0' },
});
const list = await check.json();
const byCat = {};
for (const a of list) byCat[a.category] = (byCat[a.category] || 0) + 1;
console.log('\nW Supabase:', list.length, 'artykułów');
console.log(byCat);
console.log('\nAdmin może je edytować/usuwać w /admin po zalogowaniu jako redakcja@twarzekultury.pl');
