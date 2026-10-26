'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CATEGORIES } from '@/lib/data/categories';
import { colors, fontFamily } from '@/lib/theme';
import { openCookieSettings } from '@/components/CookieConsent';
import { LEGAL_META } from '@/content/legal';
import type { Locale } from '@/lib/types';

export function Footer({ locale }: { locale: Locale }) {
  const t = useTranslations('footer');

  const legal = [
    { href: '/regulamin', label: t('terms') },
    { href: '/polityka-prywatnosci', label: t('privacy') },
    { href: '/cookies', label: t('cookies') },
  ];

  return (
    <footer className="tk-container" style={{ paddingTop: 56, paddingBottom: 32, maxWidth: 1600, margin: '0 auto' }}>
      <div
        className="tk-footer-grid"
        style={{
          display: 'grid',
          paddingBottom: 40, borderBottom: `1px solid ${colors.line}`,
        }}
      >
        <div>
          <div style={{ fontFamily: fontFamily.serif, fontSize: 32, letterSpacing: '-.02em' }}>
            <span style={{ fontStyle: 'italic' }}>Twarze</span> Kultury
          </div>
          <p style={{ fontFamily: fontFamily.serif, fontSize: 15, color: colors.muted, lineHeight: 1.5, margin: '18px 0 0', maxWidth: '34ch' }}>
            {t('tagline')}
          </p>
          <p style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, lineHeight: 1.6, margin: '16px 0 0', letterSpacing: '.04em' }}>
            {t('adminLabel')}: {LEGAL_META.name}
            <br />
            <a href={`mailto:${LEGAL_META.email}`} style={{ color: colors.muted2 }}>{LEGAL_META.email}</a>
          </p>
        </div>

        <div>
          <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase', marginBottom: 16 }}>
            {t('sections')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: fontFamily.serif, fontSize: 15 }}>
            {CATEGORIES.map((c) => (
              <Link href={`/kategoria/${c.key}`} key={c.key}>
                {c.label[locale]}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase', marginBottom: 16 }}>
            {t('editorial')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: fontFamily.serif, fontSize: 15 }}>
            <a href={`mailto:${LEGAL_META.email}`}>{t('contact')}</a>
          </div>
        </div>

        <div>
          <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase', marginBottom: 16 }}>
            {t('follow')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: fontFamily.serif, fontSize: 15 }}>
            {(t.raw('followLinks') as string[]).map((l) => (
              <a href="#" key={l}>{l}</a>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase', marginBottom: 16 }}>
            {t('legal')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: fontFamily.serif, fontSize: 15 }}>
            {legal.map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
            <button
              type="button"
              onClick={openCookieSettings}
              style={{
                background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer',
                fontFamily: fontFamily.serif, fontSize: 15, color: 'inherit',
              }}
            >
              {t('cookieSettings')}
            </button>
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', paddingTop: 32, fontFamily: fontFamily.mono,
          fontSize: 10, letterSpacing: '.12em', color: colors.muted, textTransform: 'uppercase', flexWrap: 'wrap', gap: 12,
        }}
      >
        <span>{t('rights')}</span>
        <span>{t('edition')}</span>
      </div>
    </footer>
  );
}
