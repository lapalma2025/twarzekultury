import type { Article } from '@/lib/types';

/** Lead for a category section / category page: pinned article, else newest. */
export function pickSectionLead(articles: Article[]): Article | null {
  if (articles.length === 0) return null;
  return articles.find((a) => a.sectionFeatured) ?? articles[0] ?? null;
}

/** Put the section lead first; keep relative date order for the rest. */
export function orderWithSectionLead(articles: Article[]): Article[] {
  const lead = pickSectionLead(articles);
  if (!lead) return articles;
  return [lead, ...articles.filter((a) => a.id !== lead.id)];
}
