'use client';

import { useEffect, useState } from 'react';

interface FlipCounterProps {
  /**
   * What to count. 'elapsed' shows time since a `since` ISO timestamp;
   * 'clock' shows the current wall-clock time HH:MM:SS.
   * Default: 'elapsed' if `since` provided, else 'clock'.
   */
  mode?: 'elapsed' | 'clock';
  /** Anchor timestamp for elapsed mode (ISO string). */
  since?: string;
  /** Optional className on the wrapper */
  className?: string;
}

/**
 * Flip-counter style HH MM SS display — Zoho People's signature
 * "In" widget visual on the profile card.
 *
 * Three tile boxes with bold tabular-num numerals. Ticks every second.
 * Pure JS interval — no canvas, no deps.
 */
export default function FlipCounter({ mode, since, className = '' }: FlipCounterProps) {
  const resolvedMode: 'elapsed' | 'clock' = mode ?? (since ? 'elapsed' : 'clock');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  void tick; // forces rerender

  const [h, m, s] = (() => {
    if (resolvedMode === 'elapsed' && since) {
      const ms = Math.max(0, Date.now() - new Date(since).getTime());
      const totalSec = Math.floor(ms / 1000);
      return [
        Math.floor(totalSec / 3600),
        Math.floor((totalSec % 3600) / 60),
        totalSec % 60,
      ];
    }
    const now = new Date();
    return [now.getHours(), now.getMinutes(), now.getSeconds()];
  })();

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Tile value={h} />
      <Separator />
      <Tile value={m} />
      <Separator />
      <Tile value={s} />
    </div>
  );
}

function Tile({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center justify-center min-w-[44px] h-12 px-2 rounded-md bg-slate-100 border border-slate-200 text-slate-900 text-2xl font-bold tabular-nums tracking-tight">
      {String(value).padStart(2, '0')}
    </span>
  );
}

function Separator() {
  return <span className="text-slate-400 font-bold text-xl">:</span>;
}
