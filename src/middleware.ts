import { type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin + API routes: not localized. Just keep the Supabase session fresh
  // (actual authorization is enforced server-side in app/admin/layout.tsx).
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    if (isSupabaseConfigured()) {
      const { response } = await updateSession(request);
      return response;
    }
    return;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
