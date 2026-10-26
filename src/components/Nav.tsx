import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CATEGORIES } from '@/lib/data/categories';
import { colors, fontFamily } from '@/lib/theme';
import { LangSwitcher } from './LangSwitcher';
import { MobileMenu } from './MobileMenu';
import type { Locale } from '@/lib/types';

const TOTALS: Record<string, number> = { muzyka: 1852, film: 1080, sport: 241, gry: 127 };

export function Nav({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(14px)',
        background: 'rgba(11,10,8,.72)', borderBottom: `1px solid ${colors.line}`,
      }}
    >
      <div
        className="tk-header-inner"
        style={{ maxWidth: 1600, margin: '0 auto', display: 'grid', alignItems: 'center' }}
      >
        <div aria-hidden />


        <Link
          href="/"
          style={{ justifySelf: 'center', fontFamily: fontFamily.serif, fontWeight: 500, fontSize: 22, letterSpacing: '-.02em', fontStyle: 'italic', whiteSpace: 'nowrap' }}
        >
          Twarze <span style={{ fontStyle: 'normal', fontWeight: 300 }}>Kultury</span>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <nav
            className="tk-nav-desktop"
            style={{
              justifyContent: 'flex-end', gap: 28, fontFamily: fontFamily.mono,
              fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', alignItems: 'center',
            }}
          >
            {CATEGORIES.map((cat) => (
              <div className="tk-nav-item" key={cat.key}>
                <Link href={`/kategoria/${cat.key}`} data-cat>
                  {cat.label[locale]}
                </Link>
                <div className="tk-drop">
                  <Link href={`/kategoria/${cat.key}`}>
                    <span>{t('all')}</span>
                    <span>{TOTALS[cat.key]}</span>
                  </Link>
                  {cat.subcategories.map((s) => (
                    <Link href={`/kategoria/${cat.key}?sub=${s.key}`} key={s.key}>
                      <span>{s.label[locale]}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <Suspense fallback={<div style={{ width: 76, height: 27 }} />}>
              <LangSwitcher locale={locale} />
            </Suspense>
          </nav>

          <MobileMenu locale={locale} />
        </div>
      </div>
    </header>
  );
}
