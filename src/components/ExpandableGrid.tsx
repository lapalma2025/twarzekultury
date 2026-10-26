'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Renders `visible` items always, and `extra` items only once expanded —
 * used by the homepage sections to cap how many articles show before a
 * "Pokaż więcej" button reveals the rest. Items are pre-rendered React
 * elements (built in the server-component parent), so this stays a thin
 * client-side toggle with no data fetching of its own.
 */
export function ExpandableGrid({
  visible,
  extra,
  wrapperClassName,
  wrapperStyle,
}: {
  visible: React.ReactNode[];
  extra: React.ReactNode[];
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
}) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations('home');

  if (extra.length === 0) {
    return (
      <div className={wrapperClassName} style={wrapperStyle}>
        {visible}
      </div>
    );
  }

  return (
    <>
      <div className={wrapperClassName} style={wrapperStyle}>
        {visible}
        {expanded && extra}
      </div>
      <button type="button" className="tk-show-more-btn" onClick={() => setExpanded((v) => !v)}>
        {expanded ? t('showLess') : t('showMore')}
      </button>
    </>
  );
}
