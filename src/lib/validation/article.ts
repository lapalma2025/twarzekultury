import { z } from 'zod';
import { CATEGORIES } from '@/lib/data/categories';

const categoryKeys = CATEGORIES.map((c) => c.key) as [string, ...string[]];

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const articleSchema = z.object({
  category: z.enum(categoryKeys as unknown as [string, ...string[]]),
  subcategory: z.string().trim().max(60).optional().nullable(),

  slugPl: z.string().trim().toLowerCase().min(3).max(160).regex(slugRegex, 'Slug: małe litery, cyfry, myślniki.'),
  slugEn: z.string().trim().toLowerCase().min(3).max(160).regex(slugRegex, 'Slug: małe litery, cyfry, myślniki.'),

  titlePl: z.string().trim().min(3, 'Tytuł PL jest wymagany.').max(300),
  titleEn: z.string().trim().min(3, 'Tytuł EN jest wymagany.').max(300),

  leadPl: z.string().trim().max(600).default(''),
  leadEn: z.string().trim().max(600).default(''),

  bodyPl: z.string().trim().min(1, 'Treść PL jest wymagana.').max(50_000),
  bodyEn: z.string().trim().min(1, 'Treść EN jest wymagana.').max(50_000),

  // Accepts absolute URLs (Supabase Storage) as well as the app-relative
  // paths produced by the local /public/uploads fallback (z.string().url()
  // would reject those).
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

  tags: z.string().trim().max(300).default(''), // comma-separated in the form
  status: z.enum(['draft', 'published']),
  featured: z.coerce.boolean().default(false),
});

export type ArticleFormValues = z.infer<typeof articleSchema>;
