import { fontFamily, colors } from '@/lib/theme';
import { listArticles } from '@/lib/data/articles';
import { WeekFaceForm } from './WeekFaceForm';

export const dynamic = 'force-dynamic';

export default async function WeekFaceAdminPage() {
  const published = (await listArticles({ status: 'published' })).sort((a, b) =>
    (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt)
  );
  const current = published.find((a) => a.featured) ?? null;

  return (
    <div>
      <h1 className="tk-admin-h1" style={{ marginBottom: 12 }}>
        Twarz tygodnia
      </h1>
      <p style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.muted, lineHeight: 1.6, marginBottom: 32, maxWidth: 560 }}>
        Duży kadr u góry strony głównej z czerwoną etykietą „Twarz tygodnia”. Wybierz opublikowany artykuł — jego
        zdjęcie i tytuł trafią na hero.
      </p>
      <WeekFaceForm articles={published} currentId={current?.id ?? null} />
    </div>
  );
}
