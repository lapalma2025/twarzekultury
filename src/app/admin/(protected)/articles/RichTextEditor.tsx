'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { TableKit } from '@tiptap/extension-table';
import { colors, fontFamily } from '@/lib/theme';
import { editorHtmlToMarkdown, markdownToEditorHtml, toEmbedUrl } from '@/lib/editor-convert';
import { renderArticleBody } from '@/lib/markdown';
import { uploadImageAction } from './upload';
import { VideoEmbed } from './VideoEmbed';

interface RichTextEditorProps {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  required?: boolean;
}

type Mode = 'visual' | 'preview' | 'markdown';

const labelStyle: React.CSSProperties = {
  fontFamily: fontFamily.mono,
  fontSize: 10,
  letterSpacing: '.1em',
  color: colors.muted,
  textTransform: 'uppercase',
};

function ToolBtn({
  title,
  active,
  disabled,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="tk-rte-btn"
      style={{
        height: 32,
        padding: '0 10px',
        background: active ? 'rgba(232,93,60,.18)' : 'transparent',
        border: `1px solid ${active ? colors.accent : colors.line3}`,
        color: active ? colors.accent : colors.fg,
        fontFamily: fontFamily.sans,
        fontSize: 12,
        fontWeight: 500,
        cursor: disabled ? 'wait' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        borderRadius: 4,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span aria-hidden style={{ width: 1, height: 22, background: colors.line3, margin: '0 2px', flexShrink: 0 }} />;
}

function ModeTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? colors.accent : 'transparent',
        color: active ? colors.bg : colors.fg,
        border: `1px solid ${active ? colors.accent : colors.line3}`,
        height: 30,
        padding: '0 12px',
        fontFamily: fontFamily.mono,
        fontSize: 10,
        letterSpacing: '.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        borderRadius: 4,
      }}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ id, name, label, defaultValue, required }: RichTextEditorProps) {
  const [mode, setMode] = useState<Mode>('visual');
  const [markdown, setMarkdown] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [ready, setReady] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const syncingRef = useRef(false);
  const uploadRef = useRef<(file: File) => Promise<void>>(async () => {});
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    setReady(true);
  }, []);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3, 4] },
        }),
        Underline,
        Superscript,
        Subscript,
        Typography,
        Highlight.configure({ multicolor: false }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer' },
          autolink: true,
          linkOnPaste: true,
        }),
        Image.configure({
          HTMLAttributes: { loading: 'lazy' },
          allowBase64: false,
        }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        TableKit.configure({
          table: { resizable: true, HTMLAttributes: { class: 'tk-table' } },
        }),
        VideoEmbed,
        CharacterCount,
        Placeholder.configure({
          placeholder: 'Zacznij pisać artykuł… Możesz wklejać tekst z Worda, dodawać zdjęcia i filmy.',
        }),
      ],
      content: markdownToEditorHtml(defaultValue),
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: 'tk-rte-content',
          id,
          'aria-label': label,
        },
        handleDrop: (_view, event) => {
          const files = event.dataTransfer?.files;
          if (!files?.length) return false;
          const file = files[0];
          if (!file.type.startsWith('image/')) return false;
          event.preventDefault();
          void uploadRef.current(file);
          return true;
        },
        handlePaste: (_view, event) => {
          const files = event.clipboardData?.files;
          if (!files?.length) return false;
          const file = files[0];
          if (!file.type.startsWith('image/')) return false;
          event.preventDefault();
          void uploadRef.current(file);
          return true;
        },
      },
      onUpdate: ({ editor: ed }) => {
        if (syncingRef.current) return;
        setMarkdown(editorHtmlToMarkdown(ed.getHTML()));
      },
    },
    [ready],
  );

  // Flush TipTap → hidden input synchronously on submit (setState would be too late).
  useEffect(() => {
    const root = rootRef.current;
    const form = root?.closest('form');
    if (!form || !editor) return;

    const flush = () => {
      if (modeRef.current === 'markdown') return;
      const md = editorHtmlToMarkdown(editor.getHTML());
      setMarkdown(md);
      if (hiddenRef.current) hiddenRef.current.value = md;
    };

    form.addEventListener('submit', flush, true);
    return () => form.removeEventListener('submit', flush, true);
  }, [editor]);

  const uploadAndInsert = useCallback(
    async (file: File) => {
      if (!editor) return;
      setError(null);
      setUploading(true);
      const fd = new FormData();
      fd.set('file', file);
      const res = await uploadImageAction(fd);
      setUploading(false);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.url) {
        editor
          .chain()
          .focus()
          .setImage({ src: res.url, alt: file.name.replace(/\.[^.]+$/, '') })
          .run();
      }
    },
    [editor],
  );

  useEffect(() => {
    uploadRef.current = uploadAndInsert;
  }, [uploadAndInsert]);

  function syncFromEditor() {
    if (!editor) return markdown;
    const md = editorHtmlToMarkdown(editor.getHTML());
    setMarkdown(md);
    return md;
  }

  function goVisual() {
    if (!editor) return;
    if (mode === 'markdown') {
      syncingRef.current = true;
      editor.commands.setContent(markdownToEditorHtml(markdown), { emitUpdate: false });
      syncingRef.current = false;
    }
    setMode('visual');
  }

  function goPreview() {
    if (mode === 'visual') syncFromEditor();
    setMode('preview');
  }

  function goMarkdown() {
    if (mode === 'visual') syncFromEditor();
    setMode('markdown');
  }

  function applyLink() {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url || url === 'https://') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
    setLinkOpen(false);
  }

  function openLinkDialog() {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    setLinkUrl(prev || 'https://');
    setVideoOpen(false);
    setLinkOpen(true);
  }

  function openVideoDialog() {
    setLinkOpen(false);
    setVideoUrl('');
    setError(null);
    setVideoOpen(true);
  }

  function applyVideo() {
    if (!editor) return;
    const raw = videoUrl.trim();
    if (!raw) {
      setError('Wklej link do filmu YouTube lub Vimeo.');
      return;
    }
    const embed = toEmbedUrl(raw);
    if (!embed) {
      setError('Nieobsługiwany link — użyj YouTube lub Vimeo (np. https://www.youtube.com/watch?v=…).');
      return;
    }
    setError(null);
    const ok = editor.chain().focus().setVideoEmbed({ src: embed, url: raw }).run();
    if (!ok) {
      // Fallback: raw HTML insert
      editor
        .chain()
        .focus()
        .insertContent(
          `<div class="tk-embed" data-video-url="${raw}"><iframe src="${embed}" title="Wideo" loading="lazy" allowfullscreen></iframe></div><p></p>`,
        )
        .run();
    }
    setVideoOpen(false);
    setVideoUrl('');
  }

  const previewHtml = useMemo(
    () => (mode === 'preview' ? renderArticleBody(markdown) : ''),
    [mode, markdown],
  );

  const words = editor?.storage.characterCount?.words?.() ?? 0;
  const chars = editor?.storage.characterCount?.characters?.() ?? 0;

  if (!ready) {
    return (
      <div ref={rootRef} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={labelStyle}>{label}</label>
        <div style={{ border: `1px solid ${colors.line3}`, borderRadius: 6, minHeight: 360, padding: 24, color: colors.muted, fontFamily: fontFamily.mono, fontSize: 12 }}>
          Ładowanie edytora…
        </div>
        <input type="hidden" name={name} value={defaultValue} />
      </div>
    );
  }

  return (
    <div ref={rootRef} className="tk-rte" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <label style={labelStyle} htmlFor={id}>
          {label}
          {required ? ' *' : ''}
        </label>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <ModeTab active={mode === 'visual'} onClick={goVisual}>
            Edycja
          </ModeTab>
          <ModeTab active={mode === 'preview'} onClick={goPreview}>
            Podgląd
          </ModeTab>
          <ModeTab active={mode === 'markdown'} onClick={goMarkdown}>
            Markdown
          </ModeTab>
        </div>
      </div>

      {mode === 'visual' && editor && (
        <div
          style={{
            border: `1px solid ${colors.line3}`,
            borderRadius: 6,
            overflow: 'visible',
            background: 'rgba(242,236,221,.02)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            className="tk-rte-toolbar"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 4,
              padding: '10px 10px',
              borderBottom: `1px solid ${colors.line3}`,
              background: colors.bg2,
              borderRadius: '6px 6px 0 0',
              position: 'relative',
              zIndex: 3,
            }}
          >
            <ToolBtn title="Cofnij" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              Cofnij
            </ToolBtn>
            <ToolBtn title="Ponów" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              Ponów
            </ToolBtn>
            <Sep />

            <select
              aria-label="Styl akapitu"
              value={
                editor.isActive('heading', { level: 2 })
                  ? 'h2'
                  : editor.isActive('heading', { level: 3 })
                    ? 'h3'
                    : editor.isActive('heading', { level: 4 })
                      ? 'h4'
                      : 'p'
              }
              onChange={(e) => {
                const v = e.target.value;
                const chain = editor.chain().focus();
                if (v === 'p') chain.setParagraph().run();
                else chain.setHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run();
              }}
              style={{
                height: 32,
                background: colors.bg,
                color: colors.fg,
                border: `1px solid ${colors.line3}`,
                borderRadius: 4,
                padding: '0 8px',
                fontFamily: fontFamily.sans,
                fontSize: 12,
                cursor: 'pointer',
                colorScheme: 'dark',
              }}
            >
              <option value="p">Akapit</option>
              <option value="h2">Nagłówek 2</option>
              <option value="h3">Nagłówek 3</option>
              <option value="h4">Nagłówek 4</option>
            </select>
            <Sep />

            <ToolBtn title="Pogrubienie (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
              <strong>B</strong>
            </ToolBtn>
            <ToolBtn title="Kursywa (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <em style={{ fontFamily: fontFamily.serif }}>I</em>
            </ToolBtn>
            <ToolBtn title="Podkreślenie" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <span style={{ textDecoration: 'underline' }}>U</span>
            </ToolBtn>
            <ToolBtn title="Przekreślenie" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
              <span style={{ textDecoration: 'line-through' }}>S</span>
            </ToolBtn>
            <ToolBtn title="Wyróżnienie kolorem" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
              Mark
            </ToolBtn>
            <Sep />

            <ToolBtn title="Do lewej" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
              Lewo
            </ToolBtn>
            <ToolBtn title="Wyśrodkuj" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
              Środek
            </ToolBtn>
            <ToolBtn title="Do prawej" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
              Prawo
            </ToolBtn>
            <Sep />

            <ToolBtn title="Lista punktowana" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              • Lista
            </ToolBtn>
            <ToolBtn title="Lista numerowana" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              1. Lista
            </ToolBtn>
            <ToolBtn title="Cytat" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              Cytat
            </ToolBtn>
            <ToolBtn title="Linia pozioma" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              Linia
            </ToolBtn>
            <Sep />

            <ToolBtn title="Wstaw / edytuj link" active={editor.isActive('link')} onClick={openLinkDialog}>
              Link
            </ToolBtn>
            <ToolBtn title="Wstaw zdjęcie z dysku" disabled={uploading} onClick={() => fileRef.current?.click()}>
              Zdjęcie
            </ToolBtn>
            <ToolBtn title="Wstaw film YouTube lub Vimeo" onClick={openVideoDialog}>
              ▶ Wideo
            </ToolBtn>
            <ToolBtn
              title="Wstaw tabelę 3×3"
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            >
              Tabela
            </ToolBtn>
            <Sep />
            <ToolBtn title="Wyczyść formatowanie" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
              Wyczyść
            </ToolBtn>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void uploadAndInsert(f);
                e.target.value = '';
              }}
            />
          </div>

          {linkOpen && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                padding: '10px 12px',
                borderBottom: `1px solid ${colors.line3}`,
                background: 'rgba(232,93,60,.06)',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 4,
              }}
            >
              <span style={{ fontFamily: fontFamily.mono, fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Adres linku
              </span>
              <input
                autoFocus
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyLink();
                  }
                  if (e.key === 'Escape') setLinkOpen(false);
                }}
                placeholder="https://"
                style={{
                  flex: 1,
                  minWidth: 180,
                  background: colors.bg,
                  border: `1px solid ${colors.line3}`,
                  color: colors.fg,
                  padding: '8px 10px',
                  fontSize: 13,
                  borderRadius: 4,
                }}
              />
              <ToolBtn title="Zastosuj" onClick={applyLink}>
                OK
              </ToolBtn>
              <ToolBtn title="Anuluj" onClick={() => setLinkOpen(false)}>
                Anuluj
              </ToolBtn>
            </div>
          )}

          {videoOpen && (
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                padding: '10px 12px',
                borderBottom: `1px solid ${colors.line3}`,
                background: 'rgba(232,93,60,.08)',
                flexWrap: 'wrap',
                position: 'relative',
                zIndex: 4,
              }}
            >
              <span style={{ fontFamily: fontFamily.mono, fontSize: 10, color: colors.muted, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Link do wideo
              </span>
              <input
                autoFocus
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyVideo();
                  }
                  if (e.key === 'Escape') setVideoOpen(false);
                }}
                placeholder="https://www.youtube.com/watch?v=… lub Vimeo"
                style={{
                  flex: 1,
                  minWidth: 220,
                  background: colors.bg,
                  border: `1px solid ${colors.line3}`,
                  color: colors.fg,
                  padding: '8px 10px',
                  fontSize: 13,
                  borderRadius: 4,
                }}
              />
              <ToolBtn title="Wstaw wideo" onClick={applyVideo}>
                Wstaw
              </ToolBtn>
              <ToolBtn title="Anuluj" onClick={() => setVideoOpen(false)}>
                Anuluj
              </ToolBtn>
            </div>
          )}

          <BubbleMenu
            editor={editor}
            options={{ placement: 'top', offset: 10, strategy: 'fixed' }}
            shouldShow={({ editor: ed, from, to }) =>
              from !== to && !ed.isActive('image') && !ed.isActive('videoEmbed')
            }
          >
            <div
              className="tk-rte-bubble"
              style={{
                display: 'flex',
                gap: 4,
                padding: 6,
                background: colors.bg2,
                border: `1px solid ${colors.line3}`,
                borderRadius: 6,
                boxShadow: '0 10px 28px rgba(0,0,0,.55)',
                zIndex: 50,
              }}
            >
              <ToolBtn title="Pogrubienie" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
                <strong>B</strong>
              </ToolBtn>
              <ToolBtn title="Kursywa" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
                <em>I</em>
              </ToolBtn>
              <ToolBtn title="Link" active={editor.isActive('link')} onClick={openLinkDialog}>
                Link
              </ToolBtn>
              <ToolBtn title="Wyróżnienie" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
                Mark
              </ToolBtn>
            </div>
          </BubbleMenu>

          <div style={{ overflow: 'auto', maxHeight: 640, borderRadius: '0 0 6px 6px' }}>
            <EditorContent editor={editor} />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 14px',
              borderTop: `1px solid ${colors.line3}`,
              fontFamily: fontFamily.mono,
              fontSize: 10,
              color: colors.muted,
              letterSpacing: '.04em',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <span>
              {words} słów · {chars} znaków
              {uploading ? ' · Wgrywanie zdjęcia…' : ''}
            </span>
            <span>Przycisk „▶ Wideo” = YouTube / Vimeo</span>
          </div>
        </div>
      )}

      {mode === 'preview' && (
        <div
          className="tk-article"
          style={{
            border: `1px solid ${colors.line3}`,
            borderRadius: 6,
            padding: '28px 32px',
            minHeight: 360,
            maxHeight: 640,
            overflowY: 'auto',
            background: 'rgba(242,236,221,.02)',
          }}
          dangerouslySetInnerHTML={{
            __html: previewHtml || '<p style="opacity:.5">Brak treści do podglądu — napisz coś w trybie Edycja.</p>',
          }}
        />
      )}

      {mode === 'markdown' && (
        <textarea
          id={`${id}-md`}
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          rows={20}
          style={{
            background: 'transparent',
            border: `1px solid ${colors.line3}`,
            color: colors.fg,
            padding: '12px 14px',
            width: '100%',
            fontFamily: fontFamily.mono,
            fontSize: 13,
            lineHeight: 1.6,
            resize: 'vertical',
            borderRadius: 6,
            minHeight: 360,
          }}
        />
      )}

      <input ref={hiddenRef} type="hidden" name={name} value={markdown} readOnly />

      {error && (
        <span role="alert" style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.accent }}>
          {error}
        </span>
      )}

      <span style={{ fontFamily: fontFamily.mono, fontSize: 10, color: colors.muted, lineHeight: 1.5 }}>
        Tryb <strong style={{ color: colors.fg }}>Podgląd</strong> pokazuje artykuł tak, jak na stronie. Wideo: wklej link YouTube lub Vimeo
        po kliknięciu „▶ Wideo”.
      </span>
    </div>
  );
}
