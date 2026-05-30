'use client';

import { ReactNode, useMemo, useState } from 'react';
import {
  ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Loader2, Inbox,
} from 'lucide-react';
import DataEmpty from './DataEmpty';

// ─── Types ──────────────────────────────────────────────────
export interface Column<T> {
  /** Stable identifier (used for sort state) */
  key: string;
  /** Header cell content */
  header: ReactNode;
  /** Renderer for the body cell */
  cell: (row: T) => ReactNode;
  /** Provide to make column sortable (client-side) */
  sortAccessor?: (row: T) => string | number | null | undefined;
  align?: 'left' | 'right' | 'center';
  /** Hide responsively (e.g. on small screens) */
  hideOnMobile?: boolean;   // < md
  hideOnTablet?: boolean;   // < lg
  width?: string;           // any tailwind w-* or css width via style
  className?: string;
  thClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: any;
  emptyAction?: ReactNode;

  /** Click handler (e.g. for row navigation) */
  onRowClick?: (row: T) => void;

  /** Enable checkbox bulk-select column */
  selectable?: boolean;
  selectedIds?: string[];
  onSelectedChange?: (ids: string[]) => void;

  /** Controlled sort (omit to use internal client-side state) */
  sortKey?: string | null;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (key: string, dir: 'asc' | 'desc') => void;

  /** Per-row trailing actions (rendered as a kebab cell) */
  rowActions?: (row: T) => ReactNode;

  /** Mobile renderer — when present, table is hidden < md and cards are shown */
  mobileCard?: (row: T) => ReactNode;

  /** Optional density (compact = tighter rows) */
  density?: 'compact' | 'comfy';

  /** Optional className for the wrapper */
  className?: string;
}

