'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import type { AiInsight } from '@/lib/ai';

interface AiInsightCardProps {
  insight: AiInsight;
}

/**
 * Premium AI insight card — shows the metric value, plain-English
 * explanation, and an optional recommendation with click-through.
 * Tokenized — works under every theme.
 */
export default function AiInsightCard({ insight }: AiInsightCardProps) {
  const Icon = insight.icon ?? Sparkles;
  const tone = insight.tone ?? 'neutral';

  const TONE_RING: Record<typeof tone, string> = {
    positive: 'from-emerald-500/10 to-emerald-400/5 text-emerald-600',
    negative: 'from-rose-500/10    to-rose-400/5    text-rose-600',
    neutral:  'from-surface-400/10 to-surface-300/5 text-surface-600',
    info:     'from-primary-500/10 to-accent-500/10 text-primary-600',
  };

  const inner = (
    <div className="group relative bg-white border border-surface-200 rounded-2xl p-4 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${TONE_RING[tone]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        {insight.delta !== undefined && insight.delta !== 0 && (
          <span className={`inline-flex items-center gap-0.5 text-2xs font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${
            insight.delta > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
          }`}>
            {insight.delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(insight.delta)}%
          </span>
        )}
      </div>

      <div className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">{insight.metric}</div>
      <div className="text-2xl font-bold text-surface-900 tabular-nums mt-1 leading-none">{insight.value}</div>

      <p className="text-xs text-surface-600 mt-2.5 leading-relaxed">
        <span className="text-2xs font-semibold text-primary-700 uppercase tracking-wider">AI insight · </span>
        {insight.explanation}
      </p>

      {insight.recommendation && (
        <div className="mt-3 pt-3 border-t border-surface-100">
          <p className="text-xs text-surface-700 leading-relaxed">
            <span className="text-2xs font-semibold text-amber-700 uppercase tracking-wider">Recommendation · </span>
            {insight.recommendation}
          </p>
        </div>
      )}

      {insight.href && (
        <div className="mt-3 inline-flex items-center gap-1 text-2xs font-medium text-primary-700 group-hover:text-primary-900">
          View details <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </div>
  );

  return insight.href ? (
    <Link href={insight.href} className="block h-full">{inner}</Link>
  ) : inner;
}
