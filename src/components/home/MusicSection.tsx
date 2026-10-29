import { Link } from '@/i18n/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { ExpandableGrid } from '@/components/ExpandableGrid';
import { VinylIcon } from '@/components/icons/VinylIcon';
import { colors, fontFamily } from '@/lib/theme';
import { getCategory, getSubcategoryLabel } from '@/lib/data/categories';
import type { Article, Locale } from '@/lib/types';
import { pickSectionLead } from '@/lib/section-lead';

export function MusicSection({ locale, articles, limit = 4 }: { locale: Locale; articles: Article[]; limit?: number }) {
  const cat = getCategory('muzyka')!;
  // Pinned „artykuł główny”, otherwise newest by publish date.
  // Skip sitewide „Twarz tygodnia” in the card grid so it isn't repeated.
  const feature = pickSectionLead(articles);
  const rest = articles.filter((a) => a.id !== feature?.id && !a.featured);
  const withPhoto = rest.filter((a) => a.coverImageUrl);
  const withoutPhoto = rest.filter((a) => !a.coverImageUrl);
  const cardArticles = [...withPhoto, ...withoutPhoto];

  return (
    <section id="muzyka" data-tk-section className="tk-section-pad" style={{ borderBottom: `1px solid ${colors.line}`, position: 'relative' }}>
      <div className="tk-section-layout" style={{ display: 'grid', alignItems: 'start' }}>
        <div className="tk-section-sidebar">
          <h2 className="tk-section-title" style={{ fontFamily: fontFamily.serif, fontWeight: 300, letterSpacing: '-.04em', margin: 0 }}>
            <SplitText mode="chars" text={cat.titleParts[0]} />
            <SplitText mode="chars" text={cat.titleParts[1]} style={{ fontStyle: 'italic' }} />
            <SplitText mode="chars" text={cat.titleParts[2]} />
          </h2>
          <div style={{ fontFamily: fontFamily.serif, fontSize: 18, lineHeight: 1.5, color: colors.muted, marginTop: 32, maxWidth: '32ch', fontStyle: 'italic' }}>
            {cat.intro[locale]}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 40, fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            {cat.subcategories.map((s) => (
              <Link key={s.key} href={`/kategoria/muzyka?sub=${s.key}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${colors.line2}` }}>
                <span>{s.label[locale]}</span>
                <span style={{ color: colors.muted }}>{articles.filter((a) => a.subcategory === s.key).length}</span>
              </Link>
            ))}
          </div>
          <div className="tk-anim-icon">
            <VinylIcon />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
          {feature && (
            <Reveal as="a" href={`/artykul/${feature.slug[locale]}`} className="tk-feature-grid" style={{ display: 'grid', gap: 32, alignItems: 'center' }}>
              <div style={{ aspectRatio: '1/1', overflow: 'hidden' }}>
                <ImageSlot src={feature.coverImageUrl} alt={feature.title[locale]} placeholder="Okładka albumu" objectPosition={feature.coverImagePosition} sizes="(max-width: 720px) 100vw, 42vw" />
              </div>
              <div>
                <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.accent, textTransform: 'uppercase', marginBottom: 16 }}>
                  {getSubcategoryLabel('muzyka', feature.subcategory, locale)}
                </div>
                <h3 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 'clamp(30px, 6vw, 52px)', lineHeight: 0.98, letterSpacing: '-.02em', margin: '0 0 24px', textWrap: 'balance' }}>{feature.title[locale]}</h3>
                <p style={{ fontFamily: fontFamily.serif, fontSize: 18, lineHeight: 1.55, color: colors.muted2, margin: '0 0 28px' }}>{feature.lead[locale]}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  {feature.rating != null && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontFamily: fontFamily.serif, fontSize: 64, fontWeight: 300, lineHeight: 1 }}>{feature.rating.toFixed(1).replace('.', ',')}</span>
                        <span style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.muted }}>/ 10</span>
                      </div>
                      <div style={{ width: 1, height: 48, background: colors.line3 }} />
                    </>
                  )}
                  <div style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, letterSpacing: '.08em', textTransform: 'uppercase', lineHeight: 1.6 }}>
                    {feature.author}
                    <br />
                    <span style={{ color: colors.fg }}>
                      {new Date(feature.publishedAt ?? feature.createdAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'pl-PL')}
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          <ExpandableGrid
            wrapperClassName="tk-cards-2"
            wrapperStyle={{ display: 'grid', gap: 1, background: colors.line }}
            visible={cardArticles.slice(0, limit).map((a, i) => (
              <Reveal as="article" key={a.id} style={{ background: colors.bg, padding: '0 0 36px' }}>
                <Link href={`/artykul/${a.slug[locale]}`}>
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden', marginBottom: 24 }}>
                    <ImageSlot src={a.coverImageUrl} alt={a.title[locale]} placeholder="Ilustracja" objectPosition={a.coverImagePosition} sizes="(max-width: 640px) 100vw, 50vw" />
                  </div>
                  <div style={{ padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                    <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.accent, textTransform: 'uppercase' }}>
                      {getSubcategoryLabel('muzyka', a.subcategory, locale)}
                    </div>
                    <div style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted }}>{String(i + 1).padStart(2, '0')}</div>
                  </div>
                  <h4 style={{ padding: '0 32px', fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 28, lineHeight: 1.05, letterSpacing: '-.01em', margin: '0 0 14px' }}>{a.title[locale]}</h4>
                  <p style={{ padding: '0 32px', fontFamily: fontFamily.serif, fontSize: 15, lineHeight: 1.55, color: colors.muted, margin: '0 0 20px' }}>{a.lead[locale]}</p>
                  <div style={{ padding: '0 32px', fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {a.author}
                  </div>
                </Link>
              </Reveal>
            ))}
            extra={cardArticles.slice(limit).map((a, i) => (
              <Reveal as="article" key={a.id} style={{ background: colors.bg, padding: '0 0 36px' }}>
                <Link href={`/artykul/${a.slug[locale]}`}>
                  <div style={{ aspectRatio: '16/9', overflow: 'hidden', marginBottom: 24 }}>
                    <ImageSlot src={a.coverImageUrl} alt={a.title[locale]} placeholder="Ilustracja" objectPosition={a.coverImagePosition} sizes="(max-width: 640px) 100vw, 50vw" />
                  </div>
                  <div style={{ padding: '0 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                    <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.accent, textTransform: 'uppercase' }}>
                      {getSubcategoryLabel('muzyka', a.subcategory, locale)}
                    </div>
                    <div style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted }}>{String(limit + i + 1).padStart(2, '0')}</div>
                  </div>
                  <h4 style={{ padding: '0 32px', fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 28, lineHeight: 1.05, letterSpacing: '-.01em', margin: '0 0 14px' }}>{a.title[locale]}</h4>
                  <p style={{ padding: '0 32px', fontFamily: fontFamily.serif, fontSize: 15, lineHeight: 1.55, color: colors.muted, margin: '0 0 20px' }}>{a.lead[locale]}</p>
                  <div style={{ padding: '0 32px', fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {a.author}
                  </div>
                </Link>
              </Reveal>
            ))}
          />
        </div>
      </div>
    </section>
  );
}
