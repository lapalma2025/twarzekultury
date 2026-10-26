import Link from 'next/link';
import { listArticles } from '@/lib/data/articles';
import { getCategory } from '@/lib/data/categories';
import { colors, fontFamily } from '@/lib/theme';
import { DeleteButton } from './articles/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const articles = await listArticles();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
        <h1 style={{ fontFamily: fontFamily.serif, fontSize: 32, fontWeight: 400, margin: 0 }}>Artykuły</h1>
        <Link
          href="/admin/articles/new"
          style={{ background: colors.accent, color: colors.bg, padding: '10px 18px', fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase' }}
        >
          + Nowy artykuł
        </Link>
      </div>

      {articles.length === 0 ? (
        <p style={{ color: colors.muted, fontFamily: fontFamily.serif }}>Brak artykułów. Dodaj pierwszy.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 640 }}>
          <div
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px 140px', gap: 16, padding: '10px 0',
              borderBottom: `1px solid ${colors.line3}`, fontFamily: fontFamily.mono, fontSize: 10,
              letterSpacing: '.1em', color: colors.muted, textTransform: 'uppercase',
            }}
          >
            <span>Tytuł</span>
            <span>Kategoria</span>
            <span>Autor</span>
            <span>Status</span>
            <span>Akcje</span>
          </div>
          {articles.map((a) => {
            const cat = getCategory(a.category);
            return (
              <div
                key={a.id}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 100px 140px', gap: 16, padding: '14px 0',
                  borderBottom: `1px solid ${colors.line}`, alignItems: 'center', fontSize: 14,
                }}
              >
                <span style={{ fontFamily: fontFamily.serif, fontSize: 17 }}>{a.title.pl}</span>
                <span style={{ color: colors.muted, fontFamily: fontFamily.mono, fontSize: 12 }}>
                  {cat?.label.pl} {a.subcategory ? `· ${a.subcategory}` : ''}
                </span>
                <span style={{ color: colors.muted, fontFamily: fontFamily.mono, fontSize: 12 }}>{a.author}</span>
                <span
                  style={{
                    fontFamily: fontFamily.mono, fontSize: 11, textTransform: 'uppercase',
                    color: a.status === 'published' ? '#7CCB8C' : colors.muted,
                  }}
                >
                  {a.status === 'published' ? 'Live' : 'Szkic'}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    href={`/admin/articles/${a.id}/edit`}
                    style={{ border: `1px solid ${colors.line3}`, padding: '6px 10px', fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}
                  >
                    Edytuj
                  </Link>
                  <DeleteButton id={a.id} title={a.title.pl} />
                </div>
              </div>
            );
          })}
        </div>
        </div>
      )}
    </div>
  );
}
