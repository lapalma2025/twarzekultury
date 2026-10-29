import { Link } from '@/i18n/navigation';
import { colors, fontFamily } from '@/lib/theme';

export default function LocaleNotFound() {
  return (
    <main
      style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 20px',
        textAlign: 'center',
      }}
    >
      <div>
        <p
          style={{
            fontFamily: fontFamily.mono,
            fontSize: 11,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: colors.muted,
            margin: '0 0 12px',
          }}
        >
          404
        </p>
        <h1 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 36, margin: '0 0 16px' }}>
          Nie znaleziono strony
        </h1>
        <Link href="/" style={{ color: colors.accent, fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.08em' }}>
          ← Strona główna
        </Link>
      </div>
    </main>
  );
}
