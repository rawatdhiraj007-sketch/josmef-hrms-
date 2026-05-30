'use client';

import {
  createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback,
} from 'react';
import {
  loadAiData, computeInsights, computeAlerts, sortAlertsByPriority,
  computeRecommendations, computeHealthScore,
  type AiData, type AiInsight, type AiAlert, type AiRecommendation, type HealthScore,
} from '@/lib/ai';

interface AiContextType {
  data: AiData | null;
  loading: boolean;
  /** Sources that failed to load this cycle */
  failed: string[];
  insights: AiInsight[];
  alerts: AiAlert[];
  recommendations: AiRecommendation[];
  healthScore: HealthScore | null;
  /** Manually trigger a re-fetch */
  refresh: () => Promise<void>;
  /** When was data last loaded */
  loadedAt: Date | null;
}

const AiContext = createContext<AiContextType | undefined>(undefined);

/**
 * Mount once at the top of the dashboard tree. Lazily loads aggregated AI
 * data and recomputes insights/alerts/recommendations/healthScore.
 *
 * NOT mounted in /portal — the AI layer is for HR/Ops/Admin users.
 */
export function AiProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AiData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const d = await loadAiData();
      setData(d);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Derive everything from the data snapshot ──
  const insights        = useMemo(() => data ? computeInsights(data)        : [], [data]);
  const alerts          = useMemo(() => data ? sortAlertsByPriority(computeAlerts(data)) : [], [data]);
  const recommendations = useMemo(() => data ? computeRecommendations(data) : [], [data]);
  const healthScore     = useMemo(() => data ? computeHealthScore(data)     : null, [data]);

  const value = useMemo<AiContextType>(() => ({
    data, loading,
    failed: data?.failed ?? [],
    insights, alerts, recommendations, healthScore,
    refresh,
    loadedAt: data?.loadedAt ?? null,
  }), [data, loading, insights, alerts, recommendations, healthScore, refresh]);

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>;
}

export function useAi(): AiContextType {
  const ctx = useContext(AiContext);
  if (!ctx) {
    // Safe fallback so components don't crash when used outside the provider
    return {
      data: null, loading: false, failed: [],
      insights: [], alerts: [], recommendations: [], healthScore: null,
      refresh: async () => {},
      loadedAt: null,
    };
  }
  return ctx;
}
