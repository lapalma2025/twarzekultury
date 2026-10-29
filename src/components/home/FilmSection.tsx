import { Link } from '@/i18n/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { ExpandableGrid } from '@/components/ExpandableGrid';
import { CameraIcon } from '@/components/icons/CameraIcon';
import { colors, fontFamily } from '@/lib/theme';
import { getCategory, getSubcategoryLabel } from '@/lib/data/categories';
import type { Article, Locale } from '@/lib/types';
import { pickSectionLead } from '@/lib/section-lead';

function FilmCard({ locale, a }: { locale: Locale; a: Article }) {
  return (
    <Reveal as="a" href={`/artykul/${a.slug[locale]}`} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ aspectRatio: '16/10', overflow: 'hidden', marginBottom: 18 }}>
        <ImageSlot src={a.coverImageUrl} alt={a.title[locale]} placeholder="Kadr filmowy" objectPosition={a.coverImagePosition} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 28vw" />
      </div>
      <div style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.accent, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>
        {getSubcategoryLabel('film', a.subcategory, locale)}
      </div>
      <h3 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 'clamp(22px, 4vw, 28px)', lineHeight: 1.1, letterSpacing: '-.01em', margin: '0 0 12px' }}>
        {a.title[locale]}
      </h3>
      <p style={{ fontFamily: fontFamily.serif, fontSize: 15, lineHeight: 1.5, color: colors.muted, margin: 0 }}>{a.lead[locale]}</p>
    </Reveal>
  );
}

export function FilmSection({ locale, articles, limit = 4 }: { locale: Locale; articles: Article[]; limit?: number }) {
  const cat = getCategory('film')!;
  const feature = pickSectionLead(articles);
  const rest = articles.filter((a) => a.id !== feature?.id);

  return (
    <section id="film" data-tk-section className="tk-section-pad" style={{ borderBottom: `1px solid ${colors.line}` }}>
      <div className="tk-section-layout" style={{ display: 'grid', alignItems: 'start' }}>
        <div className="tk-section-sidebar">
          <h2 className="tk-section-title" style={{ fontFamily: fontFamily.serif, fontWeight: 300, letterSpacing: '-.04em', margin: 0 }}>
            <SplitText mode="chars" text={cat.label[locale]} style={{ fontStyle: 'italic' }} />
          </h2>
          <div style={{ fontFamily: fontFamily.serif, fontSize: 18, lineHeight: 1.5, color: colors.muted, marginTop: 32, maxWidth: '32ch', fontStyle: 'italic' }}>
            {cat.intro[locale]}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 40, fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase' }}>
            {cat.subcategories.map((s) => (
              <Link key={s.key} href={`/kategoria/film?sub=${s.key}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${colors.line2}` }}>
                <span>{s.label[locale]}</span>
                <span style={{ color: colors.muted }}>{articles.filter((a) => a.subcategory === s.key).length}</span>
              </Link>
            ))}
          </div>
          <div className="tk-anim-icon">
            <CameraIcon />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {feature && (
            <Reveal as="a" href={`/artykul/${feature.slug[locale]}`}>
              <div style={{ aspectRatio: '21/9', overflow: 'hidden', position: 'relative', marginBottom: 28 }}>
                <ImageSlot src={feature.coverImageUrl} alt={feature.title[locale]} placeholder="Kadr filmowy" objectPosition={feature.coverImagePosition} sizes="(max-width: 1024px) 100vw, 70vw" />
              </div>
              <div className="tk-film-feature-bottom" style={{ display: 'grid' }}>
                <h3 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 'clamp(32px, 7vw, 56px)', lineHeight: 0.98, letterSpacing: '-.02em', margin: 0, textWrap: 'balance' }}>{feature.title[locale]}</h3>
                <div>
                  <p style={{ fontFamily: fontFamily.serif, fontSize: 16, lineHeight: 1.55, color: colors.muted2, margin: '0 0 18px' }}>{feature.lead[locale]}</p>
                  <div style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                    {feature.author} · {getSubcategoryLabel('film', feature.subcategory, locale)}
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {rest.length > 0 && (
            <ExpandableGrid
              wrapperStyle={{ display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
              visible={rest.slice(0, limit).map((a) => <FilmCard key={a.id} locale={locale} a={a} />)}
              extra={rest.slice(limit).map((a) => <FilmCard key={a.id} locale={locale} a={a} />)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
