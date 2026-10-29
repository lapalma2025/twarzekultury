import { Link } from '@/i18n/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { ExpandableGrid } from '@/components/ExpandableGrid';
import { GamepadIcon } from '@/components/icons/GamepadIcon';
import { colors, fontFamily } from '@/lib/theme';
import { getCategory, getSubcategoryLabel } from '@/lib/data/categories';
import type { Article, Locale } from '@/lib/types';
import { orderWithSectionLead } from '@/lib/section-lead';

export function GamesSection({ locale, articles, limit = 2 }: { locale: Locale; articles: Article[]; limit?: number }) {
  const cat = getCategory('gry')!;
  const ordered = orderWithSectionLead(articles);

  const row = (a: Article, i: number) => {
    const media = (
      <div className="tk-games-media" style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
        <ImageSlot src={a.coverImageUrl} alt={a.title[locale]} placeholder="Screenshot" objectPosition={a.coverImagePosition} sizes="(max-width: 720px) 100vw, 50vw" />
      </div>
    );
    const text = (
      <div className="tk-games-text">
        <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.accent, textTransform: 'uppercase', marginBottom: 14 }}>
          {getSubcategoryLabel('gry', a.subcategory, locale)}
        </div>
        <h3 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 'clamp(28px, 5.5vw, 44px)', lineHeight: 1, letterSpacing: '-.02em', margin: '0 0 18px' }}>{a.title[locale]}</h3>
        <p style={{ fontFamily: fontFamily.serif, fontSize: 16, lineHeight: 1.55, color: colors.muted2, margin: '0 0 20px' }}>{a.lead[locale]}</p>
        {a.rating != null ? (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <span style={{ fontFamily: fontFamily.serif, fontSize: 44, fontWeight: 300 }}>{a.rating.toFixed(1).replace('.', ',')}</span>
            <span style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted }}>/ 10</span>
          </div>
        ) : (
          <div style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {a.author}
          </div>
        )}
      </div>
    );

    return (
      <Reveal key={a.id} as="a" href={`/artykul/${a.slug[locale]}`} className="tk-games-row" style={{ display: 'grid', gap: 32, alignItems: 'center' }}>
        {i % 2 === 0 ? (
          <>
            {media}
            {text}
          </>
        ) : (
          <>
            {text}
            {media}
          </>
        )}
      </Reveal>
    );
  };

  return (
    <section id="gry" data-tk-section className="tk-section-pad" style={{ borderBottom: `1px solid ${colors.line}` }}>
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
              <Link key={s.key} href={`/kategoria/gry?sub=${s.key}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${colors.line2}` }}>
                <span>{s.label[locale]}</span>
                <span style={{ color: colors.muted }}>{articles.filter((a) => a.subcategory === s.key).length}</span>
              </Link>
            ))}
          </div>
          <div className="tk-anim-icon">
            <GamepadIcon />
          </div>
        </div>

        <ExpandableGrid
          wrapperStyle={{ display: 'flex', flexDirection: 'column', gap: 48 }}
          visible={ordered.slice(0, limit).map((a, i) => row(a, i))}
          extra={ordered.slice(limit).map((a, i) => row(a, limit + i))}
        />
      </div>
    </section>
  );
}
