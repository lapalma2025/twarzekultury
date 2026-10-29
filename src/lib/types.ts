export type Locale = 'pl' | 'en';

export type Category = 'muzyka' | 'film' | 'sport' | 'gry';

export type ArticleStatus = 'draft' | 'published';

export interface Bilingual {
  pl: string;
  en: string;
}

/** App-level shape used everywhere outside the data layer. */
export interface Article {
  id: string;
  category: Category;
  subcategory: string | null;
  slug: Bilingual;
  title: Bilingual;
  lead: Bilingual;
  body: Bilingual;
  coverImageUrl: string | null;
  /** CSS object-position value (e.g. "50% 35%") — the crop focal point chosen
   * in the admin panel, so a badly-framed photo can be repositioned without
   * re-uploading it. Undefined/empty means the default center crop. */
  coverImagePosition?: string | null;
  author: string;
  readingTimeMin: number;
  rating: number | null;
  tags: string[];
  status: ArticleStatus;
  /** Homepage „Twarz tygodnia” (sitewide hero). */
  featured: boolean;
  /** Large lead block inside this article's category section. At most one per category. */
  sectionFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ArticleInput = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>;

export interface SubcategoryMeta {
  key: string;
  label: Bilingual;
}

export interface CategoryMeta {
  key: Category;
  label: Bilingual;
  titleParts: [string, string, string]; // pre / italic / post, matches the original split headline
  intro: Bilingual;
  subcategories: SubcategoryMeta[];
}

/** How many articles each homepage section shows before a "Pokaż więcej"
 * button reveals the rest. */
export interface SiteSettings {
  homepageLimits: Record<Category, number>;
}

/** One of the 5 fixed slots in the homepage „Twarze tego tygodnia” gallery. */
export interface GalleryFrame {
  slot: 1 | 2 | 3 | 4 | 5;
  imageUrl: string | null;
  /** CSS object-position (e.g. "50% 20%") — focal point for cover crop. */
  imagePosition?: string | null;
  alt: Bilingual;
  parallax: number;
}
