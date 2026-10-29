import { marked } from 'marked';
import TurndownService from 'turndown';

marked.setOptions({ breaks: true, gfm: true });

const YOUTUBE_HOST = 'www.youtube-nocookie.com';

/** Resolve YouTube / Vimeo URL to a safe embed URL (same logic as render pipeline). */
export function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, '');

    if (
      host === 'youtube.com' ||
      host === 'youtu.be' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      let id: string | null = null;
      if (host === 'youtu.be') id = u.pathname.split('/').filter(Boolean)[0] ?? null;
      else if (u.pathname.includes('/embed/')) id = u.pathname.split('/embed/')[1]?.split('/')[0] ?? null;
      else if (u.pathname.includes('/shorts/')) id = u.pathname.split('/shorts/')[1]?.split('/')[0] ?? null;
      else if (u.pathname.includes('/live/')) id = u.pathname.split('/live/')[1]?.split('/')[0] ?? null;
      else id = u.searchParams.get('v');
      if (!id) return null;
      return `https://${YOUTUBE_HOST}/embed/${id.split('&')[0].split('?')[0]}`;
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (!id || !/^\d+$/.test(id)) return null;
      return `https://player.vimeo.com/video/${id}`;
    }

    return null;
  } catch {
    return null;
  }
}

/** Turn an embed URL back into a shareable watch URL for [[video:]] tokens. */
function embedToWatchUrl(embedSrc: string): string {
  try {
    const u = new URL(embedSrc);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtube-nocookie.com' || host === 'youtube.com') {
      const id = u.pathname.split('/embed/')[1]?.split('/')[0];
      if (id) return `https://www.youtube.com/watch?v=${id}`;
    }
    if (host === 'player.vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://vimeo.com/${id}`;
    }
  } catch {
    /* fall through */
  }
  return embedSrc;
}

function expandVideoTokens(markdown: string): string {
  return markdown.replace(/\[\[video:\s*(\S+)\s*\]\]/g, (match, url: string) => {
    const embedUrl = toEmbedUrl(url);
    if (!embedUrl) return match;
    return `\n\n<div class="tk-embed" data-video-url="${url.trim()}"><iframe src="${embedUrl}" title="Wideo" loading="lazy" allowfullscreen></iframe></div>\n\n`;
  });
}

/** Markdown (DB format) → HTML for TipTap. */
export function markdownToEditorHtml(markdown: string): string {
  if (!markdown?.trim()) return '';
  const withEmbeds = expandVideoTokens(markdown);
  return marked.parse(withEmbeds, { async: false }) as string;
}

function createTurndown(): TurndownService {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    strongDelimiter: '**',
  });

  td.addRule('underline', {
    filter: ['u'],
    replacement: (content) => `<u>${content}</u>`,
  });

  td.addRule('strikethrough', {
    filter: (node) => ['S', 'DEL', 'STRIKE'].includes(node.nodeName),
    replacement: (content) => `~~${content}~~`,
  });

  td.addRule('highlight', {
    filter: ['mark'],
    replacement: (content) => `<mark>${content}</mark>`,
  });

  td.addRule('subscript', {
    filter: ['sub'],
    replacement: (content) => `<sub>${content}</sub>`,
  });

  td.addRule('superscript', {
    filter: ['sup'],
    replacement: (content) => `<sup>${content}</sup>`,
  });

  td.addRule('textAlign', {
    filter: (node) => {
      if (!['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.nodeName)) return false;
      const align = (node as HTMLElement).style?.textAlign;
      return Boolean(align && align !== 'left' && align !== 'start');
    },
    replacement: (content, node) => {
      const el = node as HTMLElement;
      const align = el.style.textAlign;
      const tag = el.nodeName.toLowerCase();
      const inner = content.trim();
      if (tag === 'p') return `\n\n<p style="text-align: ${align}">${inner}</p>\n\n`;
      return `\n\n<${tag} style="text-align: ${align}">${inner}</${tag}>\n\n`;
    },
  });

  td.addRule('videoEmbed', {
    filter: (node) => {
      if (node.nodeName !== 'DIV') return false;
      const el = node as HTMLElement;
      return el.classList.contains('tk-embed') || el.hasAttribute('data-youtube-video');
    },
    replacement: (_content, node) => {
      const el = node as HTMLElement;
      const stored = el.getAttribute('data-video-url');
      const iframe = el.querySelector('iframe');
      const src = iframe?.getAttribute('src') ?? '';
      const watch = stored || (src ? embedToWatchUrl(src) : '');
      if (!watch) return '';
      return `\n\n[[video: ${watch}]]\n\n`;
    },
  });

  td.addRule('youtubeIframe', {
    filter: (node) => {
      if (node.nodeName !== 'IFRAME') return false;
      const src = (node as HTMLElement).getAttribute('src') ?? '';
      return /youtube|youtu\.be|vimeo/.test(src);
    },
    replacement: (_content, node) => {
      const src = (node as HTMLElement).getAttribute('src') ?? '';
      return `\n\n[[video: ${embedToWatchUrl(src)}]]\n\n`;
    },
  });

  td.keep(['table', 'thead', 'tbody', 'tr', 'th', 'td', 'colgroup', 'col']);

  return td;
}

const turndown = createTurndown();

/** TipTap HTML → Markdown for DB storage. */
export function editorHtmlToMarkdown(html: string): string {
  if (!html?.trim() || html === '<p></p>') return '';
  let md = turndown.turndown(html);
  // TipTap sometimes leaves empty paragraphs as noise
  md = md.replace(/\n{3,}/g, '\n\n').trim();
  return md;
}
