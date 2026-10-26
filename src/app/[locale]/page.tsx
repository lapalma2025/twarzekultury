import { setRequestLocale } from 'next-intl/server';
import { listArticles } from '@/lib/data/articles';
import { getSiteSettings } from '@/lib/data/settings';
import { listGalleryFrames } from '@/lib/data/gallery';
import { HeroSection } from '@/components/home/HeroSection';
import { MusicSection } from '@/components/home/MusicSection';
import { FilmSection } from '@/components/home/FilmSection';
import { SportSection } from '@/components/home/SportSection';
import { GamesSection } from '@/components/home/GamesSection';
import { GallerySection } from '@/components/home/GallerySection';
import { ManifestSection } from '@/components/home/ManifestSection';
import type { Locale } from '@/lib/types';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  const [all, settings, gallery] = await Promise.all([
    listArticles({ status: 'published' }),
    getSiteSettings(),
    listGalleryFrames(),
  ]);
  const byCategory = {
    muzyka: all.filter((a) => a.category === 'muzyka'),
    film: all.filter((a) => a.category === 'film'),
    sport: all.filter((a) => a.category === 'sport'),
    gry: all.filter((a) => a.category === 'gry'),
  };

  // Duża karta = „Twarz tygodnia” (featured z /admin/week-face).
  // Obok: zawsze 2 najnowsze opublikowane artykuły (bez filtrowania kategorią).
  const heroLead = all.find((a) => a.featured) ?? all[0] ?? null;
  const newestBeside = all.filter((a) => a.id !== heroLead?.id).slice(0, 2);
  const heroSecond = newestBeside[0] ?? null;
  const heroThird = newestBeside[1] ?? null;

  return (
    <main id="top" className="tk-container" style={{ maxWidth: 1600, margin: '0 auto' }}>
      <HeroSection locale={loc} lead={heroLead} second={heroSecond} third={heroThird} />
      <MusicSection locale={loc} articles={byCategory.muzyka} limit={settings.homepageLimits.muzyka} />
      <GallerySection frames={gallery} />
      <FilmSection locale={loc} articles={byCategory.film} limit={settings.homepageLimits.film} />
      <SportSection locale={loc} articles={byCategory.sport} limit={settings.homepageLimits.sport} />
      <GamesSection locale={loc} articles={byCategory.gry} limit={settings.homepageLimits.gry} />
      <ManifestSection />
    </main>
  );
}
