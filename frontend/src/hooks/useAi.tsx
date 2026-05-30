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
 * Bulletproof: every compute fn is wrapped — if anything throws, we just
 * fall back to empty results so the rest of the dashboard keeps working.
 */
export function AiProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AiData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const d = await loadAiData();
      setData(d);
    } catch {
      // loadAiData should never throw (everything wrapped in safe), but
      // belt-and-suspenders: never crash the dashboard.
      setData({
        employees: [], licenses: [], leaveRequests: [],
        leaveSummary: { total: 0, pending: 0, approved: 0, rejected: 0 },
        trainings: [], trainingEnrollments: [],
        loadedAt: new Date(),
        failed: ['*'],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Every derived computation is fault-tolerant. If a rule somewhere
  // accesses an unexpected field shape we silently degrade rather than
  // crash the dashboard layout.
  const insights = useMemo<AiInsight[]>(() => {
    if (!data) return [];
    try { return computeInsights(data); } catch { return []; }
  }, [data]);

  const alerts = useMemo<AiAlert[]>(() => {
    if (!data) return [];
    try { return sortAlertsByPriority(computeAlerts(data)); } catch { return []; }
  }, [data]);

  const recommendations = useMemo<AiRecommendation[]>(() => {
    if (!data) return [];
    try { return computeRecommendations(data); } catch { return []; }
  }, [data]);

  const healthScore = useMemo<HealthScore | null>(() => {
    if (!data) return null;
    try { return computeHealthScore(data); } catch { return null; }
  }, [data]);

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
