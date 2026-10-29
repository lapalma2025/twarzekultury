import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CATEGORIES } from '@/lib/data/categories';
import { getPublishedCategoryCounts } from '@/lib/data/articles';
import { LangSwitcher } from './LangSwitcher';
import { MobileMenu } from './MobileMenu';
import type { Locale } from '@/lib/types';

export async function Nav({ locale }: { locale: Locale }) {
  const [t, counts] = await Promise.all([
    getTranslations({ locale, namespace: 'nav' }),
    getPublishedCategoryCounts(),
  ]);

  return (
    <header className="tk-header">
      <div className="tk-header-inner">
        <Link href="/" className="tk-header-brand">
          Twarze <span>Kultury</span>
        </Link>

        <nav className="tk-nav-desktop" aria-label="Główne">
          {CATEGORIES.map((cat) => (
            <div className="tk-nav-item" key={cat.key}>
              <Link href={`/kategoria/${cat.key}`} data-cat>
                {cat.label[locale]}
              </Link>
              <div className="tk-drop">
                <Link href={`/kategoria/${cat.key}`}>
                  <span>{t('all')}</span>
                  <span>{counts.byCategory[cat.key] ?? 0}</span>
                </Link>
                {cat.subcategories.map((s) => (
                  <Link href={`/kategoria/${cat.key}?sub=${s.key}`} key={s.key}>
                    <span>{s.label[locale]}</span>
                    <span>{counts.bySubcategory[`${cat.key}:${s.key}`] ?? 0}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Suspense fallback={<div style={{ width: 76, height: 27 }} />}>
            <LangSwitcher locale={locale} />
          </Suspense>
        </nav>

        <div className="tk-header-mobile-actions">
          <MobileMenu locale={locale} counts={counts} />
        </div>
      </div>
    </header>
  );
}
