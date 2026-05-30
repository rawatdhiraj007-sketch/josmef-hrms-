'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataPaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  /** Optional page-size selector */
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  /** Compact = arrows only, no page numbers */
  compact?: boolean;
}

/**
 * Modern pagination footer — designed to sit below a DataTable.
 * Linear-style: first / prev / current / next / last buttons,
 * with the current page highlighted.
 */
export default function DataPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  compact = false,
}: DataPaginationProps) {
  if (totalPages <= 1 && !pageSizeOptions) return null;

  const pages = compactPageRange(page, totalPages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-surface-200/70 bg-surface-50/50 rounded-b-xl">
      {/* Left: info */}
      <div className="text-xs text-surface-500 flex items-center gap-3">
        {total !== undefined && (
          <span>
            <span className="font-semibold text-surface-700 tabular-nums">{total.toLocaleString()}</span>
            {' '}{total === 1 ? 'result' : 'results'}
          </span>
        )}
        {pageSizeOptions && onPageSizeChange && pageSize && (
          <>
            <span className="text-surface-300">·</span>
            <label className="flex items-center gap-1.5">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="bg-white border border-surface-200 hover:border-surface-300 rounded-md px-1.5 py-0.5 text-xs font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-200 cursor-pointer"
              >
                {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>per page</span>
            </label>
          </>
        )}
      </div>

      {/* Right: pager */}
      <div className="flex items-center gap-1">
        {!compact && (
          <PagerButton
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </PagerButton>
        )}
        <PagerButton
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </PagerButton>

        {!compact && pages.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-2 text-surface-300 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`min-w-[28px] h-7 px-2 rounded-md text-xs font-medium tabular-nums transition-all ${
                page === p
                  ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-soft'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              {p}
            </button>
          )
        )}

        {compact && (
          <span className="px-2.5 text-xs text-surface-600 tabular-nums">
            Page <span className="font-semibold text-surface-900">{page}</span> of {totalPages}
          </span>
        )}

        <PagerButton
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </PagerButton>
        {!compact && (
          <PagerButton
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            aria-label="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </PagerButton>
        )}
      </div>
    </div>
  );
}

function PagerButton({ children, disabled, onClick, ...rest }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-7 h-7 rounded-md flex items-center justify-center text-surface-600 hover:bg-surface-100 hover:text-surface-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
      {...rest}
    >
      {children}
    </button>
  );
}

/** Return compact range: e.g. [1, 2, '…', 5, 6, 7, '…', 20] */
function compactPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const left  = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) pages.push('…');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}
