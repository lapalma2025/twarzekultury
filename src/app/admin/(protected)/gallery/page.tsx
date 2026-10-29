import { fontFamily, colors } from '@/lib/theme';
import { listGalleryFrames } from '@/lib/data/gallery';
import { GalleryForm } from './GalleryForm';

export const dynamic = 'force-dynamic';

export default async function GalleryAdminPage() {
  const frames = await listGalleryFrames();

  return (
    <div>
      <h1 className="tk-admin-h1" style={{ marginBottom: 12 }}>
        Twarze tego tygodnia
      </h1>
      <p style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.muted, lineHeight: 1.6, marginBottom: 32, maxWidth: 560 }}>
        Pięć kadrów w galerii na stronie głównej. Wgraj zdjęcie, ustaw punkt kadrowania (twarz / ważny fragment)
        i podpis — po zapisaniu od razu widać je na portalu. Slot 1–5 = układ siatki (różne proporcje).
      </p>
      <GalleryForm initial={frames} />
    </div>
  );
}
