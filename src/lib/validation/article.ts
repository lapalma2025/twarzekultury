import { z } from 'zod';
import { CATEGORIES } from '@/lib/data/categories';

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
    const plOk = data.titlePl.length >= 3 && slugRegex.test(data.slugPl) && data.bodyPl.length >= 1;
    const enOk = data.titleEn.length >= 3 && slugRegex.test(data.slugEn) && data.bodyEn.length >= 1;
    if (!plOk && !enOk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Wypełnij przynajmniej jedną wersję językową: tytuł, slug i treść (PL lub EN).',
      });
    }
  });

export type ArticleFormValues = z.infer<typeof articleSchema>;

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
  const plComplete = v.titlePl.trim().length >= 3 && slugRegex.test(v.slugPl) && v.bodyPl.trim().length >= 1;
  const enComplete = v.titleEn.trim().length >= 3 && slugRegex.test(v.slugEn) && v.bodyEn.trim().length >= 1;

  if (plComplete && !enComplete) {
    return {
      ...v,
      titleEn: v.titleEn.trim() || v.titlePl,
      slugEn: v.slugEn.trim() || v.slugPl,
      leadEn: v.leadEn.trim() || v.leadPl,
      bodyEn: v.bodyEn.trim() || v.bodyPl,
    };
  }

  if (enComplete && !plComplete) {
    return {
      ...v,
      titlePl: v.titlePl.trim() || v.titleEn,
      slugPl: v.slugPl.trim() || v.slugEn,
      leadPl: v.leadPl.trim() || v.leadEn,
      bodyPl: v.bodyPl.trim() || v.bodyEn,
    };
  }

  return {
    ...v,
    titleEn: v.titleEn.trim() || v.titlePl,
    titlePl: v.titlePl.trim() || v.titleEn,
    slugEn: v.slugEn.trim() || v.slugPl,
    slugPl: v.slugPl.trim() || v.slugEn,
    leadEn: v.leadEn.trim() || v.leadPl,
    leadPl: v.leadPl.trim() || v.leadEn,
    bodyEn: v.bodyEn.trim() || v.bodyPl,
    bodyPl: v.bodyPl.trim() || v.bodyEn,
  };
}
