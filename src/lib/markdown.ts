import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({ breaks: true, gfm: true });

const YOUTUBE_HOST = 'www.youtube-nocookie.com';
const ALLOWED_IFRAME_HOSTS = [YOUTUBE_HOST, 'player.vimeo.com'];

/** Extracts a YouTube or Vimeo video id from any of the URL forms an editor
 * might paste, and returns a privacy-respecting embed URL. Returns null for
 * anything else (the [[video: ...]] token is left as plain text). */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '');

    if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') {
      const id = host === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v') ?? u.pathname.split('/embed/')[1];
      if (!id) return null;
      return `https://${YOUTUBE_HOST}/embed/${id.split('&')[0]}`;
    }

    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (!id || !/^\d+$/.test(id)) return null;
      return `https://player.vimeo.com/video/${id}`;
    }

    return null;
  } catch {
    return null;
  }
}

/** Replaces `[[video: <url>]]` tokens (inserted by the admin editor's "Wstaw
 * wideo" button) with a raw, responsive iframe embed — resolved to a
 * known-safe host before sanitize-html even sees it. */
function embedVideos(markdown: string): string {
  return markdown.replace(/\[\[video:\s*(\S+)\s*\]\]/g, (match, url: string) => {
    const embedUrl = toEmbedUrl(url);
    if (!embedUrl) return match;
    return `\n\n<div class="tk-embed"><iframe src="${embedUrl}" title="Wideo" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>\n\n`;
  });
}

/**
 * Renders article body markdown to sanitized HTML. Sanitizing on every
 * render (not just on save) means even a compromised/legacy DB row can never
 * inject a script into a reader's browser — defense in depth against
 * stored XSS, as required by the security clause in the contract. Uses
 * sanitize-html (no jsdom) to stay compatible with Next.js server bundling.
 * Video embeds are resolved to a fixed allow-list of hosts before
 * sanitization, so a stored `<iframe>` can never point anywhere else.
 */
export function renderArticleBody(markdown: string): string {
  const withEmbeds = embedVideos(markdown);
  const html = marked.parse(withEmbeds, { async: false }) as string;
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'a', 'blockquote', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'code', 'pre', 'img', 'hr', 'figure', 'figcaption', 'div', 'iframe'],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading'],
      div: ['class'],
      iframe: ['src', 'title', 'loading', 'allow', 'allowfullscreen'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTS,
    allowedClasses: { div: ['tk-embed'] },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
      img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }, true),
    },
  });
}
