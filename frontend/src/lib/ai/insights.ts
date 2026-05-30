'use client';

import type { AiData, AiInsight } from './types';
import {
  Users, UserPlus, ShieldAlert, GraduationCap, Plane, AlertCircle,
} from 'lucide-react';
import {
  expiringLicenses, expiredLicenses, hiresThisMonth, separatedThisMonth,
  trainingCompletionRate, pendingLeaveCount, activeEmployees, incompleteProfiles,
} from './data';

/**
 * Compute the "smart insight" cards — each explains a key metric with
 * its number, plain-English context, and a recommendation.
 */
export function computeInsights(data: AiData): AiInsight[] {
  const insights: AiInsight[] = [];

  // ── Headcount ──
  const active = activeEmployees(data.employees);
  const newThisMonth = hiresThisMonth(data.employees).length;
  const leftThisMonth = separatedThisMonth(data.employees).length;
  const netDelta = newThisMonth - leftThisMonth;
  insights.push({
    id: 'headcount',
    metric: 'Active Headcount',
    value: String(active.length),
    delta: data.employees.length > 0 ? Math.round((netDelta / data.employees.length) * 100) : 0,
    icon: Users,
    explanation:
      newThisMonth === 0 && leftThisMonth === 0
        ? 'No movement this month.'
        : `${newThisMonth} hired and ${leftThisMonth} separated this month (net ${netDelta >= 0 ? '+' : ''}${netDelta}).`,
    recommendation:
      leftThisMonth > newThisMonth
        ? 'Net headcount is declining — review retention and recruitment funnel.'
        : newThisMonth > 0 ? 'Ensure new hires complete onboarding and 201 file.' : undefined,
    href: '/dashboard/employees',
    tone: netDelta < 0 ? 'negative' : netDelta > 0 ? 'positive' : 'neutral',
  });

  // ── License compliance ──
  const expiringSoon = expiringLicenses(data.licenses, 30);
  const expiringUrgent = expiringLicenses(data.licenses, 7);
  const expired = expiredLicenses(data.licenses);
  const complianceTotal = expired.length + expiringUrgent.length;
  insights.push({
    id: 'compliance',
    metric: 'License Compliance',
    value: `${expired.length + expiringSoon.length}`,
    icon: ShieldAlert,
    explanation:
      complianceTotal === 0
        ? 'All professional licenses are current — no expiries in the next 7 days.'
        : `${expired.length} expired and ${expiringUrgent.length} expire within 7 days. ${expiringSoon.length - expiringUrgent.length} more expire in the next 30 days.`,
    recommendation:
      complianceTotal > 0
        ? `Notify the ${complianceTotal} affected employees to renew immediately.`
        : 'Maintain proactive renewal reminders.',
    href: '/dashboard/licenses',
    tone: expired.length > 0 ? 'negative' : expiringUrgent.length > 0 ? 'negative' : 'positive',
  });

  // ── Training ──
  const completion = trainingCompletionRate(data.trainingEnrollments);
  insights.push({
    id: 'training',
    metric: 'Training Completion',
    value: `${completion}%`,
    icon: GraduationCap,
    explanation:
      data.trainingEnrollments.length === 0
        ? 'No enrollments recorded yet.'
        : `${data.trainingEnrollments.filter((e) => e.status === 'completed').length} of ${data.trainingEnrollments.length} enrollments completed.`,
    recommendation:
      completion < 70 && data.trainingEnrollments.length > 0
        ? 'Send reminders to enrollees who haven\'t started. Consider making key courses mandatory.'
        : data.trainingEnrollments.length === 0
        ? 'Set up baseline courses and enroll employees.'
        : 'Good — keep tracking certification renewals.',
    href: '/dashboard/training',
    tone: completion >= 80 ? 'positive' : completion >= 50 ? 'neutral' : 'negative',
  });

  // ── Leave pipeline ──
  const pending = pendingLeaveCount(data.leaveRequests);
  insights.push({
    id: 'leave',
    metric: 'Pending Leave Requests',
    value: String(pending),
    icon: Plane,
    explanation:
      pending === 0
        ? 'All leave requests are processed.'
        : `${pending} request${pending === 1 ? '' : 's'} awaiting approval. Average decision time improves engagement.`,
    recommendation:
      pending > 5
        ? 'Review and clear the backlog — bottlenecks erode trust.'
        : pending > 0 ? 'Process before end of day.' : undefined,
    href: '/dashboard/leave',
    tone: pending > 10 ? 'negative' : pending > 0 ? 'neutral' : 'positive',
  });

  // ── New hires (this year for context) ──
  const newHires = data.employees.filter((e) =>
    e?.dateHired && new Date(e.dateHired).getFullYear() === new Date().getFullYear(),
  );
  insights.push({
    id: 'newHires',
    metric: 'New Hires This Year',
    value: String(newHires.length),
    icon: UserPlus,
    explanation:
      newHires.length === 0
        ? 'No hires recorded this year yet.'
        : `${newHires.length} new employees joined in ${new Date().getFullYear()}.`,
    recommendation:
      newHires.length > 0
        ? 'Verify probationary periods, regularization dates, and training completion.'
        : undefined,
    href: '/dashboard/employees',
    tone: 'info',
  });

  // ── Profile completeness ──
  const incomplete = incompleteProfiles(data.employees);
  if (incomplete.length > 0) {
    insights.push({
      id: 'profiles',
      metric: 'Incomplete Profiles',
      value: String(incomplete.length),
      icon: AlertCircle,
      explanation: `${incomplete.length} employee${incomplete.length === 1 ? ' has' : 's have'} missing email, mobile, or government IDs.`,
      recommendation: 'Complete profiles to ensure accurate payroll and compliance reporting.',
      href: '/dashboard/employees',
      tone: 'negative',
    });
  }

  return insights;
}
