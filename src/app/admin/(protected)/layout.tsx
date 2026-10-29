import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { logoutAction } from '../login/actions';
import { colors, fontFamily } from '@/lib/theme';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="tk-admin-shell" style={{ minHeight: '100vh', display: 'flex' }}>
      <aside className="tk-admin-sidebar" style={{ flexShrink: 0, padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontFamily: fontFamily.serif, fontStyle: 'italic', fontSize: 22 }}>
            Twarze <span style={{ fontStyle: 'normal', fontWeight: 300 }}>Kultury</span>
          </div>
          <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.1em', color: colors.muted, textTransform: 'uppercase', marginTop: 4 }}>Panel admina</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase' }}>
          <Link href="/admin" style={{ padding: '10px 12px', color: colors.fg }}>
            Artykuły
          </Link>
          <Link href="/admin/articles/new" style={{ padding: '10px 12px', color: colors.accent }}>
            + Nowy artykuł
          </Link>
          <Link href="/admin/week-face" style={{ padding: '10px 12px', color: colors.fg }}>
            Twarz tygodnia
          </Link>
          <Link href="/admin/gallery" style={{ padding: '10px 12px', color: colors.fg }}>
            Galeria (5 kadrów)
          </Link>
          <Link href="/admin/password" style={{ padding: '10px 12px', color: colors.fg }}>
            Zmiana hasła
          </Link>
        </nav>

        {!isSupabaseConfigured() && (
          <div style={{ fontFamily: fontFamily.mono, fontSize: 10, lineHeight: 1.6, color: colors.muted, padding: 12, border: `1px dashed ${colors.line3}` }}>
            Tryb lokalny: dane zapisywane w <code>data/db.json</code>. Podepnij Supabase w <code>.env.local</code>, aby przełączyć na produkcyjną bazę.
          </div>
        )}

        <div style={{ marginTop: 'auto', fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted }}>
          <div style={{ marginBottom: 12, wordBreak: 'break-all' }}>{admin.email}</div>
          <form action={logoutAction}>
            <button
              type="submit"
              style={{ background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg, padding: '8px 14px', fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Wyloguj
            </button>
          </form>
        </div>
      </aside>

      <main className="tk-admin-main" style={{ flex: 1, maxWidth: 1100 }}>{children}</main>
    </div>
  );
}
