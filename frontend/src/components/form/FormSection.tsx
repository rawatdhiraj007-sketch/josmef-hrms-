'use client';

import { ReactNode } from 'react';

interface FormSectionProps {
  /** Section title — also used as the aria-labelledby reference */
  title: string;
  /** Optional subtitle/helper text below the title */
  description?: string;
  /** Optional icon shown left of the title */
  icon?: any;
  /** Optional right-aligned content (e.g. action button, count badge) */
  trailing?: ReactNode;
  /** Hide the visible card chrome (useful for nested sections) */
  flush?: boolean;
  /** Optional accent gradient line on top */
  accent?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Premium form section — a tokenized card with a header and body slot.
 * Use to group related fields. Pair with <FormGrid> for the body.
 */
export default function FormSection({
  title, description, icon: Icon, trailing, flush, accent, className = '', children,
}: FormSectionProps) {
  const wrapClasses = flush
    ? ''
    : 'bg-white border border-surface-200 rounded-2xl shadow-card overflow-hidden';

  return (
    <section
      aria-labelledby={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
      className={`relative ${wrapClasses} ${className}`}
    >
      {accent && !flush && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
      )}

      <header className={`${flush ? 'mb-4' : 'px-5 sm:px-6 pt-5 pb-3 border-b border-surface-100'} flex items-start justify-between gap-3`}>
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-200/40 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary-600" />
            </div>
          )}
          <div className="min-w-0">
            <h2
              id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
              className="text-sm sm:text-base font-semibold text-surface-900 tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs text-surface-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {trailing && <div className="flex-shrink-0">{trailing}</div>}
      </header>

      <div className={flush ? '' : 'px-5 sm:px-6 py-5'}>{children}</div>
    </section>
  );
}
