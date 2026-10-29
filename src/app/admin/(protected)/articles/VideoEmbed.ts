import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoEmbedOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      setVideoEmbed: (options: { src: string; url: string }) => ReturnType;
    };
  }
}

/** Block embed for YouTube / Vimeo with a real DOM node view (iframes need it). */
export const VideoEmbed = Node.create<VideoEmbedOptions>({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return { HTMLAttributes: {} };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => {
          const iframe = (el as HTMLElement).querySelector?.('iframe') ?? (el as HTMLElement);
          return iframe.getAttribute?.('src') ?? (el as HTMLElement).getAttribute('data-src');
        },
      },
      url: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-video-url'),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.tk-embed' },
      { tag: 'div[data-youtube-video]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, url, ...rest } = HTMLAttributes;
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, rest, {
        class: 'tk-embed',
        'data-video-url': (url as string) || (src as string) || '',
        'data-src': src as string,
      }),
    ];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'tk-embed';
      dom.setAttribute('data-video-url', node.attrs.url || node.attrs.src || '');
      dom.contentEditable = 'false';

      const iframe = document.createElement('iframe');
      iframe.src = node.attrs.src || '';
      iframe.title = 'Wideo';
      iframe.loading = 'lazy';
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;';
      dom.appendChild(iframe);

      return { dom };
    };
  },

  addCommands() {
    return {
      setVideoEmbed:
        (options) =>
        ({ chain }) =>
          chain()
            .insertContent([
              { type: this.name, attrs: options },
              { type: 'paragraph' },
            ])
            .run(),
    };
  },
});
