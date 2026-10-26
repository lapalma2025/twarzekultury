import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/lib/fonts';
import { GrainVignette } from '@/components/GrainVignette';
import { Nav } from '@/components/Nav';
import { Marquee } from '@/components/Marquee';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { colors, fontFamily } from '@/lib/theme';
import { absoluteUrl, organizationJsonLd, siteUrl, websiteJsonLd } from '@/lib/seo';
import { LEGAL_META } from '@/content/legal';
import type { Locale } from '@/lib/types';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: colors.bg,
  colorScheme: 'dark',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const description = `${t('heroTitlePre')} ${t('heroTitleIta')} ${t('heroTitlePost')} ${t('heroTitleGray')}`;
  const base = siteUrl();

  return {
    metadataBase: new URL(base),
    title: { default: 'Twarze Kultury', template: '%s · Twarze Kultury' },
    description,
    applicationName: 'Twarze Kultury',
    authors: [{ name: LEGAL_META.name, url: `mailto:${LEGAL_META.email}` }],
    creator: LEGAL_META.name,
    publisher: 'Twarze Kultury',
    keywords: [
      'Twarze Kultury',
      'kultura',
      'muzyka',
      'film',
      'sport',
      'gry',
      'Polska',
      'magazyn',
      'recenzje',
    ],
    alternates: {
      canonical: absoluteUrl(`/${locale}`),
      languages: {
        pl: absoluteUrl('/pl'),
        en: absoluteUrl('/en'),
        'x-default': absoluteUrl('/pl'),
      },
    },
    openGraph: {
      title: 'Twarze Kultury',
      description,
      url: absoluteUrl(`/${locale}`),
      siteName: 'Twarze Kultury',
      locale: locale === 'pl' ? 'pl_PL' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Twarze Kultury',
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const ticker = ((messages as unknown as { home: { ticker: string[] } }).home.ticker) ?? [];
  const orgLd = organizationJsonLd();
  const siteLd = websiteJsonLd(locale as Locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={fontVariables} style={{ fontFamily: fontFamily.sans }} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
          <div style={{ position: 'relative', background: colors.bg, color: colors.fg, minHeight: '100vh', overflowX: 'hidden' }}>
            <GrainVignette />
            <Nav locale={locale as Locale} />
            <Marquee items={ticker} />
            {children}
            <Footer locale={locale as Locale} />
            <CookieConsent />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
