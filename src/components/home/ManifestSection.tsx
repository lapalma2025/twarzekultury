import { useTranslations } from 'next-intl';
import { Reveal } from '@/components/Reveal';
import { colors, fontFamily } from '@/lib/theme';

export function ManifestSection() {
  const t = useTranslations('home.manifest');

  return (
    <Reveal className="tk-section-pad" style={{ display: 'block', textAlign: 'center', borderBottom: `1px solid ${colors.line}` }}>
      <blockquote
        style={{
          fontFamily: fontFamily.serif, fontWeight: 300, fontSize: 'clamp(36px,5vw,72px)', lineHeight: 1.05,
          letterSpacing: '-.02em', maxWidth: '22ch', margin: '0 auto', textWrap: 'balance',
        }}
      >
        {t('quotePre')} <span style={{ fontStyle: 'italic', color: colors.accent }}>{t('quoteIta')}</span>
        {t('quotePost')}
      </blockquote>
      <div style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.14em', color: colors.muted, textTransform: 'uppercase', marginTop: 40 }}>{t('signature')}</div>
    </Reveal>
  );
}
