import Link from 'next/link';

export default function RootNotFound() {
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
          <p style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8B857A', margin: '0 0 12px' }}>
            404
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 400, margin: '0 0 16px' }}>Nie znaleziono strony</h1>
          <Link href="/pl" style={{ color: '#E85D3C' }}>
            Wróć na stronę główną
          </Link>
        </div>
      </body>
    </html>
  );
}
