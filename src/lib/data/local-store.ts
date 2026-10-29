import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Article, ArticleInput } from '@/lib/types';
import { SEED_ARTICLES } from './seed';

/**
 * File-based fallback "database" used while no Supabase project is wired up
 * (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY unset). Lets the
 * admin panel and article editing work end-to-end today; swap in real
 * Supabase credentials later with zero code changes — see lib/data/articles.ts.
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface Db {
  articles: Article[];
}

function ensureDb(): Db {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const seeded: Db = {
      articles: SEED_ARTICLES.map((a) => toArticle(a)),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as Db;
  } catch {
    const seeded: Db = { articles: SEED_ARTICLES.map((a) => toArticle(a)) };
    fs.writeFileSync(DB_FILE, JSON.stringify(seeded, null, 2), 'utf-8');
    return seeded;
  }
}

function normalizeArticle(a: Article): Article {
  return {
    ...a,
    sectionFeatured: Boolean(a.sectionFeatured),
  };
}

function toArticle(input: ArticleInput, id?: string): Article {
  const now = new Date().toISOString();
  return {
    ...input,
    sectionFeatured: Boolean(input.sectionFeatured),
    id: id ?? crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}

function write(db: Db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export const localStore = {
  list(): Article[] {
    return ensureDb().articles.map(normalizeArticle);
  },

  get(id: string): Article | null {
    const a = ensureDb().articles.find((x) => x.id === id);
    return a ? normalizeArticle(a) : null;
  },

  getBySlug(locale: 'pl' | 'en', slug: string): Article | null {
    const a = ensureDb().articles.find((x) => x.slug[locale] === slug);
    return a ? normalizeArticle(a) : null;
  },

  create(input: ArticleInput): Article {
    const db = ensureDb();
    const article = toArticle(input);
    db.articles.unshift(article);
    write(db);
    return article;
  },

  update(id: string, input: Partial<ArticleInput>): Article | null {
    const db = ensureDb();
    const idx = db.articles.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    db.articles[idx] = {
      ...db.articles[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    write(db);
    return db.articles[idx];
  },

  remove(id: string): boolean {
    const db = ensureDb();
    const before = db.articles.length;
    db.articles = db.articles.filter((a) => a.id !== id);
    write(db);
    return db.articles.length < before;
  },
};
