import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { Reveal } from '@/components/Reveal';
import { colors, fontFamily } from '@/lib/theme';
import { CATEGORIES, getCategory, getSubcategoryLabel } from '@/lib/data/categories';
import { listArticles } from '@/lib/data/articles';
import { buildPageMetadata } from '@/lib/seo';
import type { Category, Locale } from '@/lib/types';

interface Props {
  params: Promise<{ locale: string; cat: string }>;
  searchParams: Promise<{ sub?: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ cat: c.key }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, cat: catKey } = await params;
  const cat = getCategory(catKey);
  if (!cat) return {};
  const loc = locale as Locale;

  return buildPageMetadata({
    locale: loc,
    title: cat.label[loc],
    description: cat.intro[loc],
    path: `/${loc}/kategoria/${catKey}`,
    pathPl: `/pl/kategoria/${catKey}`,
    pathEn: `/en/kategoria/${catKey}`,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { locale, cat: catKey } = await params;
  const { sub } = await searchParams;
  setRequestLocale(locale);
  const loc = locale as Locale;
  const cat = getCategory(catKey);
  if (!cat) notFound();

  const t = await getTranslations({ locale, namespace: 'category' });
  const nav = await getTranslations({ locale, namespace: 'nav' });

  const allInCat = await listArticles({ status: 'published', category: catKey as Category });
  const filtered = sub ? allInCat.filter((a) => a.subcategory === sub) : allInCat;
  const [featured, ...rest] = filtered;

  return (
    <main className="tk-container" style={{ maxWidth: 1600, margin: '0 auto' }}>
      <div style={{ padding: '32px 0 12px', fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase' }}>
        <Link href="/">Twarze Kultury</Link>
        <span style={{ margin: '0 12px' }}>/</span>
        <span style={{ color: colors.fg }}>{cat.label[loc]}</span>
        {sub && (
          <>
            <span style={{ margin: '0 12px' }}>/</span>
            <span style={{ color: colors.accent }}>{getSubcategoryLabel(catKey, sub, loc)}</span>
          </>
        )}
      </div>

      <section style={{ padding: '32px 0 56px', borderBottom: `1px solid ${colors.line}` }}>
        <div className="tk-cat-hero-grid" style={{ display: 'grid' }}>
          <h1 className="tk-cat-title" style={{ fontFamily: fontFamily.serif, fontWeight: 300, letterSpacing: '-.04em', margin: 0 }}>
            {cat.titleParts[0]}
            <span style={{ fontStyle: 'italic' }}>{cat.titleParts[1]}</span>
            {cat.titleParts[2]}
          </h1>
          <div className="tk-cat-meta" style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase', lineHeight: 1.8 }}>
            <div>{cat.label[loc]}</div>
            <div>
              {t('materialsCount')} · {allInCat.length}
            </div>
            <div>{t('updatedToday')}</div>
          </div>
        </div>
        <p style={{ fontFamily: fontFamily.serif, fontSize: 22, lineHeight: 1.5, color: colors.muted2, maxWidth: '56ch', margin: '40px 0 0', fontStyle: 'italic' }}>{cat.intro[loc]}</p>
      </section>

      <section style={{ padding: '32px 0', borderBottom: `1px solid ${colors.line}`, position: 'sticky', top: 66, zIndex: 80, background: 'rgba(11,10,8,.9)', backdropFilter: 'blur(14px)' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Link
            href={`/kategoria/${catKey}`}
            style={{
              padding: '14px 22px', fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
              border: `1px solid ${!sub ? colors.accent : colors.line3}`, background: !sub ? colors.accent : 'transparent',
              color: !sub ? colors.bg : colors.fg, display: 'flex', alignItems: 'center', gap: 12,
            }}
          >
            <span>{t('allItems')}</span>
            <span style={{ color: !sub ? colors.bg : colors.muted, fontSize: 10 }}>{allInCat.length}</span>
          </Link>
          {cat.subcategories.map((s) => {
            const active = sub === s.key;
            const count = allInCat.filter((a) => a.subcategory === s.key).length;
            return (
              <Link
                key={s.key}
                href={`/kategoria/${catKey}?sub=${s.key}`}
                style={{
                  padding: '14px 22px', fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase',
                  border: `1px solid ${active ? colors.accent : colors.line3}`, background: active ? colors.accent : 'transparent',
                  color: active ? colors.bg : colors.fg, display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <span>{s.label[loc]}</span>
                <span style={{ color: active ? colors.bg : colors.muted, fontSize: 10 }}>{count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {featured && (
        <section style={{ padding: '72px 0', borderBottom: `1px solid ${colors.line}` }}>
          <Reveal as="a" href={`/artykul/${featured.slug[loc]}`} className="tk-cat-featured-grid" style={{ display: 'grid', alignItems: 'center' }}>
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
              <ImageSlot src={featured.coverImageUrl} alt={featured.title[loc]} placeholder="Zdjęcie główne" objectPosition={featured.coverImagePosition} sizes="(max-width: 900px) 100vw, 55vw" quality={78} priority />
              <div style={{ position: 'absolute', top: 20, left: 20, fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.16em', color: colors.fg, background: colors.accent, padding: '6px 10px', textTransform: 'uppercase' }}>
                {t('featured')}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.accent, textTransform: 'uppercase', marginBottom: 20 }}>
                {cat.label[loc]} · {getSubcategoryLabel(catKey, featured.subcategory, loc)}
              </div>
              <h2 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 'clamp(30px,5vw,64px)', lineHeight: 0.98, letterSpacing: '-.02em', margin: '0 0 24px', textWrap: 'balance' }}>{featured.title[loc]}</h2>
              <p style={{ fontFamily: fontFamily.serif, fontSize: 19, lineHeight: 1.55, color: colors.muted2, margin: '0 0 28px', maxWidth: '48ch' }}>{featured.lead[loc]}</p>
              <div style={{ display: 'flex', gap: 20, fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                <span>{featured.author}</span>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <section style={{ padding: '72px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase' }}>
            {t('allItems')} · {filtered.length} {t('items')}
          </div>
          <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase' }}>{t('sort')}</div>
        </div>

        {rest.length === 0 ? (
          <p style={{ fontFamily: fontFamily.serif, color: colors.muted, fontSize: 18 }}>—</p>
        ) : (
          <div className="tk-cards-3" style={{ display: 'grid', gap: 1, background: colors.line }}>
            {rest.map((a, i) => (
              <Reveal as="a" key={a.id} href={`/artykul/${a.slug[loc]}`} style={{ background: colors.bg, display: 'flex', flexDirection: 'column' }}>
                <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                  <ImageSlot src={a.coverImageUrl} alt={a.title[loc]} placeholder="Ilustracja" objectPosition={a.coverImagePosition} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                </div>
                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                    <div style={{ fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.14em', color: colors.accent, textTransform: 'uppercase' }}>
                      {getSubcategoryLabel(catKey, a.subcategory, loc)}
                    </div>
                    <div style={{ fontFamily: fontFamily.mono, fontSize: 10, color: colors.muted }}>{String(i + 1).padStart(2, '0')}</div>
                  </div>
                  <h3 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 24, lineHeight: 1.1, letterSpacing: '-.01em', margin: '0 0 14px', textWrap: 'balance' }}>{a.title[loc]}</h3>
                  <p style={{ fontFamily: fontFamily.serif, fontSize: 14, lineHeight: 1.55, color: colors.muted, margin: '0 0 18px', flex: 1 }}>{a.lead[loc]}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: fontFamily.mono, fontSize: 10, color: colors.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    <span>{a.author}</span>
                    <span>{new Date(a.publishedAt ?? a.createdAt).toLocaleDateString(loc === 'en' ? 'en-US' : 'pl-PL')}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
