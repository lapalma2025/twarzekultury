'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0B0A08',
          color: '#F2ECDD',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 400, margin: '0 0 12px' }}>Coś poszło nie tak</h1>
          <p style={{ color: '#8B857A', margin: '0 0 24px', fontSize: 14 }}>
            {error.digest ? `Błąd · ${error.digest}` : 'Spróbuj odświeżyć stronę.'}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#E85D3C',
              color: '#0B0A08',
              border: 0,
              padding: '12px 20px',
              fontSize: 12,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Spróbuj ponownie
          </button>
        </div>
      </body>
    </html>
  );
}
