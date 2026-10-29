import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pl', 'en'],
  defaultLocale: 'pl',
  localePrefix: 'always',
  // Don't redirect `/` → `/en` based on Accept-Language; always open Polish first.
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
