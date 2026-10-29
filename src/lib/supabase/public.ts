import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

/**
 * Cookie-less anon client for public reads (published articles, gallery…).
 * Avoids `cookies()` so Next can cache/revalidate pages instead of
 * forcing a fully dynamic render on every soft navigation.
 */
let cached: SupabaseClient | null = null;

export function createPublicSupabaseClient(): SupabaseClient {
  if (!cached) {
    cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return cached;
}
