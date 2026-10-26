import type { CategoryMeta } from '@/lib/types';

/** Static category/subcategory metadata — mirrors the original design's nav dropdowns. */
export const CATEGORIES: CategoryMeta[] = [
  {
    key: 'muzyka',
    label: { pl: 'Muzyka', en: 'Music' },
    titleParts: ['Mu', 'zy', 'ka'],
    intro: {
      pl: 'Recenzje, koncerty, wywiady, newsy. Wszystko co brzmi w Polsce i o czym warto wiedzieć.',
      en: 'Reviews, concerts, interviews, news. Everything that matters in Polish music.',
    },
    subcategories: [
      { key: 'recenzje', label: { pl: 'Recenzje', en: 'Reviews' } },
      { key: 'koncerty', label: { pl: 'Koncerty', en: 'Concerts' } },
      { key: 'wywiady', label: { pl: 'Wywiady', en: 'Interviews' } },
      { key: 'newsy', label: { pl: 'Newsy', en: 'News' } },
    ],
  },
  {
    key: 'film',
    label: { pl: 'Film', en: 'Film' },
    titleParts: ['', 'Film', ''],
    intro: {
      pl: 'Nie recenzujemy premier. Piszemy o kinie, które ma coś do powiedzenia.',
      en: "We don't just review premieres. We write about cinema that has something to say.",
    },
    subcategories: [
      { key: 'recenzje', label: { pl: 'Recenzje', en: 'Reviews' } },
      { key: 'newsy', label: { pl: 'Newsy', en: 'News' } },
    ],
  },
  {
    key: 'sport',
    label: { pl: 'Sport', en: 'Sport' },
    titleParts: ['Sp', 'or', 't'],
    intro: {
      pl: 'MMA i boks. Bez klepania po ramieniu, bez PR-owych bzdur.',
      en: 'MMA and boxing. No back-patting, no PR fluff.',
    },
    subcategories: [
      { key: 'mma', label: { pl: 'MMA', en: 'MMA' } },
      { key: 'boks', label: { pl: 'Boks', en: 'Boxing' } },
    ],
  },
  {
    key: 'gry',
    label: { pl: 'Gry', en: 'Games' },
    titleParts: ['', 'Gr', 'y'],
    intro: {
      pl: 'Recenzje i zapowiedzi. Bez punktacji z metacritic, z własnym zdaniem.',
      en: 'Reviews and previews. No Metacritic scores, just our own take.',
    },
    subcategories: [
      { key: 'recenzje', label: { pl: 'Recenzje', en: 'Reviews' } },
      { key: 'zapowiedzi', label: { pl: 'Zapowiedzi', en: 'Previews' } },
    ],
  },
];

export function getCategory(key: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.key === key);
}

export function getSubcategoryLabel(catKey: string, subKey: string | null, locale: 'pl' | 'en'): string | null {
  if (!subKey) return null;
  const cat = getCategory(catKey);
  const sub = cat?.subcategories.find((s) => s.key === subKey);
  return sub ? sub.label[locale] : subKey;
}
