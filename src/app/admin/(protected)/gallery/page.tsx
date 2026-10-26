import { fontFamily, colors } from '@/lib/theme';
import { listGalleryFrames } from '@/lib/data/gallery';
import { GalleryForm } from './GalleryForm';

export const dynamic = 'force-dynamic';

export default async function GalleryAdminPage() {
  const frames = await listGalleryFrames();

  return (
    <div>
      <h1 style={{ fontFamily: fontFamily.serif, fontSize: 32, fontWeight: 400, marginBottom: 12 }}>
        Twarze tego tygodnia
      </h1>
      <p style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.muted, lineHeight: 1.6, marginBottom: 32, maxWidth: 560 }}>
        Pięć kadrów w galerii na stronie głównej. Wgraj nowe zdjęcie i podpis — po zapisaniu od razu widać je na
        portalu. Kolejność slotów 1–5 odpowiada układowi siatki.
      </p>
      <GalleryForm initial={frames} />
    </div>
  );
}
