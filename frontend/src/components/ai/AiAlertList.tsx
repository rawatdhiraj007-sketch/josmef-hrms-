'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, BellRing, Loader2 } from 'lucide-react';
import { useAi } from '@/hooks/useAi';
import type { Priority } from '@/lib/ai';

const PRIORITY_META: Record<Priority, { label: string; bg: string; text: string; accent: string }> = {
  critical: { label: 'Critical', bg: 'bg-rose-50',    text: 'text-rose-800',    accent: 'bg-rose-500' },
  high:     { label: 'High',     bg: 'bg-amber-50',   text: 'text-amber-800',   accent: 'bg-amber-500' },
  medium:   { label: 'Medium',   bg: 'bg-blue-50',    text: 'text-blue-800',    accent: 'bg-blue-500' },
  low:      { label: 'Low',      bg: 'bg-surface-50', text: 'text-surface-700', accent: 'bg-surface-400' },
};

interface AiAlertListProps {
  limit?: number;
}

/**
 * Prioritized alert list — sorted critical → low. Each alert shows
 * what happened, why it matters, and a one-click action.
 */
export default function AiAlertList({ limit }: AiAlertListProps) {
  const router = useRouter();
  const { alerts, loading } = useAi();

  if (loading) {
    return (
      <div className="py-10 text-center text-surface-400 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading alerts…
      </div>
    );
  }

  const shown = limit ? alerts.slice(0, limit) : alerts;

  if (shown.length === 0) {
    return (
      <div className="py-10 text-center">
        <BellRing className="w-8 h-8 text-surface-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-surface-700">All clear</p>
        <p className="text-2xs text-surface-500 mt-0.5">No alerts right now.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-surface-100">
      {shown.map((a) => {
        const meta = PRIORITY_META[a.priority];
        const Icon = a.icon;
        return (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => a.href && router.push(a.href)}
              disabled={!a.href}
              className="w-full text-left px-4 sm:px-5 py-3 hover:bg-surface-50/60 transition-colors flex items-start gap-3 group disabled:cursor-default"
            >
              {/* priority bar */}
              <span aria-hidden className={`w-1 self-stretch rounded-full ${meta.accent} flex-shrink-0 mt-0.5`} />

              <div className={`w-9 h-9 rounded-xl ${meta.bg} ${meta.text} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-2xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${meta.bg} ${meta.text}`}>
                    {meta.label}
                  </span>
                  <span className="text-sm font-semibold text-surface-900">{a.title}</span>
                </div>
                <p className="text-xs text-surface-600 mt-1 leading-relaxed">{a.reason}</p>
                <p className="text-xs text-surface-800 mt-1 leading-relaxed">
                  <span className="text-2xs font-semibold text-amber-700 uppercase tracking-wider">Action · </span>
                  {a.action}
                </p>
              </div>

              {a.href && (
                <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-primary-600 transition-colors flex-shrink-0 mt-1" />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
