'use client';

import { ReactNode } from 'react';

interface DataEmptyProps {
  icon: any;
  title: string;
  description?: string;
  action?: ReactNode;
  /** Inline (for table cell) or block (for page-level) */
  variant?: 'inline' | 'block';
}

/**
 * Premium empty state for tables, lists, and panels.
 * Use inline inside <td colSpan> for empty tables, or as a block.
 */
export default function DataEmpty({
  icon: Icon,
  title,
  description,
  action,
  variant = 'inline',
}: DataEmptyProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        variant === 'inline' ? 'py-16' : 'py-20 px-6 rounded-2xl border border-dashed border-surface-200 bg-surface-50/50'
      }`}
    >
      {/* Decorative icon with gradient halo */}
      <div className="relative mb-4">
        <div className="absolute inset-0 -m-2 bg-gradient-to-br from-primary-300/20 to-accent-500/15 rounded-2xl blur-xl" />
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-surface-50 border border-surface-200 flex items-center justify-center shadow-card">
          <Icon className="w-6 h-6 text-surface-400" />
        </div>
      </div>

      <h3 className="text-sm font-semibold text-surface-900 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-surface-500 max-w-xs mb-4">{description}</p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
