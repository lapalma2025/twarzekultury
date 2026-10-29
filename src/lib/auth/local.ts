import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

/**
 * Local admin credentials, used only while Supabase isn't connected yet.
 * Prefer hash saved via /admin/password (data/admin-credentials.json);
 * fall back to ADMIN_EMAIL + ADMIN_PASSWORD_HASH in .env.local.
 */

const CREDENTIALS_FILE = path.join(process.cwd(), 'data', 'admin-credentials.json');

interface LocalCredentials {
  email: string;
  passwordHash: string;
}

function readStoredCredentials(): LocalCredentials | null {
  try {
    if (!fs.existsSync(CREDENTIALS_FILE)) return null;
    const parsed = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8')) as LocalCredentials;
    if (!parsed?.email || !parsed?.passwordHash) return null;
    return parsed;
  } catch {
    return null;
  }
}

function envCredentials(): LocalCredentials | null {
  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!email || !passwordHash) return null;
  return { email, passwordHash };
}

export function getLocalAdminCredentials(): LocalCredentials | null {
  return readStoredCredentials() ?? envCredentials();
}

export async function verifyLocalCredentials(email: string, password: string): Promise<boolean> {
  const creds = getLocalAdminCredentials();
  if (!creds) return false;
  if (email.trim().toLowerCase() !== creds.email.trim().toLowerCase()) return false;
  return bcrypt.compare(password, creds.passwordHash);
}

export async function updateLocalPassword(email: string, currentPassword: string, newPassword: string): Promise<{ ok: true } | { error: string }> {
  const creds = getLocalAdminCredentials();
  if (!creds) return { error: 'Brak skonfigurowanego konta lokalnego.' };
  if (email.trim().toLowerCase() !== creds.email.trim().toLowerCase()) {
    return { error: 'Nieprawidłowe konto.' };
  }
  const match = await bcrypt.compare(currentPassword, creds.passwordHash);
  if (!match) return { error: 'Obecne hasło jest nieprawidłowe.' };
  if (newPassword.length < 8) return { error: 'Nowe hasło musi mieć co najmniej 8 znaków.' };

  const passwordHash = await bcrypt.hash(newPassword, 12);
  const dir = path.dirname(CREDENTIALS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    CREDENTIALS_FILE,
    JSON.stringify({ email: creds.email, passwordHash }, null, 2),
    'utf-8'
  );
  return { ok: true };
}
