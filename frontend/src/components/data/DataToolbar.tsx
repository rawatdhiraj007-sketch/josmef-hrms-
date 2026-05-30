'use client';

import { Search, X, SlidersHorizontal, Rows3, Rows2 } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface DataToolbarProps {
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  searchPlaceholder?: string;
  /** Filter controls (selects, etc.) — rendered after search */
  children?: ReactNode;
  /** Active filter count — shows badge */
  activeFilterCount?: number;
  /** Clear-all callback */
  onClear?: () => void;
  /** Optional density preference key for localStorage */
  densityKey?: string;
  onDensityChange?: (density: 'compact' | 'comfy') => void;
}

/**
 * Premium data toolbar — search + filters + density.
 * Sticky-able if dropped inside a sticky parent.
 */
export default function DataToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search…',
  children,
  activeFilterCount = 0,
  onClear,
  densityKey,
  onDensityChange,
}: DataToolbarProps) {
  const [density, setDensity] = useState<'compact' | 'comfy'>('comfy');

  useEffect(() => {
    if (!densityKey) return;
    try {
      const saved = localStorage.getItem(densityKey) as 'compact' | 'comfy' | null;
      if (saved === 'compact' || saved === 'comfy') {
        setDensity(saved);
        onDensityChange?.(saved);
      }
    } catch { /* */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleDensity(d: 'compact' | 'comfy') {
    setDensity(d);
    if (densityKey) try { localStorage.setItem(densityKey, d); } catch {}
    onDensityChange?.(d);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-white border border-surface-200 shadow-card">
      {/* Search */}
      {onSearchChange && (
        <div className="flex items-center gap-2 bg-surface-50 hover:bg-white border border-transparent hover:border-surface-200 rounded-lg px-3 py-1.5 flex-1 min-w-64 transition-all focus-within:bg-white focus-within:border-primary-300 focus-within:shadow-soft">
          <Search className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="bg-transparent text-sm flex-1 outline-none placeholder:text-surface-400 min-w-0"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="text-surface-400 hover:text-surface-700 flex-shrink-0"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Filters slot */}
      {children && (
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-surface-400" />
          {children}
          {activeFilterCount > 0 && (
            <span className="badge-info tabular-nums">
              {activeFilterCount}
            </span>
          )}
        </div>
      )}

      {/* Clear all */}
      {activeFilterCount > 0 && onClear && (
        <button
          onClick={onClear}
          className="text-xs text-surface-500 hover:text-surface-900 px-2 py-1 rounded-md hover:bg-surface-100 transition-colors"
        >
          Clear all
        </button>
      )}

      <div className="flex-1" />

      {/* Density toggle */}
      {onDensityChange && (
        <div className="flex items-center bg-surface-50 border border-surface-200 rounded-lg p-0.5">
          <button
            onClick={() => toggleDensity('compact')}
            className={`p-1.5 rounded transition-all ${
              density === 'compact'
                ? 'bg-white shadow-soft text-surface-900'
                : 'text-surface-400 hover:text-surface-700'
            }`}
            title="Compact view"
            aria-label="Compact view"
          >
            <Rows3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => toggleDensity('comfy')}
            className={`p-1.5 rounded transition-all ${
              density === 'comfy'
                ? 'bg-white shadow-soft text-surface-900'
                : 'text-surface-400 hover:text-surface-700'
            }`}
            title="Comfortable view"
            aria-label="Comfortable view"
          >
            <Rows2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Sleek styled select for filter dropdowns inside DataToolbar.
 */
export function FilterSelect({
  value, onChange, children, ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm bg-white border border-surface-200 hover:border-surface-300 rounded-lg px-3 py-1.5 font-medium text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all cursor-pointer"
    >
      {children}
    </select>
  );
}
