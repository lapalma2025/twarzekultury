'use client';

import { useState } from 'react';
import Image from 'next/image';
import { colors, fontFamily } from '@/lib/theme';

interface ImageSlotProps {
  src?: string | null;
  alt: string;
  placeholder: string;
  sizes?: string;
  priority?: boolean;
  /** Bias for cropping when the image's aspect ratio doesn't match its frame
   * (e.g. a portrait photo in a wide banner) — keeps faces in frame instead
   * of centering blindly. Defaults to a slight top bias, which suits most
   * portraits; pass the article's own focal point when one was set in the
   * admin panel's crop tool. */
  objectPosition?: string | null;
}

/**
 * Fills its parent (a sized wrapper — aspect-ratio + overflow:hidden, same
 * contract as the original design's <image-slot>). Shows the real image once
 * an editor uploads a cover via the admin panel / Supabase Storage; until
 * then renders a labeled placeholder so empty content never looks "broken".
 * While the real photo is still downloading, a shimmering skeleton fills the
 * frame instead of a blank flash.
 */
export function ImageSlot({ src, alt, placeholder, sizes = '(max-width: 768px) 100vw, 50vw', priority = false, objectPosition }: ImageSlotProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100%' }}>
      {src ? (
        <>
          {!loaded && <div className="tk-img-skeleton" aria-hidden style={{ position: 'absolute', inset: 0 }} />}
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            quality={78}
            onLoad={() => setLoaded(true)}
            style={{ objectFit: 'cover', objectPosition: objectPosition || 'center 22%', opacity: loaded ? 1 : 0, transition: 'opacity .35s ease' }}
          />
        </>
      ) : (
        <div
          style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg} 100%)`,
            border: '1px solid rgba(242,236,221,.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.12em',
              textTransform: 'uppercase', color: colors.muted,
            }}
          >
            {placeholder}
          </span>
        </div>
      )}
    </div>
  );
}
