import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LegalDocument } from '@/components/LegalDocument';
import { LEGAL_DOCS } from '@/content/legal';
import { buildPageMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const loc = locale as Locale;
  const doc = LEGAL_DOCS.privacy;
  return buildPageMetadata({
    locale: loc,
    title: doc.title[loc],
    description: doc.sections[0]?.body[loc][0] ?? doc.title[loc],
    path: `/${loc}/polityka-prywatnosci`,
    pathPl: '/pl/polityka-prywatnosci',
    pathEn: '/en/polityka-prywatnosci',
  });
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDocument id="privacy" locale={locale as Locale} />;
}
