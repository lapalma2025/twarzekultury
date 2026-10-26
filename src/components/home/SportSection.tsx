import { Link } from '@/i18n/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { Reveal } from '@/components/Reveal';
import { SplitText } from '@/components/SplitText';
import { ExpandableGrid } from '@/components/ExpandableGrid';
import { BagIcon } from '@/components/icons/BagIcon';
import { colors, fontFamily } from '@/lib/theme';
import { getCategory, getSubcategoryLabel } from '@/lib/data/categories';
import type { Article, Locale } from '@/lib/types';

export function SportSection({ locale, articles, limit = 2 }: { locale: Locale; articles: Article[]; limit?: number }) {
  const cat = getCategory('sport')!;

  const card = (a: Article) => (
    <Reveal as="a" key={a.id} href={`/artykul/${a.slug[locale]}`} style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ aspectRatio: '4/5', overflow: 'hidden', marginBottom: 24, position: 'relative' }}>
        <ImageSlot src={a.coverImageUrl} alt={a.title[locale]} placeholder={a.title[locale]} objectPosition={a.coverImagePosition} />
        <div style={{ position: 'absolute', top: 20, left: 20, fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.16em', color: colors.fg, background: colors.accent, padding: '6px 10px', textTransform: 'uppercase' }}>
          {getSubcategoryLabel('sport', a.subcategory, locale)}
        </div>
      </div>
      <h3 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 'clamp(26px, 5vw, 36px)', lineHeight: 1, letterSpacing: '-.02em', margin: '0 0 16px' }}>{a.title[locale]}</h3>
      <p style={{ fontFamily: fontFamily.serif, fontSize: 16, lineHeight: 1.55, color: colors.muted, margin: '0 0 18px' }}>{a.lead[locale]}</p>
      <div style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>
        {a.author}
      </div>
    </Reveal>
  );

  return (
    <section id="sport" data-tk-section className="tk-section-pad" style={{ borderBottom: `1px solid ${colors.line}` }}>
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
              <Link key={s.key} href={`/kategoria/sport?sub=${s.key}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${colors.line2}` }}>
                <span>{s.label[locale]}</span>
                <span style={{ color: colors.muted }}>{articles.filter((a) => a.subcategory === s.key).length}</span>
              </Link>
            ))}
          </div>
          <div className="tk-anim-icon">
            <BagIcon />
          </div>
        </div>

        <ExpandableGrid
          wrapperClassName="tk-cards-2"
          wrapperStyle={{ display: 'grid', gap: 48 }}
          visible={articles.slice(0, limit).map((a) => card(a))}
          extra={articles.slice(limit).map((a) => card(a))}
        />
      </div>
    </section>
  );
}
