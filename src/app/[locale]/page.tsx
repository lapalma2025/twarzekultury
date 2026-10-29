import { setRequestLocale } from 'next-intl/server';
import { listArticles } from '@/lib/data/articles';
import { getSiteContent } from '@/lib/data/settings';
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

  const [all, content, gallery] = await Promise.all([
    listArticles({ status: 'published' }),
    getSiteContent(),
    listGalleryFrames(),
  ]);
  const byCategory = {
    muzyka: all.filter((a) => a.category === 'muzyka'),
    film: all.filter((a) => a.category === 'film'),
    sport: all.filter((a) => a.category === 'sport'),
    gry: all.filter((a) => a.category === 'gry'),
  };

  const heroLead = all.find((a) => a.featured) ?? all[0] ?? null;
  const newestBeside = all.filter((a) => a.id !== heroLead?.id).slice(0, 2);

  return (
    <main id="top" className="tk-container" style={{ maxWidth: 1600, margin: '0 auto' }}>
      <HeroSection
        locale={loc}
        lead={heroLead}
        second={newestBeside[0] ?? null}
        third={newestBeside[1] ?? null}
        content={content}
      />
      <MusicSection locale={loc} articles={byCategory.muzyka} limit={content.homepageLimits.muzyka} />
      <GallerySection frames={gallery} content={content} />
      <FilmSection locale={loc} articles={byCategory.film} limit={content.homepageLimits.film} />
      <SportSection locale={loc} articles={byCategory.sport} limit={content.homepageLimits.sport} />
      <GamesSection locale={loc} articles={byCategory.gry} limit={content.homepageLimits.gry} />
      <ManifestSection locale={loc} content={content} />
    </main>
  );
}
