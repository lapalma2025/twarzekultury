import Image from 'next/image';
import { colors, fontFamily } from '@/lib/theme';

interface ImageSlotProps {
  src?: string | null;
  alt: string;
  placeholder: string;
  sizes?: string;
  priority?: boolean;
  /** CSS object-position — focal point from admin crop tool. */
  objectPosition?: string | null;
  /** Override quality (hero can stay sharper; cards stay light). */
  quality?: number;
}

/**
 * Fills a sized parent (aspect-ratio + overflow). Server Component — no
 * hydration wait, no opacity:0 gate that made photos feel “stuck loading”.
 * Skeleton sits underneath; the real image covers it as soon as it paints.
 */
export function ImageSlot({
  src,
  alt,
  placeholder,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  objectPosition,
  quality = 72,
}: ImageSlotProps) {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '100%' }}>
      {src ? (
        <>
          <div className="tk-img-skeleton" aria-hidden style={{ position: 'absolute', inset: 0 }} />
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            quality={quality}
            decoding="async"
            style={{
              objectFit: 'cover',
              objectPosition: objectPosition || 'center 22%',
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg} 100%)`,
            border: '1px solid rgba(242,236,221,.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: fontFamily.mono,
              fontSize: 10,
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              color: colors.muted,
            }}
          >
            {placeholder}
          </span>
        </div>
      )}
    </div>
  );
}
