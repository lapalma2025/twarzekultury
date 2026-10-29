import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';
import { isSupabaseConfigured } from '@/lib/supabase/env';

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // `/pl/admin/...` or `/en/admin/...` → strip locale so login/panel always works.
  const localePrefixed = pathname.match(new RegExp(`^/(${routing.locales.join('|')})(/(?:admin|api)(?:/.*)?)$`));
  if (localePrefixed) {
    const url = request.nextUrl.clone();
    url.pathname = localePrefixed[2];
    return NextResponse.redirect(url);
  }

  // Admin + API routes: not localized. Just keep the Supabase session fresh
  // (actual authorization is enforced server-side in app/admin/layout.tsx).
  if (pathname.startsWith('/admin') || pathname.startsWith('/api')) {
    if (isSupabaseConfigured()) {
      const { response } = await updateSession(request);
      return response;
    }
    return NextResponse.next();
  }

  // Always land on Polish at `/` — ignore Accept-Language / NEXT_LOCALE cookie.
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${routing.defaultLocale}`;
    const res = NextResponse.redirect(url);
    res.cookies.set('NEXT_LOCALE', routing.defaultLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return res;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
