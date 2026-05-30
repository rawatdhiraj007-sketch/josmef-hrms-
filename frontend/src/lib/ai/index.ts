/**
 * NextNova AI — public barrel.
 * Pure client-side, rule-based, advisory layer.
 *
 *   import { loadAiData, computeInsights, computeAlerts,
 *            computeRecommendations, computeHealthScore,
 *            matchIntent, SUGGESTED_QUERIES } from '@/lib/ai';
 */
export type * from './types';
export * from './data';
export { computeInsights } from './insights';
export { computeAlerts, sortAlertsByPriority, PRIORITY_ORDER } from './alerts';
export { computeRecommendations } from './recommendations';
export { computeHealthScore } from './healthScore';
export { matchIntent, SUGGESTED_QUERIES } from './intent';
