import 'server-only';
import crypto from 'node:crypto';

/**
 * Minimal signed-cookie session used ONLY for the local (pre-Supabase) admin
 * login fallback. Once Supabase is connected, Supabase Auth's own httpOnly
 * session cookies take over (see lib/supabase/server.ts) and this is unused.
 */

const COOKIE_NAME = 'tk_admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8h

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    throw new Error(
      'SESSION_SECRET is not set. Add a long random value to .env.local before using local admin login.'
    );
  }
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

export function createSessionToken(email: string): string {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  // Base64url the JSON payload first so the email's own dots/special chars
  // can never collide with the "payload.signature" delimiter below.
  const payload = Buffer.from(JSON.stringify({ email, exp })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null;
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = sign(payload);
    if (sig.length !== expected.length) return null;
    const sigOk = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!sigOk) return null;

    const { email, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as { email: string; exp: number };
    if (!email || !exp || Date.now() > exp) return null;
    return email;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
