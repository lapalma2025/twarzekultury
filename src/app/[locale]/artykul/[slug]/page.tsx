import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { ReadingProgress } from '@/components/ReadingProgress';
import { colors, fontFamily } from '@/lib/theme';
import { getArticleBySlug, listRelatedArticles } from '@/lib/data/articles';
import { getCategory, getSubcategoryLabel } from '@/lib/data/categories';
import { renderArticleBody } from '@/lib/markdown';
import { localized } from '@/lib/i18n-content';
import { absoluteUrl, buildPageMetadata, siteUrl } from '@/lib/seo';
import type { Locale } from '@/lib/types';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = locale as Locale;
  const article = await getArticleBySlug(loc, slug);
  if (!article) return {};

  const meta = buildPageMetadata({
    locale: loc,
    title: localized(article.title, loc),
    description: localized(article.lead, loc),
    path: `/${loc}/artykul/${localized(article.slug, loc)}`,
    pathPl: `/pl/artykul/${localized(article.slug, 'pl')}`,
    pathEn: `/en/artykul/${localized(article.slug, 'en')}`,
    type: 'article',
    image: article.coverImageUrl,
  });

  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: 'article',
      publishedTime: article.publishedAt ?? article.createdAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      section: article.category,
      tags: article.tags,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const article = await getArticleBySlug(loc, slug);
  if (!article || article.status !== 'published') notFound();

  const t = await getTranslations({ locale, namespace: 'article' });
  const cat = getCategory(article.category)!;
  const title = localized(article.title, loc);
  const lead = localized(article.lead, loc);
  const bodyHtml = renderArticleBody(localized(article.body, loc));

  const related = await listRelatedArticles(article.category, article.id, 3);

  const dateFmt = new Intl.DateTimeFormat(loc === 'pl' ? 'pl-PL' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const pageUrl = absoluteUrl(`/${loc}/artykul/${localized(article.slug, loc)}`);
  const coverAbs = article.coverImageUrl ? absoluteUrl(article.coverImageUrl) : undefined;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    description: lead,
    image: coverAbs ? [coverAbs] : undefined,
    datePublished: article.publishedAt ?? article.createdAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Person', name: article.author },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'Twarze Kultury',
      url: siteUrl(),
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    inLanguage: loc,
    articleSection: cat.label[loc],
    keywords: article.tags.join(', '),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Twarze Kultury', item: absoluteUrl(`/${loc}`) },
      { '@type': 'ListItem', position: 2, name: cat.label[loc], item: absoluteUrl(`/${loc}/kategoria/${article.category}`) },
      { '@type': 'ListItem', position: 3, name: title, item: pageUrl },
    ],
  };

  return (
    <main className="tk-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Breadcrumb" style={{ padding: '24px 0 0', fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase', lineHeight: 1.7, wordBreak: 'break-word' }}>
        <Link href="/">Twarze Kultury</Link>
        <span style={{ margin: '0 10px' }}>/</span>
        <Link href={`/kategoria/${article.category}`}>{cat.label[loc]}</Link>
        {article.subcategory && (
          <>
            <span style={{ margin: '0 10px' }}>/</span>
            <Link href={`/kategoria/${article.category}?sub=${article.subcategory}`}>{getSubcategoryLabel(article.category, article.subcategory, loc)}</Link>
          </>
        )}
      </nav>

      <section style={{ padding: '64px 0 48px' }}>
        <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.accent, textTransform: 'uppercase', marginBottom: 32 }}>
          {getSubcategoryLabel(article.category, article.subcategory, loc)} · {cat.label[loc]}
        </div>
        <h1 className="tk-article-title" style={{ fontFamily: fontFamily.serif, fontWeight: 400, letterSpacing: '-.03em', margin: '0 0 32px', textWrap: 'balance' }}>
          {title}
        </h1>
        <p style={{ fontFamily: fontFamily.serif, fontSize: 'clamp(17px, 3vw, 22px)', lineHeight: 1.5, color: colors.muted2, margin: 0, maxWidth: '60ch', fontStyle: 'italic' }}>{lead}</p>
        <div className="tk-article-meta" style={{ display: 'flex', gap: 24, marginTop: 40, paddingTop: 24, borderTop: `1px solid ${colors.line}`, fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>
          <span>{article.author}</span>
          <span>·</span>
          <span>{dateFmt.format(new Date(article.publishedAt ?? article.createdAt))}</span>
        </div>
      </section>

      <div style={{ aspectRatio: '4/3', overflow: 'hidden', marginBottom: 64 }}>
        <ImageSlot src={article.coverImageUrl} alt={title} placeholder="Zdjęcie główne artykułu" objectPosition={article.coverImagePosition} sizes="(max-width: 900px) 100vw, 900px" quality={78} priority />
      </div>

      <article className="tk-article" style={{ maxWidth: '68ch', margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: bodyHtml }} />

      {article.tags.length > 0 && (
        <section style={{ maxWidth: '68ch', margin: '80px auto 0', padding: '32px 0', borderTop: `1px solid ${colors.line}`, borderBottom: `1px solid ${colors.line}` }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            {article.tags.map((tag) => (
              <span key={tag} style={{ padding: '8px 12px', border: `1px solid ${colors.line3}`, color: colors.muted }}>
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section style={{ padding: '80px 0' }}>
          <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.accent, textTransform: 'uppercase', marginBottom: 32 }}>{t('readMore')}</div>
          <div className="tk-cards-3" style={{ display: 'grid', gap: 1, background: colors.line }}>
            {related.map((r) => (
              <Link key={r.id} href={`/artykul/${r.slug[loc]}`} style={{ background: colors.bg, padding: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ aspectRatio: '16/9', overflow: 'hidden', marginBottom: 12 }}>
                  <ImageSlot src={r.coverImageUrl} alt={r.title[loc]} placeholder="Powiązany" objectPosition={r.coverImagePosition} sizes="(max-width: 640px) 100vw, 280px" />
                </div>
                <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.14em', color: colors.accent, textTransform: 'uppercase' }}>
                  {cat.label[loc]} · {getSubcategoryLabel(r.category, r.subcategory, loc)}
                </div>
                <div style={{ fontFamily: fontFamily.serif, fontSize: 22, lineHeight: 1.15 }}>{r.title[loc]}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
