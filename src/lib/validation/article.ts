import { z } from 'zod';
import { CATEGORIES } from '@/lib/data/categories';
import { slugify } from '@/lib/slug';

const categoryKeys = CATEGORIES.map((c) => c.key) as [string, ...string[]];

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalSlug = z
  .string()
  .trim()
  .toLowerCase()
  .max(160)
  .refine((v) => v === '' || slugRegex.test(v), 'Slug: małe litery, cyfry, myślniki.');

export const articleSchema = z
  .object({
    category: z.enum(categoryKeys as unknown as [string, ...string[]]),
    subcategory: z.string().trim().max(60).optional().nullable(),

    slugPl: optionalSlug,
    slugEn: optionalSlug,

    titlePl: z.string().trim().max(300).default(''),
    titleEn: z.string().trim().max(300).default(''),

    leadPl: z.string().trim().max(600).default(''),
    leadEn: z.string().trim().max(600).default(''),

    bodyPl: z.string().trim().max(50_000).default(''),
    bodyEn: z.string().trim().max(50_000).default(''),

    coverImageUrl: z
      .string()
      .trim()
      .refine((v) => v === '' || v.startsWith('/') || /^https?:\/\//.test(v), 'Nieprawidłowy URL zdjęcia.')
      .optional()
      .nullable(),
    coverImagePosition: z
      .string()
      .trim()
      .regex(/^\d{1,3}(?:\.\d+)?% \d{1,3}(?:\.\d+)?%$/, 'Nieprawidłowa pozycja kadru.')
      .optional()
      .nullable(),

    author: z.string().trim().min(1, 'Podaj autora.').max(120),
    readingTimeMin: z.coerce.number().int().min(1).max(180),
    rating: z.union([z.coerce.number().min(0).max(10), z.nan()]).optional().nullable(),

    tags: z.string().trim().max(300).default(''),
    status: z.enum(['draft', 'published']),
    featured: z.coerce.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    const slugPl = data.slugPl || slugify(data.titlePl);
    const slugEn = data.slugEn || slugify(data.titleEn);
    const plOk = data.titlePl.length >= 3 && slugRegex.test(slugPl) && data.bodyPl.length >= 1;
    const enOk = data.titleEn.length >= 3 && slugRegex.test(slugEn) && data.bodyEn.length >= 1;
    if (!plOk && !enOk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Wypełnij przynajmniej jedną wersję: tytuł (min. 3 znaki) i treść (PL lub EN). Slug uzupełni się sam.',
      });
    }
  });

export type ArticleFormValues = z.infer<typeof articleSchema>;

function withAutoSlug(title: string, slug: string): string {
  const s = slug.trim();
  if (s) return s;
  return slugify(title);
}

/** Copy missing bilingual fields from the filled language so public pages never show blanks. */
export function fillMissingLocaleFields<T extends {
  slugPl: string;
  slugEn: string;
  titlePl: string;
  titleEn: string;
  leadPl: string;
  leadEn: string;
  bodyPl: string;
  bodyEn: string;
}>(v: T): T {
  // Title filled but slug left empty → generate slug server-side (common when
  // the author typed a title then hit save without touching the slug field).
  const base = {
    ...v,
    slugPl: withAutoSlug(v.titlePl, v.slugPl),
    slugEn: withAutoSlug(v.titleEn, v.slugEn),
  };

  const plComplete =
    base.titlePl.trim().length >= 3 && slugRegex.test(base.slugPl) && base.bodyPl.trim().length >= 1;
  const enComplete =
    base.titleEn.trim().length >= 3 && slugRegex.test(base.slugEn) && base.bodyEn.trim().length >= 1;

  if (plComplete && !enComplete) {
    return {
      ...base,
      titleEn: base.titleEn.trim() || base.titlePl,
      slugEn: base.slugEn.trim() || base.slugPl,
      leadEn: base.leadEn.trim() || base.leadPl,
      bodyEn: base.bodyEn.trim() || base.bodyPl,
    };
  }

  if (enComplete && !plComplete) {
    return {
      ...base,
      titlePl: base.titlePl.trim() || base.titleEn,
      slugPl: base.slugPl.trim() || base.slugEn,
      leadPl: base.leadPl.trim() || base.leadEn,
      bodyPl: base.bodyPl.trim() || base.bodyEn,
    };
  }

  return {
    ...base,
    titleEn: base.titleEn.trim() || base.titlePl,
    titlePl: base.titlePl.trim() || base.titleEn,
    slugEn: base.slugEn.trim() || base.slugPl,
    slugPl: base.slugPl.trim() || base.slugEn,
    leadEn: base.leadEn.trim() || base.leadPl,
    leadPl: base.leadPl.trim() || base.leadEn,
    bodyEn: base.bodyEn.trim() || base.bodyPl,
    bodyPl: base.bodyPl.trim() || base.bodyEn,
  };
}
