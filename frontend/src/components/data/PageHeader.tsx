'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  icon?: any;
  title: string;
  /** Small descriptor below title — count, breadcrumb context, etc. */
  subtitle?: ReactNode;
  /** Action buttons (e.g. "Add Employee") */
  actions?: ReactNode;
  /** Optional badge next to title (e.g. "12 active") */
  badge?: ReactNode;
}

/**
 * Standardized premium page header used by all list/dashboard pages.
 * Consistent typography, icon tile, action area.
 */
export default function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3 mb-1">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft flex-shrink-0">
              <Icon className="w-4 h-4 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight truncate">
            {title}
          </h1>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
        {subtitle && (
          <div className="text-sm text-surface-500 ml-11">
            {subtitle}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
