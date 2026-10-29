import { ArticleForm } from '../ArticleForm';
import { createArticleAction } from '../actions';

export default function NewArticlePage() {
  return (
    <div className="tk-admin-page">
      <h1 className="tk-admin-h1" style={{ marginBottom: 28 }}>Nowy artykuł</h1>
      <ArticleForm action={createArticleAction} submitLabel="Zapisz artykuł" />
    </div>
  );
}
