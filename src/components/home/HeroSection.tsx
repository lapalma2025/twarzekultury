import { Link } from '@/i18n/navigation';
import { ImageSlot } from '@/components/ImageSlot';
import { SplitText } from '@/components/SplitText';
import { colors, fontFamily } from '@/lib/theme';
import { getSubcategoryLabel } from '@/lib/data/categories';
import type { SiteContent } from '@/lib/site-content';
import type { Article, Locale } from '@/lib/types';

function articleHref(locale: Locale, a: Article) {
  return `/artykul/${a.slug[locale]}`;
}

export function HeroSection({
  locale,
  lead,
  second,
  third,
  content,
}: {
  locale: Locale;
  lead: Article | null;
  second: Article | null;
  third: Article | null;
  content: SiteContent;
}) {
  const h = content.hero;

  return (
    <section className="tk-hero-pad" style={{ borderBottom: `1px solid ${colors.line}` }}>
      <h1
        className="tk-hero-title"
        style={{
          fontFamily: fontFamily.serif,
          fontWeight: 300,
          letterSpacing: '-.03em',
          marginLeft: 'auto',
          marginRight: 'auto',
          textWrap: 'balance',
          textAlign: 'center',
          maxWidth: '22ch',
        }}
      >
        <SplitText mode="words" text={`${h.titlePre[locale]} `} />
        <SplitText mode="words" text={h.titleIta[locale]} style={{ fontStyle: 'italic', fontWeight: 400 }} />
        <SplitText mode="words" text={` ${h.titlePost[locale]}`} />
        <br />
        <SplitText mode="words" text={h.titleGray[locale]} style={{ color: colors.muted }} />
      </h1>

      <div className="tk-hero-grid" style={{ display: 'grid', gap: 1, background: colors.line }}>
        <article style={{ background: colors.bg, display: 'flex', flexDirection: 'column' }}>
          {lead && (
            <Link href={articleHref(locale, lead)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
                <ImageSlot
                  src={lead.coverImageUrl}
                  alt={lead.title[locale]}
                  placeholder="Portret — sesja główna"
                  objectPosition={lead.coverImagePosition}
                  sizes="(max-width: 900px) 100vw, 45vw"
                  quality={78}
                  priority
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    fontFamily: fontFamily.mono,
                    fontSize: 10,
                    letterSpacing: '.16em',
                    color: colors.fg,
                    background: colors.accent,
                    padding: '6px 10px',
                    textTransform: 'uppercase',
                  }}
                >
                  {h.weekFaceLabel[locale]}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40%',
                    background: 'linear-gradient(transparent,rgba(11,10,8,.9))',
                  }}
                />
              </div>
              <div style={{ padding: '32px 28px 36px' }}>
                <div
                  style={{
                    fontFamily: fontFamily.mono,
                    fontSize: 11,
                    letterSpacing: '.14em',
                    color: colors.accent,
                    textTransform: 'uppercase',
                    marginBottom: 14,
                  }}
                >
                  {lead.category} · {getSubcategoryLabel(lead.category, lead.subcategory, locale)}
                </div>
                <h2
                  style={{
                    fontFamily: fontFamily.serif,
                    fontWeight: 400,
                    fontSize: 44,
                    lineHeight: 1,
                    letterSpacing: '-.02em',
                    margin: '0 0 18px',
                    textWrap: 'balance',
                  }}
                >
                  {lead.title[locale]}
                </h2>
                <p style={{ fontFamily: fontFamily.serif, fontSize: 17, lineHeight: 1.5, color: colors.muted2, margin: '0 0 20px', maxWidth: '52ch' }}>
                  {lead.lead[locale]}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    fontFamily: fontFamily.mono,
                    fontSize: 11,
                    color: colors.muted,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span>{lead.author}</span>
                </div>
              </div>
            </Link>
          )}
        </article>

        {[second, third].map((item, i) =>
          item ? (
            <article key={item.id} style={{ background: colors.bg }}>
              <Link href={articleHref(locale, item)} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                  <ImageSlot
                    src={item.coverImageUrl}
                    alt={item.title[locale]}
                    placeholder={i === 0 ? 'Kadr filmowy' : 'Sport / ring'}
                    objectPosition={item.coverImagePosition}
                    sizes="(max-width: 900px) 100vw, 28vw"
                    quality={75}
                    priority
                  />
                </div>
                <div style={{ padding: 28 }}>
                  <div
                    style={{
                      fontFamily: fontFamily.mono,
                      fontSize: 11,
                      letterSpacing: '.14em',
                      color: colors.muted,
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}
                  >
                    {item.category} · {getSubcategoryLabel(item.category, item.subcategory, locale)}
                  </div>
                  <h3
                    style={{
                      fontFamily: fontFamily.serif,
                      fontWeight: 400,
                      fontSize: 30,
                      lineHeight: 1.05,
                      letterSpacing: '-.01em',
                      margin: '0 0 14px',
                    }}
                  >
                    {item.title[locale]}
                  </h3>
                  <p style={{ fontFamily: fontFamily.serif, fontSize: 15, lineHeight: 1.5, color: colors.muted, margin: 0 }}>
                    {item.lead[locale]}
                  </p>
                </div>
              </Link>
            </article>
          ) : (
            <article key={i} style={{ background: colors.bg }} />
          ),
        )}
      </div>
    </section>
  );
}
