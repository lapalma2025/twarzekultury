'use client';

import { useEffect } from 'react';
import { colors, fontFamily } from '@/lib/theme';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
        <h1 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 36, margin: '0 0 12px' }}>
          Coś poszło nie tak
        </h1>
        <p style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.muted, margin: '0 0 28px' }}>
          Spróbuj ponownie albo wróć na stronę główną.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            background: colors.accent,
            color: colors.bg,
            border: 0,
            padding: '12px 22px',
            fontFamily: fontFamily.mono,
            fontSize: 11,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Spróbuj ponownie
        </button>
      </div>
    </main>
  );
}
