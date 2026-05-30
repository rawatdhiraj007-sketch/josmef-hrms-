'use client';

import { useEffect, useState } from 'react';
import { Check, CloudUpload, AlertCircle, Circle } from 'lucide-react';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  state: SaveState;
  /** Last saved timestamp (Date) */
  lastSavedAt?: Date | null;
  /** Error message when state === 'error' */
  errorMessage?: string;
  /** Optional "dirty" indicator — shows pending dot when true and idle */
  dirty?: boolean;
  className?: string;
}

/**
 * Visual indicator for the save lifecycle.
 *   idle     — neutral, "Saved" with relative time if lastSavedAt is set
 *              OR "Unsaved changes" dot if dirty
 *   saving   — spinning cloud icon + "Saving…"
 *   saved    — green checkmark + "Saved" (auto-fades back to idle if used standalone)
 *   error    — red icon + error message
 */
export default function SaveIndicator({
  state, lastSavedAt, errorMessage, dirty, className = '',
}: SaveIndicatorProps) {
  const [relative, setRelative] = useState<string>('');

  // Tick the relative timestamp every 20s so "saved 2m ago" stays accurate
  useEffect(() => {
    if (!lastSavedAt) { setRelative(''); return; }
    function tick() {
      if (!lastSavedAt) return;
      setRelative(formatRelative(lastSavedAt));
    }
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, [lastSavedAt]);

  if (state === 'saving') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-surface-600 ${className}`} role="status" aria-live="polite">
        <CloudUpload className="w-3.5 h-3.5 text-primary-600 animate-pulse" />
        Saving…
      </span>
    );
  }
  if (state === 'saved') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-emerald-700 ${className}`} role="status" aria-live="polite">
        <Check className="w-3.5 h-3.5" />
        Saved{relative ? ` ${relative}` : ''}
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-rose-700 ${className}`} role="status" aria-live="assertive">
        <AlertCircle className="w-3.5 h-3.5" />
        {errorMessage || 'Save failed'}
      </span>
    );
  }
  // idle
  if (dirty) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-amber-700 ${className}`}>
        <Circle className="w-2 h-2 fill-amber-500 text-amber-500" />
        Unsaved changes
      </span>
    );
  }
  if (lastSavedAt) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs text-surface-500 ${className}`}>
        <Check className="w-3.5 h-3.5 text-emerald-500" />
        Saved{relative ? ` ${relative}` : ''}
      </span>
    );
  }
  return null;
}

function formatRelative(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return d.toLocaleDateString();
}
