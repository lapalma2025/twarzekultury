import type { MetadataRoute } from 'next';
import { listArticles } from '@/lib/data/articles';
import { CATEGORIES } from '@/lib/data/categories';
import { routing } from '@/i18n/routing';
import { siteUrl } from '@/lib/seo';

const LEGAL = ['regulamin', 'polityka-prywatnosci', 'cookies'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    entries.push({
      url: `${base}/${locale}`,
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          pl: `${base}/pl`,
          en: `${base}/en`,
        },
      },
    });

    for (const cat of CATEGORIES) {
      entries.push({
        url: `${base}/${locale}/kategoria/${cat.key}`,
        changeFrequency: 'daily',
        priority: 0.8,
        alternates: {
          languages: {
            pl: `${base}/pl/kategoria/${cat.key}`,
            en: `${base}/en/kategoria/${cat.key}`,
          },
        },
      });
    }

    for (const path of LEGAL) {
      entries.push({
        url: `${base}/${locale}/${path}`,
        changeFrequency: 'yearly',
        priority: 0.3,
        alternates: {
          languages: {
            pl: `${base}/pl/${path}`,
            en: `${base}/en/${path}`,
          },
        },
      });
    }
  }

  const articles = await listArticles({ status: 'published' });
  for (const article of articles) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${base}/${locale}/artykul/${article.slug[locale]}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: {
            pl: `${base}/pl/artykul/${article.slug.pl}`,
            en: `${base}/en/artykul/${article.slug.en}`,
          },
        },
      });
    }
  }

  return entries;
}
