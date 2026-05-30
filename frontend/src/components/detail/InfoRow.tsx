'use client';

import { ReactNode } from 'react';

interface InfoRowProps {
  /** Label text */
  label: string;
  /** Value (string, number, JSX) */
  value?: ReactNode;
  /** Optional leading icon component */
  icon?: any;
  /** Optional trailing action (e.g. copy button, edit button) */
  trailing?: ReactNode;
  /** Make value font-mono (good for IDs, numbers) */
  mono?: boolean;
}

/**
 * Premium info-display row — for read-only entity detail pages.
 *
 * Layout (when icon provided):
 *   [icon]   LABEL
 *            value          [trailing]
 *
 * Layout (no icon):
 *   LABEL
 *   value          [trailing]
 */
export default function InfoRow({
  label, value, icon: Icon, trailing, mono,
}: InfoRowProps) {
  const displayValue = value === null || value === undefined || value === ''
    ? <span className="text-surface-400">—</span>
    : value;
  return (
    <div className="flex items-start gap-3 group">
      {Icon ? (
        <Icon className="w-4 h-4 text-surface-400 mt-1 flex-shrink-0" />
      ) : (
        <span className="w-4 flex-shrink-0" aria-hidden />
      )}
      <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-sm text-surface-900 mt-0.5 ${mono ? 'font-mono text-xs' : ''} break-words`}>
            {displayValue}
          </p>
        </div>
        {trailing && (
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {trailing}
          </div>
        )}
      </div>
    </div>
  );
}