// ─── Component ──────────────────────────────────────────────
export default function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyIcon = Inbox,
  emptyAction,
  onRowClick,
  selectable,
  selectedIds,
  onSelectedChange,
  sortKey: controlledSortKey,
  sortDir: controlledSortDir,
  onSortChange,
  rowActions,
  mobileCard,
  density = 'comfy',
  className = '',
}: DataTableProps<T>) {
  // Internal sort state (used only when not controlled)
  const [intSortKey, setIntSortKey] = useState<string | null>(null);
  const [intSortDir, setIntSortDir] = useState<'asc' | 'desc'>('asc');

  const sortKey = controlledSortKey !== undefined ? controlledSortKey : intSortKey;
  const sortDir = controlledSortDir ?? intSortDir;

  function handleSort(col: Column<T>) {
    if (!col.sortAccessor) return;
    const nextDir: 'asc' | 'desc' =
      sortKey === col.key && sortDir === 'asc' ? 'desc' : 'asc';
    if (onSortChange) {
      onSortChange(col.key, nextDir);
    } else {
      setIntSortKey(col.key);
      setIntSortDir(nextDir);
    }
  }

  // Apply client-side sort if sortable column matches current sortKey
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortAccessor) return data;
    const acc = col.sortAccessor;
    const sign = sortDir === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const av = acc(a);
      const bv = acc(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * sign;
      }
      return String(av).localeCompare(String(bv)) * sign;
    });
  }, [data, sortKey, sortDir, columns]);

  // Bulk select helpers
  const allIds = data.map(rowKey);
  const allSelected = selectable && selectedIds && allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
  const someSelected = selectable && selectedIds && selectedIds.length > 0 && !allSelected;

  function toggleAll() {
    if (!onSelectedChange) return;
    if (allSelected) onSelectedChange([]);
    else onSelectedChange(allIds);
  }
  function toggleRow(id: string) {
    if (!onSelectedChange || !selectedIds) return;
    if (selectedIds.includes(id)) onSelectedChange(selectedIds.filter((x) => x !== id));
    else onSelectedChange([...selectedIds, id]);
  }

  const padY = density === 'compact' ? 'py-2' : 'py-3';

  // ── Render ───────────────────────────────────────────────
  return (
    <div className={`bg-white border border-surface-200 rounded-2xl shadow-card overflow-hidden ${className}`}>
      {/* Desktop / tablet table */}
      <div className={`${mobileCard ? 'hidden md:block' : ''} overflow-x-auto`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-50/70 border-b border-surface-200">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={!!allSelected}
                    indeterminate={!!someSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((c) => {
                const align = c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left';
                const responsive = `${c.hideOnTablet ? 'hidden lg:table-cell' : ''} ${c.hideOnMobile ? 'hidden md:table-cell' : ''}`;
                const sortable = !!c.sortAccessor;
                const active = sortKey === c.key;
                return (
                  <th
                    key={c.key}
                    style={c.width ? { width: c.width } : undefined}
                    className={`${align} ${responsive} px-4 py-3 font-semibold text-xs uppercase tracking-wide text-surface-500 ${c.thClassName ?? ''}`}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(c)}
                        className={`inline-flex items-center gap-1.5 group transition-colors hover:text-surface-900 ${active ? 'text-surface-900' : ''}`}
                      >
                        <span>{c.header}</span>
                        {active ? (
                          sortDir === 'asc' ? (
                            <ArrowUp className="w-3 h-3 text-primary-600" />
                          ) : (
                            <ArrowDown className="w-3 h-3 text-primary-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                        )}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
              {rowActions && <th className="w-12 px-2 py-3" aria-label="Actions" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} className="px-4 py-16">
                  <div className="flex items-center justify-center gap-2 text-surface-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading…</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)} className="px-4">
                  <DataEmpty
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const id = rowKey(row);
                const isSelected = !!(selectedIds && selectedIds.includes(id));
                const clickable = !!onRowClick;
                return (
                  <tr
                    key={id}
                    onClick={clickable ? (e) => {
                      // Don't fire row-click when clicking the checkbox or kebab cells
                      const tgt = e.target as HTMLElement;
                      if (tgt.closest('[data-no-row-click]')) return;
                      onRowClick!(row);
                    } : undefined}
                    className={`
                      border-b border-surface-100 last:border-0 transition-colors group
                      ${isSelected ? 'bg-primary-50/50' : 'hover:bg-surface-50/70'}
                      ${clickable ? 'cursor-pointer' : ''}
                    `}
                  >
                    {selectable && (
                      <td className="px-4 py-3" data-no-row-click>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleRow(id)}
                          aria-label={`Select row`}
                        />
                      </td>
                    )}
                    {columns.map((c) => {
                      const align = c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left';
                      const responsive = `${c.hideOnTablet ? 'hidden lg:table-cell' : ''} ${c.hideOnMobile ? 'hidden md:table-cell' : ''}`;
                      return (
                        <td
                          key={c.key}
                          className={`${align} ${responsive} px-4 ${padY} text-surface-800 align-middle ${c.className ?? ''}`}
                        >
                          {c.cell(row)}
                        </td>
                      );
                    })}
                    {rowActions && (
                      <td className="px-2 py-3 text-right" data-no-row-click>
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards (only when mobileCard renderer is provided) */}
      {mobileCard && (
        <div className="md:hidden divide-y divide-surface-100">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-surface-400 text-sm py-12">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading…</span>
            </div>
          ) : sortedData.length === 0 ? (
            <div className="px-4">
              <DataEmpty
                icon={emptyIcon}
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
              />
            </div>
          ) : (
            sortedData.map((row) => {
              const id = rowKey(row);
              const isSelected = !!(selectedIds && selectedIds.includes(id));
              return (
                <div
                  key={id}
                  onClick={onRowClick ? (e) => {
                    const tgt = e.target as HTMLElement;
                    if (tgt.closest('[data-no-row-click]')) return;
                    onRowClick(row);
                  } : undefined}
                  className={`p-4 flex gap-3 transition-colors ${isSelected ? 'bg-primary-50/40' : 'hover:bg-surface-50/70'} ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {selectable && (
                    <div className="pt-1" data-no-row-click>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        aria-label="Select row"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">{mobileCard(row)}</div>
                  {rowActions && <div data-no-row-click className="self-start">{rowActions(row)}</div>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

/** Premium themed checkbox (avoids native styling drift across browsers/themes). */
export function Checkbox({
  checked, indeterminate, onChange, ariaLabel, ...rest
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel?: string;
  'aria-label'?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={(rest as any)['aria-label'] ?? ariaLabel}
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={`
        w-4 h-4 rounded-[5px] flex items-center justify-center
        border transition-all
        ${checked || indeterminate
          ? 'bg-gradient-to-br from-primary-600 to-accent-600 border-transparent text-white shadow-soft'
          : 'bg-white border-surface-300 hover:border-primary-400'}
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/50
      `}
    >
      {indeterminate ? (
        <span className="w-2 h-0.5 bg-white rounded" />
      ) : checked ? (
        <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none">
          <path d="M3 8.5L6.5 12L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </button>
  );
}

/**
 * Floating bulk-action bar — render above DataTable when items are selected.
 */
export function BulkActionBar({
  selectedCount, onClear, children,
}: {
  selectedCount: number;
  onClear: () => void;
  children?: ReactNode;
}) {
  if (selectedCount === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 mb-3 rounded-xl border border-primary-200 bg-gradient-to-r from-primary-50 to-accent-50/60 shadow-soft animate-slide-in-bottom">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-600 to-accent-600 text-white text-xs font-bold flex items-center justify-center tabular-nums">
          {selectedCount}
        </span>
        <span className="text-sm font-medium text-surface-800">
          {selectedCount === 1 ? 'item selected' : 'items selected'}
        </span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        {children}
        <button
          onClick={onClear}
          className="text-xs text-surface-600 hover:text-surface-900 px-2 py-1 rounded-md hover:bg-white/70 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/** Convenience: icon-only kebab trigger for the rowActions slot. */
export function RowActionTrigger({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 hover:text-surface-700 transition-colors"
      aria-label="Row actions"
    >
      <MoreVertical className="w-4 h-4" />
    </button>
  );
}
