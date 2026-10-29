'use client';

import { isValidElement, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Renders `visible` items always, and `extra` items once expanded —
 * used by homepage sections before a "Pokaż więcej" toggle. After the
 * first expand, extras stay mounted (hidden when collapsed) so layout
 * and reveal animations stay stable. Collapsing scrolls back to the
 * section so the viewport doesn't jump into a different block.
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
  const [mountedExtra, setMountedExtra] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const collapsingRef = useRef(false);
  const t = useTranslations('home');

  useLayoutEffect(() => {
    if (!collapsingRef.current) return;
    collapsingRef.current = false;

    const section = rootRef.current?.closest('[data-tk-section]') as HTMLElement | null;
    const target = section ?? rootRef.current;
    if (!target) return;

    const header = document.querySelector('.tk-header') as HTMLElement | null;
    const offset = (header?.offsetHeight ?? 0) + 12;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }, [expanded]);

  if (extra.length === 0) {
    return (
      <div className={wrapperClassName} style={wrapperStyle}>
        {visible}
      </div>
    );
  }

  function toggle() {
    if (expanded) {
      collapsingRef.current = true;
      setExpanded(false);
    } else {
      setMountedExtra(true);
      setExpanded(true);
    }
  }

  return (
    <div ref={rootRef} className="tk-expandable">
      <div className={wrapperClassName} style={wrapperStyle}>
        {visible}
        {mountedExtra &&
          extra.map((node, i) => {
            const key =
              isValidElement(node) && node.key != null ? String(node.key) : `extra-${i}`;
            return (
              <div
                key={key}
                className={expanded ? 'tk-expand-slot' : 'tk-expand-slot is-collapsed'}
                aria-hidden={!expanded}
              >
                {node}
              </div>
            );
          })}
      </div>
      <button
        type="button"
        className="tk-show-more-btn"
        aria-expanded={expanded}
        onClick={toggle}
      >
        {expanded ? t('showLess') : t('showMore')}
      </button>
    </div>
  );
}
