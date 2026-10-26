/**
 * Bootstrap Supabase after schema.sql is applied:
 *  1) create admin Auth user (if missing)
 *  2) insert public.profiles row
 *
 * Usage (from repo root, with .env.local filled):
 *   node scripts/bootstrap-supabase.mjs
 *   node scripts/bootstrap-supabase.mjs --email you@example.com --password 'Secret123!'
 *
 * Secret key must be used only from Node (non-browser User-Agent).
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
    // Undo Next.js-style \$ escapes in .env.local
    v = v.replace(/\\\$/g, '$');
    if (!(k in process.env)) process.env[k] = v;
  }
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return fallback;
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const email = arg('email', process.env.ADMIN_EMAIL || '');
const password = arg('password', process.env.BOOTSTRAP_ADMIN_PASSWORD || 'TwarzeKultury2026!');

if (!url || !secret) {
  console.error('Brak NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY w .env.local');
  process.exit(1);
}
if (!email) {
  console.error('Podaj --email lub ustaw ADMIN_EMAIL w .env.local');
  process.exit(1);
}

const headers = {
  apikey: secret,
  Authorization: `Bearer ${secret}`,
  'Content-Type': 'application/json',
  'User-Agent': 'twarze-kultury-bootstrap/1.0',
};

async function req(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${url}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json };
}

// 1) Verify articles table exists
{
  const { ok, status, json } = await req('/rest/v1/articles?select=id&limit=1');
  if (status === 404 && json?.code === 'PGRST205') {
    console.error(
      'Tabela public.articles nie istnieje.\n' +
        'Otwórz SQL Editor i uruchom plik supabase/schema.sql:\n' +
        `  https://supabase.com/dashboard/project/${url.split('//')[1].split('.')[0]}/sql/new`
    );
    process.exit(1);
  }
  if (!ok) {
    console.error('Nie mogę odczytać articles:', status, json);
    process.exit(1);
  }
  console.log('✓ tabela articles OK');
}

// 2) Find or create auth user
let userId = null;
{
  const { ok, status, json } = await req('/auth/v1/admin/users');
  if (!ok) {
    console.error('Auth Admin listUsers failed:', status, json);
    process.exit(1);
  }
  const existing = (json.users || []).find((u) => (u.email || '').toLowerCase() === email.toLowerCase());
  if (existing) {
    userId = existing.id;
    console.log(`✓ użytkownik Auth już istnieje: ${email} (${userId})`);
  } else {
    const created = await req('/auth/v1/admin/users', {
      method: 'POST',
      body: {
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin' },
      },
    });
    if (!created.ok) {
      console.error('Nie udało się utworzyć użytkownika:', created.status, created.json);
      process.exit(1);
    }
    userId = created.json.id;
    console.log(`✓ utworzono użytkownika Auth: ${email} (${userId})`);
    console.log(`  hasło: ${password}`);
  }
}

// 3) Upsert profiles row
{
  const { ok, status, json } = await req('/rest/v1/profiles', {
    method: 'POST',
    body: { id: userId, email, role: 'admin' },
  });
  // Prefer Prefer: resolution=merge-duplicates via upsert header
  if (!ok) {
    const upsert = await fetch(`${url}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({ id: userId, email, role: 'admin' }),
    });
    const text = await upsert.text();
    if (!upsert.ok) {
      console.error('Nie udało się zapisać profiles:', status, json, text);
      process.exit(1);
    }
  }
  console.log(`✓ profiles: ${email} jest adminem`);
}

console.log('\nGotowe. Zaloguj się w /admin/login tym e-mailem i hasłem.');
console.log('Jeśli dev server już działał — zrestartuj `npm run dev` (zmiana .env.local).');
