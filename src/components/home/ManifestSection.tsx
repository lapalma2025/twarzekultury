import { Reveal } from '@/components/Reveal';
import { colors, fontFamily } from '@/lib/theme';
import type { SiteContent } from '@/lib/site-content';
import type { Locale } from '@/lib/types';

export function ManifestSection({ locale, content }: { locale: Locale; content: SiteContent }) {
  const m = content.manifest;

  return (
    <Reveal className="tk-section-pad" style={{ display: 'block', textAlign: 'center', borderBottom: `1px solid ${colors.line}` }}>
      <blockquote
        style={{
          fontFamily: fontFamily.serif,
          fontWeight: 300,
          fontSize: 'clamp(36px,5vw,72px)',
          lineHeight: 1.05,
          letterSpacing: '-.02em',
          maxWidth: '22ch',
          margin: '0 auto',
          textWrap: 'balance',
        }}
      >
        {m.quotePre[locale]} <span style={{ fontStyle: 'italic', color: colors.accent }}>{m.quoteIta[locale]}</span>
        {m.quotePost[locale]}
      </blockquote>
      <div
        style={{
          fontFamily: fontFamily.mono,
          fontSize: 11,
          letterSpacing: '.14em',
          color: colors.muted,
          textTransform: 'uppercase',
          marginTop: 40,
        }}
      >
        {m.signature[locale]}
      </div>
    </Reveal>
  );
}
