'use client';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1 style={{ fontSize: 24, fontWeight: 400, marginBottom: 12 }}>Błąd panelu</h1>
      <p style={{ color: '#8B857A', fontSize: 13, marginBottom: 24 }}>
        {error.message || 'Nie udało się załadować tej strony.'}
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
  );
}
