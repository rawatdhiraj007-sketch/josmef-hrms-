'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import { getAiUsage } from '@/lib/aiCredits';
import { useWorkspace } from '@/hooks/useWorkspace';

interface AiCreditsWidgetProps {
  /** Compact "12 / 100" badge (default) or expanded card with progress bar */
  variant?: 'badge' | 'card';
  className?: string;
}

/**
 * Display-only AI credits indicator.
 *
 * Listens for the synthetic `nn:ai-usage` event dispatched by recordAiUse()
 * so it updates live as the user interacts with the assistant.
 *
 * NOT a quota gate — purely informational. Real enforcement requires
 * server-side counter.
 */
export default function AiCreditsWidget({ variant = 'badge', className = '' }: AiCreditsWidgetProps) {
  const { planDef } = useWorkspace();
  const [usage, setUsage] = useState(() => getAiUsage());

  useEffect(() => {
    function update() { setUsage(getAiUsage()); }
    update();
    window.addEventListener('nn:ai-usage', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('nn:ai-usage', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-200/40 text-2xs ${className}`}>
        <Sparkles className="w-3 h-3 text-primary-600" />
        <span className="font-semibold text-surface-700 tabular-nums">
          {usage.used}
          {usage.unlimited ? (
            <> / <InfinityIcon className="w-3 h-3 inline -mt-0.5" /></>
          ) : (
            <span className="text-surface-500"> / {usage.limit}</span>
          )}
        </span>
      </div>
    );
  }

  // Card variant — full breakdown
  return (
    <div className={`bg-white border border-surface-200 rounded-2xl p-4 shadow-card ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">AI Credits</div>
          <div className="text-2xl font-bold tabular-nums mt-1 text-surface-900">
            {usage.used}
            {!usage.unlimited && <span className="text-surface-400 text-sm font-normal"> / {usage.limit}</span>}
            {usage.unlimited && <InfinityIcon className="w-5 h-5 inline ml-1 text-primary-500" />}
          </div>
          <div className="text-2xs text-surface-400 mt-0.5">{planDef.name} plan · this month</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>
      {!usage.unlimited && (
        <>
          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usage.percent >= 90 ? 'bg-rose-500' :
                usage.percent >= 75 ? 'bg-amber-500' :
                'bg-gradient-to-r from-primary-500 to-accent-500'
              }`}
              style={{ width: `${usage.percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-2xs">
            <span className="text-surface-500">{usage.percent}% used</span>
            <span className="text-surface-500 tabular-nums">{Math.max(0, usage.limit - usage.used)} remaining</span>
          </div>
        </>
      )}
      <p className="text-2xs text-surface-400 mt-3 italic">
        Local counter — server-side metering pending.
      </p>
    </div>
  );
}
