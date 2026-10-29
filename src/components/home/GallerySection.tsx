'use client';

import { useLocale } from 'next-intl';
import { ImageSlot } from '@/components/ImageSlot';
import { ParallaxItem } from '@/components/ParallaxItem';
import { SplitText } from '@/components/SplitText';
import { MaskIcon } from '@/components/icons/MaskIcon';
import { colors, fontFamily } from '@/lib/theme';
import type { SiteContent } from '@/lib/site-content';
import type { GalleryFrame, Locale } from '@/lib/types';

export function GallerySection({ frames, content }: { frames: GalleryFrame[]; content: SiteContent }) {
  const locale = useLocale() as Locale;
  const g = content.gallery;

  return (
    <section data-tk-section className="tk-section-pad" style={{ borderBottom: `1px solid ${colors.line}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, gap: 32, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32 }}>
          <div className="tk-anim-icon">
            <MaskIcon />
          </div>
          <div>
            <div
              style={{
                fontFamily: fontFamily.mono,
                fontSize: 11,
                letterSpacing: '.14em',
                color: colors.accent,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              {g.kicker[locale]}
            </div>
            <h3
              style={{
                fontFamily: fontFamily.serif,
                fontWeight: 300,
                fontSize: 'clamp(40px,5vw,72px)',
                letterSpacing: '-.02em',
                margin: 0,
                lineHeight: 1,
              }}
            >
              <SplitText mode="words" text={`${g.titlePre[locale]} `} />
              <SplitText mode="words" text={g.titleIta[locale]} style={{ fontStyle: 'italic' }} />
            </h3>
          </div>
        </div>
        <div style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.muted, letterSpacing: '.14em', textTransform: 'uppercase' }}>
          {g.meta[locale]}
        </div>
      </div>
      <div className="tk-gallery-grid" style={{ display: 'grid' }}>
        {frames.map((f, i) => (
          <ParallaxItem key={f.slot} amount={f.parallax} className={`tk-gal-${i + 1}`} style={{ overflow: 'hidden' }}>
            <ImageSlot
              src={f.imageUrl}
              alt={f.alt[locale] || f.alt.pl}
              placeholder={`Kadr ${String(i + 1).padStart(2, '0')}`}
              objectPosition={f.imagePosition || '50% 20%'}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              quality={70}
            />
          </ParallaxItem>
        ))}
      </div>
    </section>
  );
}
