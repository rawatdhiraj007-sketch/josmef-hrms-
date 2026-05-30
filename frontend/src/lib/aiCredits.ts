/**
 * NextNova AI Credits — frontend-only usage counter.
 *
 * IMPORTANT: This is display-only. Real billing/quota enforcement must
 * be server-side. A user can reset their counter by clearing localStorage.
 *
 * Tracks total AI assistant queries this month. Resets automatically when
 * the month rolls over.
 */

import { loadPlan, getPlan } from './workspace';

const LS_KEY = 'nn:ai:usage';

interface UsageRecord {
  month: string; // YYYY-MM
  count: number;
}

function thisMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function read(): UsageRecord {
  if (typeof window === 'undefined') return { month: thisMonth(), count: 0 };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { month: thisMonth(), count: 0 };
    const parsed = JSON.parse(raw);
    if (parsed?.month !== thisMonth()) return { month: thisMonth(), count: 0 };
    return { month: parsed.month, count: Number(parsed.count) || 0 };
  } catch { return { month: thisMonth(), count: 0 }; }
}

function write(r: UsageRecord): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(r)); } catch { /* */ }
}

/** Increment the usage counter. Call once per AI assistant query. */
export function recordAiUse(): void {
  const r = read();
  write({ month: r.month, count: r.count + 1 });
  // Dispatch a synthetic event so listening components re-read
  try {
    window.dispatchEvent(new Event('nn:ai-usage'));
  } catch { /* */ }
}

/** Current usage + plan limit + percentage. */
export function getAiUsage(): { used: number; limit: number; percent: number; unlimited: boolean; month: string } {
  const r = read();
  const plan = getPlan(loadPlan());
  const unlimited = plan.aiCreditsPerMonth < 0;
  const limit = unlimited ? Infinity : plan.aiCreditsPerMonth;
  const percent = unlimited ? 0 : Math.min(100, Math.round((r.count / limit) * 100));
  return { used: r.count, limit, percent, unlimited, month: r.month };
}
