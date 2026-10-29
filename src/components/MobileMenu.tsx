'use client';

import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CATEGORIES } from '@/lib/data/categories';
import type { CategoryCounts } from '@/lib/data/articles';
import { colors, fontFamily } from '@/lib/theme';
import { LangSwitcher } from './LangSwitcher';
import type { Locale } from '@/lib/types';

export function MobileMenu({ locale, counts }: { locale: Locale; counts: CategoryCounts }) {
  const t = useTranslations('nav');
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function close() {
    setOpen(false);
    setExpanded(null);
  }

  const panel =
    mounted &&
    open &&
    createPortal(
      <div
        className="tk-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('menuOpen')}
        id={panelId}
      >
        <div className="tk-mobile-menu-bar">
          <Link href="/" onClick={close} className="tk-mobile-menu-brand">
            Twarze <span>Kultury</span>
          </Link>
          <button type="button" className="tk-mobile-icon-btn" onClick={close} aria-label={t('menuClose')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <nav className="tk-mobile-menu-nav">
          <Link href="/" onClick={close} className="tk-mobile-home">
            Strona główna
          </Link>

          {CATEGORIES.map((cat) => {
            const isOpen = expanded === cat.key;
            return (
              <div key={cat.key} className={`tk-mobile-cat${isOpen ? ' is-open' : ''}`}>
                <div className="tk-mobile-cat-row">
                  <Link href={`/kategoria/${cat.key}`} onClick={close} className="tk-mobile-cat-link">
                    {cat.label[locale]}
                    <span className="tk-mobile-count">{counts.byCategory[cat.key] ?? 0}</span>
                  </Link>
                  <button
                    type="button"
                    className="tk-mobile-cat-toggle"
                    aria-expanded={isOpen}
                    aria-label={`${cat.label[locale]} — podkategorie`}
                    onClick={() => setExpanded(isOpen ? null : cat.key)}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden style={{ transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'transform .2s ease' }}>
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
                {isOpen && (
                  <div className="tk-mobile-subs">
                    <Link href={`/kategoria/${cat.key}`} onClick={close} className="tk-mobile-sub">
                      <span>{t('all')}</span>
                      <span>{counts.byCategory[cat.key] ?? 0}</span>
                    </Link>
                    {cat.subcategories.map((s) => (
                      <Link
                        key={s.key}
                        href={`/kategoria/${cat.key}?sub=${s.key}`}
                        onClick={close}
                        className="tk-mobile-sub"
                      >
                        <span>{s.label[locale]}</span>
                        <span>{counts.bySubcategory[`${cat.key}:${s.key}`] ?? 0}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="tk-mobile-menu-foot">
          <span className="tk-mobile-menu-foot-label">{t('langSwitch')}</span>
          <LangSwitcher locale={locale} />
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        type="button"
        className="tk-nav-toggle"
        onClick={() => setOpen(true)}
        aria-label={t('menuOpen')}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden>
          <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      {panel}
    </>
  );
}
