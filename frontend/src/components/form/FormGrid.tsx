'use client';

import { ReactNode } from 'react';

interface FormGridProps {
  /** Number of columns on desktop (defaults to 2) */
  cols?: 1 | 2 | 3 | 4;
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
}

const COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

const GAP = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-5',
} as const;

/**
 * Responsive grid for laying out form fields inside a <FormSection>.
 *
 * - <FormGrid cols={3}>  for compact field grids
 * - <FormGrid cols={2}>  default — works for almost everything
 * - <FormGrid cols={1}>  for stacked / full-width forms
 *
 * Children can use `className="sm:col-span-2"` to span columns.
 */
export default function FormGrid({
  cols = 2, gap = 'md', className = '', children,
}: FormGridProps) {
  return (
    <div className={`grid ${COLS[cols]} ${GAP[gap]} ${className}`}>
      {children}
    </div>
  );
}
