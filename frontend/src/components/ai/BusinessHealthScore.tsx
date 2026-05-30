'use client';

import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAi } from '@/hooks/useAi';

const GRADE_COLOR: Record<string, string> = {
  'A+': 'text-emerald-500',
  'A':  'text-emerald-500',
  'B':  'text-blue-500',
  'C':  'text-amber-500',
  'D':  'text-rose-500',
};

/**
 * Composite Business Health Score — radial dial + grade + per-factor breakdown
 * with strengths and "needs attention" callouts.
 */
export default function BusinessHealthScore() {
  const { healthScore, loading } = useAi();

  if (loading || !healthScore) {
    return (
      <div className="py-10 text-center text-surface-400 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Computing score…
      </div>
    );
  }

  const { overall, grade, factors, strengths, needsAttention } = healthScore;
  const gradeColor = GRADE_COLOR[grade] ?? 'text-surface-500';

  return (
    <div className="space-y-5">
      {/* ── Radial score ── */}
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <RadialScore value={overall} />
        <div className="flex-1 text-center sm:text-left">
          <div className={`text-5xl font-bold tabular-nums ${gradeColor}`}>{grade}</div>
          <div className="text-sm text-surface-600 mt-1">
            <span className="font-semibold text-surface-900 tabular-nums">{overall}</span>/100 — {scoreLabel(overall)}
          </div>
          <p className="text-xs text-surface-500 mt-2 max-w-xs mx-auto sm:mx-0">
            Composite score across compliance, records, training, leave pipeline, and workforce stability.
          </p>
        </div>
      </div>

      {/* ── Per-factor breakdown ── */}
      <div className="space-y-2">
        {factors.map((f) => {
          const Icon = f.icon;
          const barColor =
            f.score >= 80 ? 'from-emerald-500 to-emerald-400' :
            f.score >= 60 ? 'from-amber-500 to-amber-400' :
            'from-rose-500 to-rose-400';
          return (
            <div key={f.key} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/10 text-primary-600 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1">
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-surface-900">{f.label}</span>
                    <span className="text-2xs text-surface-400 ml-1.5">· weight {Math.round(f.weight * 100)}%</span>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-surface-900">{f.score}</span>
                </div>
                <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${f.score}%` }}
                  />
                </div>
                <div className="text-2xs text-surface-500 mt-1">{f.context}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Strengths + attention ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-surface-100">
        <Callout
          title="Strengths"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          tone="positive"
          items={strengths.map((f) => f.label)}
        />
        <Callout
          title="Needs attention"
          icon={<TrendingDown className="w-3.5 h-3.5" />}
          tone="negative"
          items={needsAttention.map((f) => f.label)}
        />
      </div>
    </div>
  );
}

function RadialScore({ value }: { value: number }) {
  const radius = 50;
  const stroke = 8;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color =
    value >= 85 ? 'text-emerald-500' :
    value >= 70 ? 'text-blue-500' :
    value >= 55 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="relative w-32 h-32">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle cx="60" cy="60" r={radius} stroke="currentColor" strokeWidth={stroke}
          fill="none" className="text-surface-200" />
        {/* Progress */}
        <circle cx="60" cy="60" r={radius} stroke="currentColor" strokeWidth={stroke}
          strokeLinecap="round" fill="none"
          className={`${color} transition-all duration-700 ease-out`}
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-3xl font-bold text-surface-900 tabular-nums leading-none">{value}</span>
        <span className="text-2xs text-surface-500 mt-0.5 uppercase tracking-wider font-semibold">Health</span>
      </div>
    </div>
  );
}

function Callout({
  title, icon, tone, items,
}: {
  title: string;
  icon: React.ReactNode;
  tone: 'positive' | 'negative';
  items: string[];
}) {
  const cls = tone === 'positive'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : 'bg-rose-50 border-rose-200 text-rose-800';
  return (
    <div className={`px-3 py-2.5 rounded-xl border ${cls}`}>
      <div className="text-2xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
        {icon} {title}
      </div>
      <ul className="text-xs mt-1.5 space-y-0.5">
        {items.length === 0 ? <li className="text-surface-500">—</li> :
          items.map((i) => <li key={i}>· {i}</li>)
        }
      </ul>
    </div>
  );
}

function scoreLabel(n: number): string {
  if (n >= 85) return 'Excellent';
  if (n >= 70) return 'Good';
  if (n >= 55) return 'Fair';
  return 'Needs improvement';
}
