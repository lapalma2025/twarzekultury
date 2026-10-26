import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LegalDocument } from '@/components/LegalDocument';
import { LEGAL_DOCS } from '@/content/legal';
import { buildPageMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;
  const doc = LEGAL_DOCS.cookies;
  return buildPageMetadata({
    locale: loc,
    title: doc.title[loc],
    description: doc.sections[0]?.body[loc][0] ?? doc.title[loc],
    path: `/${loc}/cookies`,
    pathPl: '/pl/cookies',
    pathEn: '/en/cookies',
  });
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDocument id="cookies" locale={locale as Locale} />;
}
