'use client';

import type { AiData, HealthScore, HealthFactor } from './types';
import {
  ShieldCheck, GraduationCap, Users, Plane, FileText,
} from 'lucide-react';
import {
  expiringLicenses, expiredLicenses, trainingCompletionRate,
  pendingLeaveCount, incompleteProfiles, activeEmployees,
} from './data';

/**
 * Composite Business Health Score (0-100) and per-factor breakdown.
 * Weights tuned so compliance + records carry the most signal.
 */
export function computeHealthScore(data: AiData): HealthScore {
  const factors: HealthFactor[] = [];

  // ── Compliance (30%): inverse of expired + urgent license fraction ──
  const expired = expiredLicenses(data.licenses).length;
  const urgent  = expiringLicenses(data.licenses, 7).length;
  const totalLicenses = Math.max(1, data.licenses.length);
  const complianceScore = Math.round(
    Math.max(0, 100 - ((expired * 30) + (urgent * 10)) / totalLicenses * 100),
  );
  factors.push({
    key: 'compliance',
    label: 'License Compliance',
    weight: 0.30,
    score: clamp(complianceScore),
    icon: ShieldCheck,
    context:
      expired === 0 && urgent === 0
        ? `All ${data.licenses.length} license${data.licenses.length === 1 ? '' : 's'} current.`
        : `${expired} expired · ${urgent} expiring within 7d`,
  });

  // ── Records Completeness (20%): inverse of incomplete-profile ratio ──
  const incompleteCount = incompleteProfiles(data.employees).length;
  const recordsScore = data.employees.length === 0
    ? 100
    : Math.round(((data.employees.length - incompleteCount) / data.employees.length) * 100);
  factors.push({
    key: 'records',
    label: 'Employee Records',
    weight: 0.20,
    score: clamp(recordsScore),
    icon: FileText,
    context:
      data.employees.length === 0
        ? 'No employees yet.'
        : `${data.employees.length - incompleteCount}/${data.employees.length} profiles complete`,
  });

  // ── Training (20%): completion rate ──
  const trainingScore = trainingCompletionRate(data.trainingEnrollments);
  factors.push({
    key: 'training',
    label: 'Training Completion',
    weight: 0.20,
    score: clamp(trainingScore),
    icon: GraduationCap,
    context:
      data.trainingEnrollments.length === 0
        ? 'No enrollments tracked yet.'
        : `${trainingScore}% completed`,
  });

  // ── Leave processing (15%): inverse of pending ratio ──
  const pending = pendingLeaveCount(data.leaveRequests);
  const totalLeave = Math.max(1, data.leaveRequests.length);
  const leaveScore = Math.round(((totalLeave - pending) / totalLeave) * 100);
  factors.push({
    key: 'leave',
    label: 'Leave Pipeline',
    weight: 0.15,
    score: clamp(leaveScore),
    icon: Plane,
    context: pending === 0 ? 'No backlog.' : `${pending} pending`,
  });

  // ── Workforce stability (15%): active vs separated ratio ──
  const active = activeEmployees(data.employees).length;
  const totalEmp = Math.max(1, data.employees.length);
  const stabilityScore = Math.round((active / totalEmp) * 100);
  factors.push({
    key: 'stability',
    label: 'Workforce Stability',
    weight: 0.15,
    score: clamp(stabilityScore),
    icon: Users,
    context: `${active}/${data.employees.length} active`,
  });

  // ── Composite ──
  const overall = Math.round(
    factors.reduce((acc, f) => acc + (f.score * f.weight), 0),
  );

  const sorted = [...factors].sort((a, b) => b.score - a.score);
  const strengths       = sorted.slice(0, 2);
  const needsAttention  = sorted.slice(-2).reverse();

  return {
    overall: clamp(overall),
    grade: scoreToGrade(overall),
    factors,
    strengths,
    needsAttention,
  };
}

function clamp(n: number): number {
  if (!isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreToGrade(n: number): HealthScore['grade'] {
  if (n >= 95) return 'A+';
  if (n >= 85) return 'A';
  if (n >= 70) return 'B';
  if (n >= 55) return 'C';
  return 'D';
}
