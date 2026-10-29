'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '../login/actions';
import { colors, fontFamily } from '@/lib/theme';

const NAV = [
  { href: '/admin', label: 'Artykuły', accent: false },
  { href: '/admin/articles/new', label: '+ Nowy artykuł', accent: true },
  { href: '/admin/week-face', label: 'Twarz tygodnia', accent: false },
  { href: '/admin/gallery', label: 'Galeria (5 kadrów)', accent: false },
  { href: '/admin/password', label: 'Zmiana hasła', accent: false },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  children,
  showLocalNotice,
}: {
  children: React.ReactNode;
  showLocalNotice?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const actionBtn: React.CSSProperties = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    background: 'transparent',
    border: `1px solid ${colors.line3}`,
    color: colors.fg,
    padding: '10px 14px',
    fontFamily: fontFamily.mono,
    fontSize: 11,
    letterSpacing: '.06em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    textAlign: 'center',
    cursor: 'pointer',
  };

  function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="tk-admin-nav-link"
              style={{
                padding: '12px 12px',
                color: item.accent ? colors.accent : colors.fg,
                background: active ? 'rgba(242,236,221,.06)' : 'transparent',
                borderLeft: active ? `2px solid ${colors.accent}` : '2px solid transparent',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          );
        })}
        <div className="tk-admin-nav-actions" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <Link href="/pl" onClick={onNavigate} style={actionBtn}>
            ← Strona główna
          </Link>
          <form action={logoutAction}>
            <button type="submit" style={actionBtn}>
              Wyloguj
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <div className="tk-admin-shell" style={{ minHeight: '100vh', display: 'flex' }}>
      <header className="tk-admin-topbar">
        <div>
          <div style={{ fontFamily: fontFamily.serif, fontStyle: 'italic', fontSize: 20, lineHeight: 1.1 }}>
            Twarze <span style={{ fontStyle: 'normal', fontWeight: 300 }}>Kultury</span>
          </div>
          <div style={{ fontFamily: fontFamily.mono, fontSize: 9, letterSpacing: '.1em', color: colors.muted, textTransform: 'uppercase', marginTop: 2 }}>
            Panel admina
          </div>
        </div>
        <button
          type="button"
          className="tk-admin-menu-btn"
          aria-expanded={open}
          aria-controls="tk-admin-drawer"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Zamknij' : 'Menu'}
        </button>
      </header>

      {open && (
        <button
          type="button"
          className="tk-admin-backdrop"
          aria-label="Zamknij menu"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        id="tk-admin-drawer"
        className={`tk-admin-sidebar${open ? ' is-open' : ''}`}
        style={{ flexShrink: 0, padding: '20px', display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        <div className="tk-admin-brand-desktop">
          <div style={{ fontFamily: fontFamily.serif, fontStyle: 'italic', fontSize: 22 }}>
            Twarze <span style={{ fontStyle: 'normal', fontWeight: 300 }}>Kultury</span>
          </div>
          <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.1em', color: colors.muted, textTransform: 'uppercase', marginTop: 4 }}>
            Panel admina
          </div>
        </div>

        <nav
          className="tk-admin-nav"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            fontFamily: fontFamily.mono,
            fontSize: 12,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}
        >
          <NavLinks onNavigate={() => setOpen(false)} />
        </nav>

        {showLocalNotice && (
          <div style={{ fontFamily: fontFamily.mono, fontSize: 10, lineHeight: 1.6, color: colors.muted, padding: 12, border: `1px dashed ${colors.line3}` }}>
            Tryb lokalny: dane zapisywane w <code>data/db.json</code>. Podepnij Supabase w <code>.env.local</code>, aby przełączyć na produkcyjną bazę.
          </div>
        )}
      </aside>

      <main className="tk-admin-main" style={{ flex: 1, maxWidth: 1100, width: '100%', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
