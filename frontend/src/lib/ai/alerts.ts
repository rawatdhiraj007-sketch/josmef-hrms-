'use client';

import type { AiData, AiAlert } from './types';
import {
  ShieldAlert, AlertTriangle, Plane, FileWarning, GraduationCap,
  UserMinus, FileText, Bell,
} from 'lucide-react';
import {
  expiringLicenses, expiredLicenses, pendingLeaveCount, incompleteProfiles,
  trainingCompletionRate, separatedThisMonth,
} from './data';

/**
 * Compute prioritized alerts from raw data.
 * Each alert says WHAT happened, WHY it matters, and WHAT to do.
 */
export function computeAlerts(data: AiData): AiAlert[] {
  const alerts: AiAlert[] = [];

  // ── CRITICAL: expired licenses ──
  const expired = expiredLicenses(data.licenses);
  if (expired.length > 0) {
    alerts.push({
      id: 'licenses-expired',
      priority: 'critical',
      icon: ShieldAlert,
      title: `${expired.length} professional license${expired.length === 1 ? '' : 's'} expired`,
      reason: 'Employees with expired licenses cannot legally perform regulated duties. This is a compliance and patient-safety risk.',
      action: 'Notify affected employees and HR to begin renewal immediately.',
      href: '/dashboard/licenses',
      count: expired.length,
    });
  }

  // ── HIGH: licenses expiring in 7 days ──
  const urgent = expiringLicenses(data.licenses, 7);
  if (urgent.length > 0) {
    alerts.push({
      id: 'licenses-urgent',
      priority: 'high',
      icon: AlertTriangle,
      title: `${urgent.length} license${urgent.length === 1 ? '' : 's'} expire within 7 days`,
      reason: 'PRC/government renewals can take weeks. Acting now prevents service disruption.',
      action: 'Send renewal reminders today.',
      href: '/dashboard/licenses',
      count: urgent.length,
    });
  }

  // ── HIGH: leave backlog ──
  const pending = pendingLeaveCount(data.leaveRequests);
  if (pending >= 10) {
    alerts.push({
      id: 'leave-backlog',
      priority: 'high',
      icon: Plane,
      title: `${pending} pending leave request${pending === 1 ? '' : 's'}`,
      reason: 'Long approval times reduce employee engagement and create staffing uncertainty.',
      action: 'Review and decide on requests now.',
      href: '/dashboard/leave',
      count: pending,
    });
  } else if (pending > 0) {
    alerts.push({
      id: 'leave-pending',
      priority: 'medium',
      icon: Plane,
      title: `${pending} pending leave request${pending === 1 ? '' : 's'}`,
      reason: 'Decisions help employees plan ahead.',
      action: 'Process before end of day.',
      href: '/dashboard/leave',
      count: pending,
    });
  }

  // ── MEDIUM: licenses expiring in 30 days ──
  const soon = expiringLicenses(data.licenses, 30);
  const onlySoon = soon.filter((l) => !urgent.includes(l));
  if (onlySoon.length > 0) {
    alerts.push({
      id: 'licenses-soon',
      priority: 'medium',
      icon: FileWarning,
      title: `${onlySoon.length} license${onlySoon.length === 1 ? '' : 's'} expire within 30 days`,
      reason: 'Early renewal avoids last-minute scrambling.',
      action: 'Schedule renewal reminders.',
      href: '/dashboard/licenses',
      count: onlySoon.length,
    });
  }

  // ── MEDIUM: training completion below 70% ──
  const completion = trainingCompletionRate(data.trainingEnrollments);
  if (data.trainingEnrollments.length > 5 && completion < 70) {
    const remaining = data.trainingEnrollments.filter((e) => e.status !== 'completed').length;
    alerts.push({
      id: 'training-completion',
      priority: 'medium',
      icon: GraduationCap,
      title: `Training completion is ${completion}%`,
      reason: `${remaining} enrollment${remaining === 1 ? '' : 's'} still incomplete. Low training rates affect performance and compliance.`,
      action: 'Send reminders or schedule a training session.',
      href: '/dashboard/training',
      count: remaining,
    });
  }

  // ── LOW: incomplete profiles ──
  const incomplete = incompleteProfiles(data.employees);
  if (incomplete.length > 0) {
    alerts.push({
      id: 'profiles-incomplete',
      priority: incomplete.length > 20 ? 'medium' : 'low',
      icon: FileText,
      title: `${incomplete.length} employee${incomplete.length === 1 ? '' : 's'} have incomplete profiles`,
      reason: 'Missing emails, mobile, SSS or PhilHealth numbers block payroll, payslips, and compliance reports.',
      action: 'Bulk-update from the Employees page or request employees self-update via the Portal.',
      href: '/dashboard/employees',
      count: incomplete.length,
    });
  }

  // ── INFO: separations this month ──
  const sepMonth = separatedThisMonth(data.employees);
  if (sepMonth.length > 0) {
    alerts.push({
      id: 'separations',
      priority: 'low',
      icon: UserMinus,
      title: `${sepMonth.length} employee${sepMonth.length === 1 ? '' : 's'} separated this month`,
      reason: 'Track exit-clearance completion and knowledge handover.',
      action: 'Review Former Employees and ensure final pay was processed.',
      href: '/dashboard/former-employees',
      count: sepMonth.length,
    });
  }

  // ── If no alerts at all ──
  if (alerts.length === 0) {
    alerts.push({
      id: 'all-clear',
      priority: 'low',
      icon: Bell,
      title: 'All clear — nothing needs attention',
      reason: 'No critical compliance issues, license expiries, or backlogged approvals.',
      action: 'Use this time to review the Business Health Score and recommendations.',
    });
  }

  return alerts;
}

export const PRIORITY_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};

export function sortAlertsByPriority(alerts: AiAlert[]): AiAlert[] {
  return [...alerts].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}
