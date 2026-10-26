'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { colors, fontFamily } from '@/lib/theme';
import {
  DEFAULT_ACCEPTED,
  DEFAULT_REJECTED,
  readCookieConsent,
  writeCookieConsent,
} from '@/lib/cookie-consent';

type Prefs = {
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

const OPEN_EVENT = 'tk-open-cookie-settings';

export function openCookieSettings() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(OPEN_EVENT));
  }
}

export function CookieConsent() {
  const t = useTranslations('cookies');
  const locale = useLocale();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({ preferences: false, analytics: false, marketing: false });

  useEffect(() => {
    const existing = readCookieConsent();
    setReady(true);
    setOpen(!existing);
    if (existing) {
      setPrefs({
        preferences: existing.preferences,
        analytics: existing.analytics,
        marketing: existing.marketing,
      });
    }

    const onOpen = () => {
      const cur = readCookieConsent();
      if (cur) {
        setPrefs({
          preferences: cur.preferences,
          analytics: cur.analytics,
          marketing: cur.marketing,
        });
      }
      setCustomize(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function save(next: Prefs) {
    writeCookieConsent({ ...next, necessary: true });
    setOpen(false);
    setCustomize(false);
  }

  if (!ready || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tk-cookie-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 400,
        background: 'rgba(11,10,8,.72)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '12px 12px calc(12px + env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        className="tk-cookie-panel"
        style={{
          width: '100%',
          maxWidth: 640,
          background: colors.bg2,
          border: `1px solid ${colors.line3}`,
          borderRadius: 20,
          padding: '24px 20px 20px',
          marginBottom: 8,
          boxShadow: '0 -12px 48px rgba(0,0,0,.45)',
          maxHeight: 'min(88vh, 720px)',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.14em', color: colors.accent, textTransform: 'uppercase', marginBottom: 10 }}>
          {t('badge')}
        </div>
        <h2 id="tk-cookie-title" style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 'clamp(22px, 6vw, 28px)', letterSpacing: '-.02em', margin: '0 0 12px', lineHeight: 1.15 }}>
          {t('title')}
        </h2>
        <p style={{ fontFamily: fontFamily.serif, fontSize: 15, lineHeight: 1.55, color: colors.muted2, margin: '0 0 18px' }}>
          {t('intro')}{' '}
          <Link href="/cookies" style={{ color: colors.accent }} onClick={() => setOpen(false)}>
            {t('policyLink')}
          </Link>
          {locale === 'pl' ? '.' : '.'}
        </p>

        {customize && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <CategoryRow
              title={t('necessaryTitle')}
              desc={t('necessaryDesc')}
              checked
              locked
            />
            <CategoryRow
              title={t('preferencesTitle')}
              desc={t('preferencesDesc')}
              checked={prefs.preferences}
              onChange={(v) => setPrefs((p) => ({ ...p, preferences: v }))}
            />
            <CategoryRow
              title={t('analyticsTitle')}
              desc={t('analyticsDesc')}
              checked={prefs.analytics}
              onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
            />
            <CategoryRow
              title={t('marketingTitle')}
              desc={t('marketingDesc')}
              checked={prefs.marketing}
              onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
            />
          </div>
        )}

        <div className="tk-cookie-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" onClick={() => save({ ...DEFAULT_ACCEPTED })} style={btnPrimary}>
            {t('acceptAll')}
          </button>
          <button type="button" onClick={() => save({ ...DEFAULT_REJECTED })} style={btnGhost}>
            {t('rejectOptional')}
          </button>
          {customize ? (
            <button type="button" onClick={() => save(prefs)} style={btnGhost}>
              {t('saveChoices')}
            </button>
          ) : (
            <button type="button" onClick={() => setCustomize(true)} style={btnGhost}>
              {t('customize')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  desc,
  checked,
  locked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  locked?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 12,
        alignItems: 'start',
        padding: '12px 14px',
        border: `1px solid ${colors.line3}`,
        cursor: locked ? 'default' : 'pointer',
      }}
    >
      <div>
        <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>{title}</div>
        <div style={{ fontFamily: fontFamily.serif, fontSize: 14, lineHeight: 1.45, color: colors.muted }}>{desc}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ width: 18, height: 18, accentColor: colors.accent, marginTop: 2 }}
      />
    </label>
  );
}

const btnPrimary: import('react').CSSProperties = {
  background: colors.accent,
  color: colors.bg,
  border: 0,
  padding: '12px 18px',
  fontFamily: fontFamily.mono,
  fontSize: 11,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  fontWeight: 500,
};

const btnGhost: import('react').CSSProperties = {
  background: 'transparent',
  color: colors.fg,
  border: `1px solid ${colors.line3}`,
  padding: '12px 18px',
  fontFamily: fontFamily.mono,
  fontSize: 11,
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
};
