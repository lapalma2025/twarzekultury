'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { CATEGORIES } from '@/lib/data/categories';
import { slugify } from '@/lib/slug';
import { colors, fontFamily } from '@/lib/theme';
import { CoverImageUploader } from './CoverImageUploader';
import { MarkdownEditor } from './MarkdownEditor';
import type { Article } from '@/lib/types';
import type { ArticleFormState } from './actions';

const inputStyle: React.CSSProperties = {
  background: 'transparent', border: `1px solid ${colors.line3}`, color: colors.fg,
  padding: '10px 12px', fontSize: 14, width: '100%', fontFamily: fontFamily.sans,
};
/** Native <select> dropdowns on Windows ignore dark text color — force readable options. */
const selectStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: colors.bg2,
  color: colors.fg,
  colorScheme: 'dark',
};
const optionStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#111111',
};
const labelStyle: React.CSSProperties = {
  fontFamily: fontFamily.mono, fontSize: 10, letterSpacing: '.1em', color: colors.muted, textTransform: 'uppercase',
};
const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        background: colors.accent, color: colors.bg, border: 0, padding: '14px 26px',
        fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase',
        cursor: pending ? 'wait' : 'pointer', fontWeight: 500, opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? 'Zapisywanie…' : label}
    </button>
  );
}

interface ArticleFormProps {
  action: (state: ArticleFormState, formData: FormData) => Promise<ArticleFormState>;
  initial?: Article;
  submitLabel: string;
}

export function ArticleForm({ action, initial, submitLabel }: ArticleFormProps) {
  const [state, formAction] = useFormState(action, {});
  const [lang, setLang] = useState<'pl' | 'en'>('pl');
  const [titlePl, setTitlePl] = useState(initial?.title.pl ?? '');
  const [titleEn, setTitleEn] = useState(initial?.title.en ?? '');
  const [slugPl, setSlugPl] = useState(initial?.slug.pl ?? '');
  const [slugEn, setSlugEn] = useState(initial?.slug.en ?? '');
  const [slugPlTouched, setSlugPlTouched] = useState(Boolean(initial));
  const [slugEnTouched, setSlugEnTouched] = useState(Boolean(initial));

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 760 }}>
      <div style={{ ...fieldStyle, maxWidth: 280 }}>
        <label style={labelStyle} htmlFor="category">
          Kategoria
        </label>
        <select
          id="category"
          name="category"
          defaultValue={initial?.category ?? CATEGORIES[0].key}
          style={selectStyle}
        >
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key} style={optionStyle}>
              {c.label.pl}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, borderBottom: `1px solid ${colors.line3}` }}>
        {(['pl', 'en'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            style={{
              background: 'transparent', border: 0, borderBottom: `2px solid ${lang === l ? colors.accent : 'transparent'}`,
              color: lang === l ? colors.fg : colors.muted, padding: '10px 4px', marginBottom: -1,
              fontFamily: fontFamily.mono, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            {l === 'pl' ? 'Polski' : 'English'}
          </button>
        ))}
      </div>

      <div style={{ display: lang === 'pl' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="titlePl">
            Tytuł (PL)
          </label>
          <input
            id="titlePl"
            name="titlePl"
            required
            value={titlePl}
            onChange={(e) => {
              setTitlePl(e.target.value);
              if (!slugPlTouched) setSlugPl(slugify(e.target.value));
            }}
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="slugPl">
            Slug (PL) — adres URL
          </label>
          <input
            id="slugPl"
            name="slugPl"
            required
            value={slugPl}
            onChange={(e) => {
              setSlugPlTouched(true);
              setSlugPl(e.target.value);
            }}
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="leadPl">
            Lead / zajawka (PL)
          </label>
          <textarea id="leadPl" name="leadPl" rows={2} defaultValue={initial?.lead.pl ?? ''} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <MarkdownEditor id="bodyPl" name="bodyPl" label="Treść (PL)" defaultValue={initial?.body.pl ?? ''} required rows={16} />
      </div>

      <div style={{ display: lang === 'en' ? 'flex' : 'none', flexDirection: 'column', gap: 20 }}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="titleEn">
            Tytuł (EN)
          </label>
          <input
            id="titleEn"
            name="titleEn"
            required
            value={titleEn}
            onChange={(e) => {
              setTitleEn(e.target.value);
              if (!slugEnTouched) setSlugEn(slugify(e.target.value));
            }}
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="slugEn">
            Slug (EN) — adres URL
          </label>
          <input
            id="slugEn"
            name="slugEn"
            required
            value={slugEn}
            onChange={(e) => {
              setSlugEnTouched(true);
              setSlugEn(e.target.value);
            }}
            style={inputStyle}
          />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="leadEn">
            Lead (EN)
          </label>
          <textarea id="leadEn" name="leadEn" rows={2} defaultValue={initial?.lead.en ?? ''} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <MarkdownEditor id="bodyEn" name="bodyEn" label="Treść (EN)" defaultValue={initial?.body.en ?? ''} required rows={16} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Zdjęcie główne</label>
        <CoverImageUploader
          name="coverImageUrl"
          positionName="coverImagePosition"
          defaultValue={initial?.coverImageUrl ?? null}
          defaultPosition={initial?.coverImagePosition}
        />
      </div>

      <div className="tk-form-row-3" style={{ display: 'grid', gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="author">
            Autor
          </label>
          <input id="author" name="author" required defaultValue={initial?.author ?? 'Redakcja'} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="readingTimeMin">
            Czas czytania (min)
          </label>
          <input id="readingTimeMin" name="readingTimeMin" type="number" min={1} max={180} required defaultValue={initial?.readingTimeMin ?? 5} style={inputStyle} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="rating">
            Ocena (0–10, opcjonalnie)
          </label>
          <input id="rating" name="rating" type="number" min={0} max={10} step={0.1} defaultValue={initial?.rating ?? ''} style={inputStyle} />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="tags">
          Tagi (oddzielone przecinkami)
        </label>
        <input id="tags" name="tags" defaultValue={initial?.tags.join(', ') ?? ''} style={inputStyle} />
      </div>

      <div style={{ ...fieldStyle, maxWidth: 280 }}>
        <label style={labelStyle} htmlFor="status">
          Status
        </label>
        <select id="status" name="status" defaultValue={initial?.status ?? 'draft'} style={selectStyle}>
          <option value="draft" style={optionStyle}>Szkic</option>
          <option value="published" style={optionStyle}>Opublikowany</option>
        </select>
      </div>

      {state.error && (
        <div role="alert" style={{ fontFamily: fontFamily.mono, fontSize: 12, color: colors.accent }}>
          {state.error}
        </div>
      )}

      <div>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
