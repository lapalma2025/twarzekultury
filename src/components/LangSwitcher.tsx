'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { colors, fontFamily } from '@/lib/theme';
import type { Locale } from '@/lib/types';

const FLAGS: Record<Locale, string> = { pl: '🇵🇱', en: '🇬🇧' };
const LOCALES: Locale[] = ['pl', 'en'];

export function LangSwitcher({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = Object.fromEntries(searchParams.entries());

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 4 }} aria-label={t('langSwitch')}>
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => router.replace({ pathname, query }, { locale: l })}
            aria-current={active ? 'true' : undefined}
            title={l.toUpperCase()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, cursor: active ? 'default' : 'pointer',
              background: 'transparent', border: `1px solid ${active ? colors.accent : 'rgba(242,236,221,.15)'}`,
              padding: '6px 9px', color: active ? colors.accent : colors.muted,
              fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.06em',
            }}
          >
            <span style={{ fontSize: 13, lineHeight: 1 }}>{FLAGS[l]}</span>
            <span>{l.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
