import type { Metadata } from 'next';
import { LEGAL_META } from '@/content/legal';
import type { Locale } from '@/lib/types';

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'https://twarzekultury.pl').replace(/\/$/, '');
}

export function absoluteUrl(path: string): string {
  if (!path) return siteUrl();
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

export function localeAlternates(pathByLocale: Record<Locale, string>): Metadata['alternates'] {
  const pl = absoluteUrl(pathByLocale.pl);
  const en = absoluteUrl(pathByLocale.en);
  return {
    canonical: undefined, // set per page for current locale
    languages: {
      pl,
      en,
      'x-default': pl,
    },
  };
}

export function buildPageMetadata(opts: {
  locale: Locale;
  title: string;
  description: string;
  path: string; // locale-prefixed, e.g. /pl/regulamin
  pathEn?: string;
  pathPl?: string;
  type?: 'website' | 'article';
  image?: string | null;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path);
  const plPath = opts.pathPl ?? opts.path.replace(/^\/en/, '/pl');
  const enPath = opts.pathEn ?? opts.path.replace(/^\/pl/, '/en');
  const image = opts.image ? absoluteUrl(opts.image) : undefined;

  return {
    title: opts.title,
    description: opts.description,
    metadataBase: new URL(siteUrl()),
    alternates: {
      canonical: url,
      languages: {
        pl: absoluteUrl(plPath),
        en: absoluteUrl(enPath),
        'x-default': absoluteUrl(plPath),
      },
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: 'Twarze Kultury',
      locale: opts.locale === 'pl' ? 'pl_PL' : 'en_US',
      type: opts.type ?? 'website',
      images: image ? [{ url: image, width: 1200, height: 630, alt: opts.title }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: opts.title,
      description: opts.description,
      images: image ? [image] : undefined,
    },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    authors: [{ name: LEGAL_META.name, url: `mailto:${LEGAL_META.email}` }],
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Twarze Kultury',
    url: siteUrl(),
    email: LEGAL_META.email,
    founder: { '@type': 'Person', name: LEGAL_META.name },
    sameAs: [],
    publishingPrinciples: absoluteUrl('/pl/regulamin'),
    privacyPolicy: absoluteUrl('/pl/polityka-prywatnosci'),
  };
}

export function websiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Twarze Kultury',
    url: absoluteUrl(`/${locale}`),
    inLanguage: locale,
    publisher: { '@type': 'Organization', name: 'Twarze Kultury' },
  };
}
