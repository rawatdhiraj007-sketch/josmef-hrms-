'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { useAi } from '@/hooks/useAi';

interface AiRecommendationsProps {
  limit?: number;
}

export default function AiRecommendations({ limit }: AiRecommendationsProps) {
  const router = useRouter();
  const { recommendations, loading } = useAi();

  if (loading) {
    return (
      <div className="py-10 text-center text-surface-400 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading recommendations…
      </div>
    );
  }

  const shown = limit ? recommendations.slice(0, limit) : recommendations;

  if (shown.length === 0) {
    return (
      <div className="py-10 text-center">
        <Lightbulb className="w-8 h-8 text-surface-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-surface-700">No recommendations</p>
        <p className="text-2xs text-surface-500 mt-0.5">The AI will surface suggestions as patterns emerge.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {shown.map((r) => {
        const Icon = r.icon;
        return (
          <li key={r.id}>
            <div className="p-3.5 rounded-xl bg-white border border-surface-200 hover:border-primary-200 hover:shadow-card-hover transition-all flex items-start gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 text-primary-600 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-surface-900">{r.title}</p>
                <p className="text-xs text-surface-600 mt-1 leading-relaxed">{r.rationale}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {r.impact && (
                    <span className="text-2xs font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {r.impact}
                    </span>
                  )}
                  {r.href && (
                    <button
                      type="button"
                      onClick={() => router.push(r.href!)}
                      className="text-2xs font-medium text-primary-700 hover:text-primary-900 inline-flex items-center gap-1"
                    >
                      {r.actionLabel} <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
