import { fontFamily } from '@/lib/theme';
import { ArticleForm } from '../ArticleForm';
import { createArticleAction } from '../actions';

export default function NewArticlePage() {
  return (
    <div>
      <h1 style={{ fontFamily: fontFamily.serif, fontSize: 32, fontWeight: 400, marginBottom: 28 }}>Nowy artykuł</h1>
      <ArticleForm action={createArticleAction} submitLabel="Zapisz artykuł" />
    </div>
  );
}
