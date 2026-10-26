import { colors, fontFamily } from '@/lib/theme';

export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div style={{ borderBottom: `1px solid ${colors.line}`, overflow: 'hidden', padding: '12px 0', background: 'rgba(20,18,14,.4)' }}>
      <div
        style={{
          display: 'flex', gap: 56, whiteSpace: 'nowrap', animation: 'tk-marquee 60s linear infinite',
          fontFamily: fontFamily.mono, fontSize: 12, color: colors.muted, letterSpacing: '.06em',
        }}
      >
        {doubled.map((text, i) => (
          <span key={i}>◉ {text}</span>
        ))}
      </div>
    </div>
  );
}
