import { notFound } from 'next/navigation';
import { getArticleById } from '@/lib/data/articles';
import { ArticleForm } from '../../ArticleForm';
import { updateArticleAction } from '../../actions';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const boundAction = updateArticleAction.bind(null, id);

  return (
    <div className="tk-admin-page">
      <h1 className="tk-admin-h1" style={{ marginBottom: 28 }}>Edytuj artykuł</h1>
      <ArticleForm action={boundAction} initial={article} submitLabel="Zapisz zmiany" />
    </div>
  );
}
