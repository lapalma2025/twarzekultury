import { notFound } from 'next/navigation';
import { fontFamily } from '@/lib/theme';
import { getArticleById } from '@/lib/data/articles';
import { ArticleForm } from '../../ArticleForm';
import { updateArticleAction } from '../../actions';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const boundAction = updateArticleAction.bind(null, id);

  return (
    <div>
      <h1 style={{ fontFamily: fontFamily.serif, fontSize: 32, fontWeight: 400, marginBottom: 28 }}>Edytuj artykuł</h1>
      <ArticleForm action={boundAction} initial={article} submitLabel="Zapisz zmiany" />
    </div>
  );
}
