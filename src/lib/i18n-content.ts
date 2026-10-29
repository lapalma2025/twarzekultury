import type { Bilingual, Locale } from '@/lib/types';

/** Prefer current locale; if empty, fall back to the other language. */
export function localized(value: Bilingual, locale: Locale): string {
  const primary = (value[locale] ?? '').trim();
  if (primary) return primary;
  const fallback = locale === 'pl' ? value.en : value.pl;
  return (fallback ?? '').trim();
}
