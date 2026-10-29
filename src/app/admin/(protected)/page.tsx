import Link from 'next/link';
import { listArticles } from '@/lib/data/articles';
import { getCategory } from '@/lib/data/categories';
import { colors, fontFamily } from '@/lib/theme';
import { DeleteButton } from './articles/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const articles = await listArticles();

  return (
    <div className="tk-admin-page">
      <div className="tk-admin-page-header">
        <h1 className="tk-admin-h1">Artykuły</h1>
        <Link href="/admin/articles/new" className="tk-admin-primary-btn">
          + Nowy artykuł
        </Link>
      </div>

      {articles.length === 0 ? (
        <p style={{ color: colors.muted, fontFamily: fontFamily.serif }}>Brak artykułów. Dodaj pierwszy.</p>
      ) : (
        <div className="tk-admin-list">
          <div className="tk-admin-list-head">
            <span>Tytuł</span>
            <span>Kategoria</span>
            <span>Autor</span>
            <span>Status</span>
            <span>Akcje</span>
          </div>
          {articles.map((a) => {
            const cat = getCategory(a.category);
            return (
              <div key={a.id} className="tk-admin-list-row">
                <span className="tk-admin-list-title">{a.title.pl}</span>
                <span className="tk-admin-list-meta" data-label="Kategoria">
                  {cat?.label.pl} {a.subcategory ? `· ${a.subcategory}` : ''}
                </span>
                <span className="tk-admin-list-meta" data-label="Autor">
                  {a.author}
                </span>
                <span
                  className="tk-admin-list-status"
                  style={{ color: a.status === 'published' ? '#7CCB8C' : colors.muted }}
                >
                  {a.status === 'published' ? 'Live' : 'Szkic'}
                </span>
                <div className="tk-admin-list-actions">
                  <Link href={`/admin/articles/${a.id}/edit`} className="tk-admin-ghost-btn">
                    Edytuj
                  </Link>
                  <DeleteButton id={a.id} title={a.title.pl} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
