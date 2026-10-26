/**
 * Supabase env — supports both the new publishable/secret keys
 * (sb_publishable_… / sb_secret_…) and the legacy anon / service_role JWTs.
 * Prefer the new names; fall back to legacy so existing .env files keep working.
 */

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

/** Low-privilege key safe for the browser (publishable or legacy anon). */
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

/** Elevated server-only key (secret or legacy service_role). Never expose to the client. */
export const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * True once real Supabase credentials are configured. Until then the whole
 * app transparently runs on the local file-based store (lib/data/local-store.ts)
 * so the admin panel works out of the box during development.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
