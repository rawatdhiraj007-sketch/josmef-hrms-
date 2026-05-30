/**
 * NextNova AI — shared type definitions for the rule-based intelligence layer.
 * Everything below is client-side: no backend changes, advisory-only.
 */

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface AiInsight {
  id: string;
  /** Short metric name (e.g. "Attendance Rate") */
  metric: string;
  /** Headline value to display prominently */
  value: string;
  /** % change vs previous period, signed */
  delta?: number;
  /** Plain-English explanation (the "why") */
  explanation: string;
  /** Suggested next step the user can take */
  recommendation?: string;
  /** Optional click-through target */
  href?: string;
  /** Color tone */
  tone?: 'positive' | 'negative' | 'neutral' | 'info';
  /** lucide icon */
  icon?: any;
}

export interface AiAlert {
  id: string;
  priority: Priority;
  title: string;
  /** Why this matters (1-2 sentences) */
  reason: string;
  /** The action to take */
  action: string;
  /** Click destination (uses Next router) */
  href?: string;
  /** Optional count of affected entities */
  count?: number;
  /** lucide icon */
  icon: any;
}

export interface AiRecommendation {
  id: string;
  /** Recommendation headline */
  title: string;
  /** Why it's recommended */
  rationale: string;
  /** Suggested action label */
  actionLabel: string;
  /** Where to go to take the action */
  href?: string;
  /** Estimated impact (e.g. "Saves ~3 hours/week") */
  impact?: string;
  /** lucide icon */
  icon: any;
}

export interface HealthFactor {
  /** Stable key (e.g. "compliance") */
  key: string;
  /** Display name */
  label: string;
  /** 0-100 normalized score */
  score: number;
  /** Weight in the overall composition (0-1) */
  weight: number;
  /** Plain-English context for the score */
  context: string;
  /** lucide icon */
  icon: any;
}

export interface HealthScore {
  /** 0-100 overall */
  overall: number;
  /** Letter grade derived from overall */
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  /** Per-factor breakdown */
  factors: HealthFactor[];
  /** Strengths (top 2 factors) */
  strengths: HealthFactor[];
  /** Needs attention (bottom 2 factors) */
  needsAttention: HealthFactor[];
}

/** Raw aggregated data from existing APIs — drives the entire intelligence layer. */
export interface AiData {
  employees: any[];
  licenses: any[];
  leaveRequests: any[];
  leaveSummary: { total: number; pending: number; approved: number; rejected: number };
  trainings: any[];
  trainingEnrollments: any[];
  loadedAt: Date;
  /** Sources that failed to load (graceful degradation) */
  failed: string[];
}

export interface IntentMatch {
  /** Stable intent ID */
  id: string;
  /** Human-readable label of what we matched */
  label: string;
  /** Optional list rendered inline in the assistant */
  results?: Array<{ title: string; subtitle?: string; href?: string }>;
  /** Free-text response */
  response: string;
  /** Optional click-through target */
  href?: string;
}
