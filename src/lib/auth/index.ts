import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from './session';

export interface CurrentAdmin {
  email: string;
}

/** Returns the logged-in admin, or null. Works against Supabase Auth once
 * configured, and against the local signed-cookie session before that. */
export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (!profile) return null; // authenticated, but not an admin

    return { email: user.email ?? '' };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const email = verifySessionToken(token);
  return email ? { email } : null;
}

/** Server-component / server-action guard: redirects to /admin/login when unauthenticated. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
