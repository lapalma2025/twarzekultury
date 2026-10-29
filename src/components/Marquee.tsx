import { Link } from '@/i18n/navigation';
import { colors, fontFamily } from '@/lib/theme';

export type MarqueeItem = {
  title: string;
  href: string;
};

export function Marquee({ items }: { items: MarqueeItem[] }) {
  if (!items.length) return null;

  // Duplicate so the CSS loop scrolls seamlessly without a visible jump.
  const doubled = [...items, ...items];

  return (
    <div
      style={{
        borderBottom: `1px solid ${colors.line}`,
        overflow: 'hidden',
        padding: '12px 0',
        background: 'rgba(20,18,14,.4)',
      }}
      aria-label="Najnowsze artykuły"
    >
      <div
        style={{
          display: 'flex',
          gap: 56,
          whiteSpace: 'nowrap',
          animation: 'tk-marquee 60s linear infinite',
          fontFamily: fontFamily.mono,
          fontSize: 12,
          color: colors.muted,
          letterSpacing: '.06em',
          width: 'max-content',
        }}
      >
        {doubled.map((item, i) => (
          <Link
            key={`${item.href}-${i}`}
            href={item.href}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            ◉ {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
