import type { Bilingual, Category } from '@/lib/types';

export type SocialLink = { label: string; url: string };

export interface SiteContent {
  homepageLimits: Record<Category, number>;
  marqueeLimit: number;
  hero: {
    titlePre: Bilingual;
    titleIta: Bilingual;
    titlePost: Bilingual;
    titleGray: Bilingual;
    weekFaceLabel: Bilingual;
  };
  gallery: {
    kicker: Bilingual;
    titlePre: Bilingual;
    titleIta: Bilingual;
    meta: Bilingual;
  };
  manifest: {
    quotePre: Bilingual;
    quoteIta: Bilingual;
    quotePost: Bilingual;
    signature: Bilingual;
  };
  footer: {
    tagline: Bilingual;
    adminName: string;
    adminEmail: string;
    social: SocialLink[];
    rights: Bilingual;
    edition: Bilingual;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  homepageLimits: { muzyka: 4, film: 4, sport: 2, gry: 2 },
  marqueeLimit: 8,
  hero: {
    titlePre: { pl: 'Twarze', en: 'Faces' },
    titleIta: { pl: 'stojące', en: 'behind' },
    titlePost: { pl: 'za polską kulturą —', en: 'Polish culture —' },
    titleGray: { pl: 'bez filtrów.', en: 'no filters.' },
    weekFaceLabel: { pl: 'Twarz tygodnia', en: 'Face of the week' },
  },
  gallery: {
    kicker: { pl: 'Galeria · Behind the scenes', en: 'Gallery · Behind the scenes' },
    titlePre: { pl: 'Twarze', en: 'Faces' },
    titleIta: { pl: 'tego tygodnia', en: 'of the week' },
    meta: { pl: 'Fotografia · 5 kadrów', en: 'Photography · 5 frames' },
  },
  manifest: {
    quotePre: { pl: 'Piszemy o kulturze', en: 'We write about culture the' },
    quoteIta: { pl: 'tak', en: 'way' },
    quotePost: {
      pl: ', jak sami chcielibyśmy o niej czytać.',
      en: " we'd want to read about it ourselves.",
    },
    signature: {
      pl: '— Redakcja Twarzy Kultury',
      en: '— The Twarze Kultury editors',
    },
  },
  footer: {
    tagline: {
      pl: 'Niezależny magazyn kulturalny. Muzyka, film, sport, gry — piszemy o tym, co warto oglądać, słuchać i o czym warto mówić.',
      en: "An independent culture magazine. Music, film, sport, games — we write about what's worth watching, listening to, and talking about.",
    },
    adminName: 'Jakub Wojtowicz',
    adminEmail: 'redakcja@twarzekultury.pl',
    social: [],
    rights: {
      pl: '© 2026 Twarze Kultury. Wszystkie prawa zastrzeżone.',
      en: '© 2026 Twarze Kultury. All rights reserved.',
    },
    edition: { pl: 'Designed by Codewithme', en: 'Designed by Codewithme' },
  },
};

function bi(base: Bilingual, patch?: Partial<Bilingual> | null): Bilingual {
  return {
    pl: typeof patch?.pl === 'string' ? patch.pl : base.pl,
    en: typeof patch?.en === 'string' ? patch.en : base.en,
  };
}

export function mergeSiteContent(partial: Partial<SiteContent> | null | undefined): SiteContent {
  const p = partial && typeof partial === 'object' && !Array.isArray(partial) ? partial : {};
  const d = DEFAULT_SITE_CONTENT;
  return {
    homepageLimits: { ...d.homepageLimits, ...p.homepageLimits },
    marqueeLimit: typeof p.marqueeLimit === 'number' && p.marqueeLimit > 0 ? p.marqueeLimit : d.marqueeLimit,
    hero: {
      titlePre: bi(d.hero.titlePre, p.hero?.titlePre),
      titleIta: bi(d.hero.titleIta, p.hero?.titleIta),
      titlePost: bi(d.hero.titlePost, p.hero?.titlePost),
      titleGray: bi(d.hero.titleGray, p.hero?.titleGray),
      weekFaceLabel: bi(d.hero.weekFaceLabel, p.hero?.weekFaceLabel),
    },
    gallery: {
      kicker: bi(d.gallery.kicker, p.gallery?.kicker),
      titlePre: bi(d.gallery.titlePre, p.gallery?.titlePre),
      titleIta: bi(d.gallery.titleIta, p.gallery?.titleIta),
      meta: bi(d.gallery.meta, p.gallery?.meta),
    },
    manifest: {
      quotePre: bi(d.manifest.quotePre, p.manifest?.quotePre),
      quoteIta: bi(d.manifest.quoteIta, p.manifest?.quoteIta),
      quotePost: bi(d.manifest.quotePost, p.manifest?.quotePost),
      signature: bi(d.manifest.signature, p.manifest?.signature),
    },
    footer: {
      tagline: bi(d.footer.tagline, p.footer?.tagline),
      adminName: typeof p.footer?.adminName === 'string' ? p.footer.adminName : d.footer.adminName,
      adminEmail: typeof p.footer?.adminEmail === 'string' ? p.footer.adminEmail : d.footer.adminEmail,
      social: Array.isArray(p.footer?.social) && p.footer.social.length > 0 ? p.footer.social : d.footer.social,
      rights: bi(d.footer.rights, p.footer?.rights),
      edition: bi(d.footer.edition, p.footer?.edition),
    },
  };
}
