'use client';

import { ReactNode } from 'react';
import type { StatusVariant } from '@/lib/design-tokens';
import { statusColors } from '@/lib/design-tokens';
import { Inbox } from 'lucide-react';
import DataEmpty from '@/components/data/DataEmpty';

export interface TimelineEvent {
  /** Stable identifier for the React key */
  id: string;
  /** Icon component (e.g. lucide-react) */
  icon: any;
  /** Color variant — drives icon background + ring */
  variant?: StatusVariant;
  /** Short event title */
  title: string;
  /** Optional longer description below the title */
  description?: ReactNode;
  /** Timestamp — Date object OR ISO string */
  timestamp?: Date | string | null;
  /** Optional author display (e.g. "Maria Cruz") */
  author?: string;
  /** Optional right-side metadata (e.g. status badge) */
  trailing?: ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  /** Empty state title when events.length === 0 */
  emptyTitle?: string;
  emptyDescription?: string;
  /** Reverse chronological (latest first) — true by default */
  newestFirst?: boolean;
}

/**
 * Vertical activity timeline — Linear/Notion-style.
 * - Dotted vertical rail
 * - Color-tinted icon bubbles
 * - Relative timestamps that auto-update
 * - Empty state when no events
 */
export default function Timeline({
  events, emptyTitle = 'No activity yet',
  emptyDescription = 'Events will appear here as they happen.',
  newestFirst = true,
}: TimelineProps) {
  if (!events.length) {
    return (
      <DataEmpty
        variant="block"
        icon={Inbox}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const ordered = newestFirst
    ? [...events].sort((a, b) => tsToMs(b.timestamp) - tsToMs(a.timestamp))
    : events;

  return (
    <ol className="relative" aria-label="Activity timeline">
      {/* The vertical rail */}
      <span
        aria-hidden
        className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-surface-200 via-surface-200 to-transparent"
      />
      {ordered.map((e) => (
        <TimelineItem key={e.id} event={e} />
      ))}
    </ol>
  );
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const tone = statusColors[event.variant ?? 'neutral'];
  const Icon = event.icon;
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Icon bubble */}
      <div className="flex-shrink-0 z-10">
        <span
          className={`w-8 h-8 rounded-full ${tone.bg} ring-2 ring-white shadow-card flex items-center justify-center`}
        >
          <Icon className={`w-3.5 h-3.5 ${tone.text}`} />
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-surface-900">{event.title}</p>
            {event.description && (
              <div className="text-xs text-surface-500 mt-0.5">{event.description}</div>
            )}
            <div className="text-2xs text-surface-400 mt-1 flex items-center gap-1.5 flex-wrap">
              {event.timestamp && <span title={fullTs(event.timestamp)}>{formatRelative(event.timestamp)}</span>}
              {event.author && (
                <>
                  <span aria-hidden>·</span>
                  <span>{event.author}</span>
                </>
              )}
            </div>
          </div>
          {event.trailing && <div className="flex-shrink-0">{event.trailing}</div>}
        </div>
      </div>
    </li>
  );
}

// ─── helpers ──────────────────────────────────────────────────
function tsToMs(t: Date | string | null | undefined): number {
  if (!t) return 0;
  if (t instanceof Date) return t.getTime();
  const n = new Date(t).getTime();
  return Number.isNaN(n) ? 0 : n;
}

function fullTs(t: Date | string): string {
  const d = t instanceof Date ? t : new Date(t);
  return d.toLocaleString();
}

function formatRelative(t: Date | string): string {
  const d = t instanceof Date ? t : new Date(t);
  const ms = d.getTime();
  if (Number.isNaN(ms)) return '';
  const diff = Math.floor((Date.now() - ms) / 1000);
  if (diff < 5)    return 'just now';
  if (diff < 60)   return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60)      return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)      return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7)    return `${days}d ago`;
  return d.toLocaleDateString();
}
