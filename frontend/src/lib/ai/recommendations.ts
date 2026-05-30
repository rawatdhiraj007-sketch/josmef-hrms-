'use client';

import type { AiData, AiRecommendation } from './types';
import {
  ShieldCheck, GraduationCap, FileText, Mail, Sparkles, Zap, CalendarCheck,
} from 'lucide-react';
import {
  expiringLicenses, trainingCompletionRate, incompleteProfiles,
  pendingLeaveCount, separatedThisMonth, hiresThisMonth,
} from './data';

/**
 * Continuously-computed recommendations the AI proactively surfaces.
 * Each suggests a concrete action with estimated impact.
 */
export function computeRecommendations(data: AiData): AiRecommendation[] {
  const recs: AiRecommendation[] = [];

  // ── License renewal proactive nudge ──
  const expiringSoon = expiringLicenses(data.licenses, 60);
  if (expiringSoon.length > 0) {
    recs.push({
      id: 'license-renewal-batch',
      icon: ShieldCheck,
      title: `Schedule renewal for ${expiringSoon.length} expiring license${expiringSoon.length === 1 ? '' : 's'}`,
      rationale: 'Renewing in batches lets you negotiate group rates and avoid last-minute work disruption.',
      actionLabel: 'View licenses',
      href: '/dashboard/licenses',
      impact: `Prevents ${expiringSoon.length} potential compliance gap${expiringSoon.length === 1 ? '' : 's'}`,
    });
  }

  // ── Mandatory training to those who need it ──
  const completion = trainingCompletionRate(data.trainingEnrollments);
  if (completion < 70 && data.trainingEnrollments.length > 0) {
    const incomplete = data.trainingEnrollments.filter((e) => e.status !== 'completed').length;
    recs.push({
      id: 'training-push',
      icon: GraduationCap,
      title: `Assign mandatory training to ${incomplete} employee${incomplete === 1 ? '' : 's'}`,
      rationale: `Training completion is only ${completion}%. Setting a deadline lifts compliance and reduces audit risk.`,
      actionLabel: 'Go to Training',
      href: '/dashboard/training',
      impact: `Could raise completion to ${Math.min(100, completion + 25)}%`,
    });
  }

  // ── Bulk profile cleanup ──
  const incompleteProf = incompleteProfiles(data.employees);
  if (incompleteProf.length >= 5) {
    recs.push({
      id: 'profile-cleanup',
      icon: FileText,
      title: `Complete profile data for ${incompleteProf.length} employee${incompleteProf.length === 1 ? '' : 's'}`,
      rationale: 'Missing emails block payslip delivery; missing SSS/PhilHealth numbers fail government remittances.',
      actionLabel: 'Open Employees',
      href: '/dashboard/employees',
      impact: 'Unblocks payroll + compliance reports',
    });
  }

  // ── Welcome new hires ──
  const newHires = hiresThisMonth(data.employees);
  if (newHires.length > 0) {
    recs.push({
      id: 'welcome-new-hires',
      icon: Mail,
      title: `Send onboarding kit to ${newHires.length} new hire${newHires.length === 1 ? '' : 's'}`,
      rationale: 'First-week experience correlates strongly with 90-day retention.',
      actionLabel: 'View new hires',
      href: '/dashboard/employees',
      impact: 'Improves onboarding satisfaction',
    });
  }

  // ── Clear leave backlog ──
  const pending = pendingLeaveCount(data.leaveRequests);
  if (pending >= 5) {
    recs.push({
      id: 'clear-leave-backlog',
      icon: CalendarCheck,
      title: `Process ${pending} pending leave request${pending === 1 ? '' : 's'}`,
      rationale: 'Same-day decisions improve engagement scores and reduce HR follow-up calls.',
      actionLabel: 'Open leave queue',
      href: '/dashboard/leave',
      impact: 'Saves ~30 min/week in follow-ups',
    });
  }

  // ── Exit clearance check ──
  const sep = separatedThisMonth(data.employees);
  if (sep.length > 0) {
    recs.push({
      id: 'exit-clearance',
      icon: Zap,
      title: `Verify exit clearance for ${sep.length} separated employee${sep.length === 1 ? '' : 's'}`,
      rationale: 'Incomplete clearances can leave equipment, access, and final-pay tasks unresolved.',
      actionLabel: 'Open Exit Clearance',
      href: '/dashboard/exit-clearance',
      impact: 'Prevents audit findings',
    });
  }

  // Fallback recommendation if no urgent ones
  if (recs.length === 0) {
    recs.push({
      id: 'health-check',
      icon: Sparkles,
      title: 'Schedule a quarterly business health review',
      rationale: 'Your operations look healthy. Quarterly check-ins surface trends before they become problems.',
      actionLabel: 'View health score',
      href: '/dashboard/ai',
      impact: 'Proactive insight',
    });
  }

  return recs;
}
