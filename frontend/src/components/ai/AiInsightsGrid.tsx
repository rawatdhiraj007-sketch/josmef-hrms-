'use client';

import { Loader2 } from 'lucide-react';
import { useAi } from '@/hooks/useAi';
import AiInsightCard from './AiInsightCard';

interface AiInsightsGridProps {
  limit?: number;
}

/** Compact grid of AI insight cards. */
export default function AiInsightsGrid({ limit }: AiInsightsGridProps) {
  const { insights, loading } = useAi();

  if (loading) {
    return (
      <div className="py-10 text-center text-surface-400 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Computing insights…
      </div>
    );
  }

  const shown = limit ? insights.slice(0, limit) : insights;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {shown.map((i) => <AiInsightCard key={i.id} insight={i} />)}
    </div>
  );
}
