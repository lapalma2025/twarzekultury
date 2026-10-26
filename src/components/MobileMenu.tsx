'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CATEGORIES } from '@/lib/data/categories';
import { colors, fontFamily } from '@/lib/theme';
import { LangSwitcher } from './LangSwitcher';
import type { Locale } from '@/lib/types';

const TOTALS: Record<string, number> = { muzyka: 1852, film: 1080, sport: 241, gry: 127 };

export function MobileMenu({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="tk-nav-toggle"
        onClick={() => setOpen(true)}
        aria-label={t('menuOpen')}
        aria-expanded={open}
        style={{
          alignItems: 'center', justifyContent: 'center', width: 36, height: 36,
          background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg, cursor: 'pointer',
        }}
      >
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <line x1="0" y1="1" x2="16" y2="1" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" />
          <line x1="0" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open && (
        <div className="tk-mobile-menu">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <span style={{ fontFamily: fontFamily.serif, fontWeight: 500, fontSize: 22, fontStyle: 'italic' }}>
              Twarze <span style={{ fontStyle: 'normal', fontWeight: 300 }}>Kultury</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('menuClose')}
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg, cursor: 'pointer', fontSize: 18,
              }}
            >
              ✕
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {CATEGORIES.map((cat) => (
              <details key={cat.key} className="tk-mobile-cat" style={{ borderBottom: `1px solid ${colors.line2}` }}>
                <summary
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0',
                    fontFamily: fontFamily.mono, fontSize: 14, letterSpacing: '.08em', textTransform: 'uppercase',
                  }}
                >
                  <Link href={`/kategoria/${cat.key}`} onClick={() => setOpen(false)}>
                    {cat.label[locale]}
                  </Link>
                  <span className="tk-mobile-cat-chevron" style={{ color: colors.muted, transition: 'transform .2s ease' }}>▾</span>
                </summary>
                <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: 12 }}>
                  <Link
                    href={`/kategoria/${cat.key}`}
                    onClick={() => setOpen(false)}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 10px 16px', fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.06em', color: colors.muted }}
                  >
                    <span>{t('all')}</span>
                    <span>{TOTALS[cat.key]}</span>
                  </Link>
                  {cat.subcategories.map((s) => (
                    <Link
                      key={s.key}
                      href={`/kategoria/${cat.key}?sub=${s.key}`}
                      onClick={() => setOpen(false)}
                      style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 10px 16px', fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.06em', color: colors.muted }}
                    >
                      <span>{s.label[locale]}</span>
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </nav>

          <div style={{ marginTop: 32 }}>
            <LangSwitcher locale={locale} />
          </div>
        </div>
      )}
    </>
  );
}
