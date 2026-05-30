'use client';

import { ReactNode } from 'react';

interface StickyActionBarProps {
  /** Left-side context (e.g. entity name) — shown on desktop only */
  context?: ReactNode;
  /** Action buttons (rendered right-aligned) */
  actions: ReactNode;
  /** Hide on mobile (let the top header host the actions there) */
  hideOnMobile?: boolean;
  className?: string;
}

/**
 * Sticky action bar that hugs the bottom of the viewport on tall pages.
 *
 * On detail pages this keeps "Edit", "Archive", "Promote" etc. always in
 * reach without scrolling back to the header. Inherits the app's premium
 * card styling (glass blur + tokenized colors) so it works in every theme.
 */
export default function StickyActionBar({
  context, actions, hideOnMobile, className = '',
}: StickyActionBarProps) {
  return (
    <div
      className={`
        sticky bottom-0 z-30 -mx-4 sm:-mx-6 mt-6
        ${hideOnMobile ? 'hidden sm:block' : ''}
      `}
      role="toolbar"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-4">
        <div
          className={`
            flex items-center justify-between gap-3
            px-4 py-3
            bg-white/90 backdrop-blur-md
            border border-surface-200
            shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.08)]
            rounded-2xl
            ${className}
          `}
        >
          {context && <div className="min-w-0 hidden md:block">{context}</div>}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
}
