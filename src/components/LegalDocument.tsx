import { colors, fontFamily } from '@/lib/theme';
import { LEGAL_DOCS, type LegalDocId } from '@/content/legal';
import type { Locale } from '@/lib/types';

export function LegalDocument({ id, locale }: { id: LegalDocId; locale: Locale }) {
  const doc = LEGAL_DOCS[id];

  return (
    <article className="tk-container tk-legal" style={{ maxWidth: 760, margin: '0 auto', paddingTop: 40, paddingBottom: 72 }}>
      <h1 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 'clamp(32px, 7vw, 56px)', letterSpacing: '-.02em', margin: '0 0 12px', lineHeight: 1.1 }}>
        {doc.title[locale]}
      </h1>
      <p style={{ fontFamily: fontFamily.mono, fontSize: 11, letterSpacing: '.1em', color: colors.muted, textTransform: 'uppercase', margin: '0 0 40px' }}>
        {doc.updated[locale]}
      </p>

      {doc.sections.map((section) => (
        <section key={section.heading.pl} style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: fontFamily.serif, fontWeight: 400, fontSize: 'clamp(20px, 4vw, 24px)', letterSpacing: '-.01em', margin: '0 0 12px' }}>
            {section.heading[locale]}
          </h2>
          {section.body[locale].map((p) => (
            <p key={p.slice(0, 40)} style={{ fontFamily: fontFamily.serif, fontSize: 'clamp(15px, 3.5vw, 17px)', lineHeight: 1.65, color: colors.body, margin: '0 0 14px', overflowWrap: 'anywhere' }}>
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
