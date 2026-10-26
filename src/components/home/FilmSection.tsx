import { Link } from '@/i18n/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { ExpandableGrid } from '@/components/ExpandableGrid';
import { CameraIcon } from '@/components/icons/CameraIcon';
import { colors, fontFamily } from '@/lib/theme';
import { getCategory, getSubcategoryLabel } from '@/lib/data/categories';
import type { Article, Locale } from '@/lib/types';

export function FilmSection({ locale, articles, limit = 4 }: { locale: Locale; articles: Article[]; limit?: number }) {
  const cat = getCategory('film')!;
  const feature = articles.find((a) => a.featured) ?? articles[0] ?? null;
  const list = articles.filter((a) => a.id !== feature?.id);

  const row = (a: Article, i: number) => (
    <Reveal
      key={a.id}
      as="a"
      href={`/artykul/${a.slug[locale]}`}
      className="tk-film-row"
      style={{ padding: '20px 0', borderBottom: `1px solid ${colors.line}` }}
    >
      <span className="tk-fr-nr" style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.muted }}>{String(i + 1).padStart(2, '0')}</span>
      <span className="tk-fr-title" style={{ fontFamily: fontFamily.serif, fontSize: 'clamp(18px, 3vw, 26px)' }}>{a.title[locale]}</span>
      <span className="tk-fr-cat" style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.accent, letterSpacing: '.1em', textTransform: 'uppercase' }}>
        {getSubcategoryLabel('film', a.subcategory, locale)}
      </span>
      <span className="tk-fr-score" style={{ fontFamily: fontFamily.serif, fontSize: 'clamp(18px, 3vw, 26px)', color: a.rating != null ? colors.fg : colors.muted }}>
        {a.rating != null ? a.rating.toFixed(1).replace('.', ',') : '—'}
      </span>
    </Reveal>
  );

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
                <ImageSlot src={feature.coverImageUrl} alt={feature.title[locale]} placeholder="Kadr filmowy" objectPosition={feature.coverImagePosition} />
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

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="tk-film-row-header" style={{ gap: 32, padding: '20px 0', borderBottom: `1px solid ${colors.line}`, fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase' }}>
              <span>Nr</span>
              <span>{locale === 'pl' ? 'Tytuł' : 'Title'}</span>
              <span>{locale === 'pl' ? 'Kategoria' : 'Category'}</span>
              <span style={{ textAlign: 'right' }}>{locale === 'pl' ? 'Ocena' : 'Score'}</span>
            </div>
            <ExpandableGrid
              wrapperStyle={{ display: 'flex', flexDirection: 'column' }}
              visible={list.slice(0, limit).map((a, i) => row(a, i))}
              extra={list.slice(limit).map((a, i) => row(a, limit + i))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
