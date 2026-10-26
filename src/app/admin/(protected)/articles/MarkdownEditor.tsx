'use client';

import { useMemo, useRef, useState } from 'react';
import { colors, fontFamily } from '@/lib/theme';
import { renderArticleBody } from '@/lib/markdown';
import { uploadImageAction } from './upload';

const labelStyle: React.CSSProperties = {
  fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.1em', color: colors.muted, textTransform: 'uppercase',
};

const toolBtnStyle: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg,
  width: 30, height: 28, fontFamily: fontFamily.serif, fontSize: 13, cursor: 'pointer', lineHeight: 1,
};

interface MarkdownEditorProps {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  required?: boolean;
  rows?: number;
}

/**
 * A lightweight Markdown editor: a plain textarea (so the stored format stays
 * clean Markdown, sanitized on every render) with a formatting toolbar that
 * inserts syntax at the cursor — including uploading an image or embedding a
 * YouTube/Vimeo video straight into the body — and a live preview that runs
 * the article through the exact same render pipeline readers see.
 */
export function MarkdownEditor({ id, name, label, defaultValue, required, rows = 16 }: MarkdownEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const html = useMemo(() => (preview ? renderArticleBody(value) : ''), [preview, value]);

  function focusAndSelect(start: number, end: number) {
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(start, end);
    });
  }

  function rememberCursor() {
    const el = ref.current;
    if (el) cursorRef.current = { start: el.selectionStart, end: el.selectionEnd };
  }

  function insertAtCursor(text: string) {
    const { start, end } = ref.current ? { start: ref.current.selectionStart, end: ref.current.selectionEnd } : cursorRef.current;
    const next = `${value.slice(0, start)}${text}${value.slice(end)}`;
    setValue(next);
    focusAndSelect(start + text.length, start + text.length);
  }

  function wrapSelection(before: string, after: string = before) {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const selected = value.slice(s, e);
    const next = `${value.slice(0, s)}${before}${selected}${after}${value.slice(e)}`;
    setValue(next);
    focusAndSelect(s + before.length, s + before.length + selected.length);
  }

  function prefixLine(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const next = `${value.slice(0, lineStart)}${prefix}${value.slice(lineStart)}`;
    setValue(next);
    focusAndSelect(s + prefix.length, s + prefix.length);
  }

  function insertLink() {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const label = value.slice(s, e) || 'tekst linku';
    const next = `${value.slice(0, s)}[${label}](https://)${value.slice(e)}`;
    setValue(next);
    const urlStart = s + label.length + 3;
    focusAndSelect(urlStart, urlStart + 8);
  }

  function insertVideo() {
    rememberCursor();
    const url = window.prompt('Wklej link do filmu (YouTube lub Vimeo):');
    if (!url) return;
    insertAtCursor(`\n\n[[video: ${url.trim()}]]\n\n`);
  }

  function triggerImageUpload() {
    rememberCursor();
    fileInputRef.current?.click();
  }

  async function handleImageFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const fd = new FormData();
    fd.set('file', file);
    const res = await uploadImageAction(fd);
    setUploading(false);
    if (res.error) {
      setUploadError(res.error);
      return;
    }
    if (res.url) insertAtCursor(`\n\n![opis zdjęcia](${res.url})\n\n`);
  }

  const tools: Array<{ title: string; label: string; action: () => void; disabled?: boolean }> = [
    { title: 'Pogrubienie', label: 'B', action: () => wrapSelection('**') },
    { title: 'Kursywa', label: 'I', action: () => wrapSelection('*') },
    { title: 'Nagłówek', label: 'H2', action: () => prefixLine('## ') },
    { title: 'Cytat', label: '❝', action: () => prefixLine('> ') },
    { title: 'Lista', label: '•', action: () => prefixLine('- ') },
    { title: 'Link', label: '🔗', action: insertLink },
    { title: 'Wstaw zdjęcie', label: '🖼', action: triggerImageUpload, disabled: uploading },
    { title: 'Wstaw wideo (YouTube / Vimeo)', label: '▶', action: insertVideo },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <label style={labelStyle} htmlFor={id}>
          {label}
        </label>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          {!preview && (
            <>
              {tools.map((t) => (
                <button
                  key={t.title}
                  type="button"
                  title={t.title}
                  onClick={t.action}
                  disabled={t.disabled}
                  style={{ ...toolBtnStyle, opacity: t.disabled ? 0.5 : 1, cursor: t.disabled ? 'wait' : 'pointer' }}
                >
                  {t.label}
                </button>
              ))}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => handleImageFile(e.target.files?.[0])}
                hidden
              />
              {uploading && <span style={{ fontFamily: fontFamily.mono, fontSize: 10, color: colors.muted }}>Wgrywanie…</span>}
            </>
          )}
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            style={{
              ...toolBtnStyle, width: 'auto', padding: '0 10px', fontFamily: fontFamily.mono, fontSize: 10,
              letterSpacing: '.06em', textTransform: 'uppercase', color: preview ? colors.bg : colors.fg,
              background: preview ? colors.accent : 'transparent', borderColor: preview ? colors.accent : colors.line3,
            }}
          >
            {preview ? 'Edytuj' : 'Podgląd'}
          </button>
        </div>
      </div>

      {uploadError && (
        <span role="alert" style={{ fontFamily: fontFamily.mono, fontSize: 11, color: colors.accent }}>
          {uploadError}
        </span>
      )}

      {preview && (
        <div
          className="tk-article"
          style={{
            border: `1px solid ${colors.line3}`, padding: '20px 24px', minHeight: rows * 22,
            maxHeight: 480, overflowY: 'auto', background: 'rgba(242,236,221,.02)',
          }}
          dangerouslySetInnerHTML={{ __html: html || '<p style="opacity:.5">Brak treści do podglądu.</p>' }}
        />
      )}
      <textarea
        ref={ref}
        id={id}
        name={name}
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        hidden={preview}
        style={{
          background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg,
          padding: '10px 12px', width: '100%', fontFamily: fontFamily.mono, fontSize: 13, lineHeight: 1.6, resize: 'vertical',
        }}
      />
      <span style={{ fontFamily: fontFamily.mono, fontSize: 10, color: colors.muted }}>
        Markdown: **pogrubienie**, *kursywa*, ## nagłówek, &gt; cytat, - lista, [tekst](url). 🖼 wgrywa zdjęcie
        w miejsce kursora, ▶ osadza film z YouTube/Vimeo po wklejeniu linku.
      </span>
    </div>
  );
}
