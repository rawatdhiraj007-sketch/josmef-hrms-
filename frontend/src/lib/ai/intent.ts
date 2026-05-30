'use client';

import type { AiData, IntentMatch } from './types';
import {
  expiringLicenses, expiredLicenses, hiresThisYear, hiresThisMonth,
  separatedThisMonth, pendingLeaveCount, activeEmployees, incompleteProfiles,
  trainingCompletionRate,
} from './data';

/**
 * Lightweight natural-language → action matcher.
 *
 * Rule-based. No LLM call. Matches common HR/Ops questions against the
 * already-loaded AiData and returns either a direct answer + filtered
 * list, or a redirect href to the right page.
 *
 * Easy to extend: add a new IntentRule to RULES with matchers + handler.
 */
interface IntentRule {
  id: string;
  /** Substrings/regexps that must all match (after lowercasing the query) */
  patterns: (string | RegExp)[];
  handler: (data: AiData, q: string) => IntentMatch;
}

const RULES: IntentRule[] = [
  // ── Absent today ──
  {
    id: 'absent-today',
    patterns: [/who.*absent.*today|absent today|absences today/i],
    handler: (_d) => ({
      id: 'absent-today',
      label: 'Absent today',
      response:
        'I can\'t see live attendance from this client view yet. Open the Attendance page to see today\'s log.',
      href: '/dashboard/attendance',
    }),
  },

  // ── Expiring licenses ──
  {
    id: 'expiring-licenses',
    patterns: [/expir.*licen|licen.*expir|license renewal/i],
    handler: (d) => {
      const ex = expiringLicenses(d.licenses, 30);
      const expired = expiredLicenses(d.licenses);
      const items = [...expired, ...ex].slice(0, 10).map((l) => ({
        title: `${l.licenseType || 'License'} · ${l.licenseNumber || '—'}`,
        subtitle: `${l.employee?.firstName || ''} ${l.employee?.lastName || ''} · expires ${l.expiryDate ? new Date(l.expiryDate).toLocaleDateString() : '—'}`,
        href: `/dashboard/licenses`,
      }));
      return {
        id: 'expiring-licenses',
        label: 'Expiring licenses',
        response: `${expired.length} expired · ${ex.length} expiring within 30 days. Showing top ${items.length}.`,
        results: items,
        href: '/dashboard/licenses',
      };
    },
  },

  // ── Hires this year ──
  {
    id: 'hires-this-year',
    patterns: [/hired this year|new hires.*year|joined this year/i],
    handler: (d) => {
      const list = hiresThisYear(d.employees);
      const items = list.slice(0, 10).map((e) => ({
        title: `${e.firstName} ${e.lastName}`,
        subtitle: `${e.position || ''} · hired ${e.dateHired?.split('T')[0] || ''}`,
        href: `/dashboard/employees/${e.id}`,
      }));
      return {
        id: 'hires-this-year',
        label: 'New hires this year',
        response: `${list.length} employee${list.length === 1 ? '' : 's'} hired in ${new Date().getFullYear()}. Showing top ${items.length}.`,
        results: items,
        href: '/dashboard/employees',
      };
    },
  },

  // ── Hires this month ──
  {
    id: 'hires-this-month',
    patterns: [/hired this month|new hires.*month|joined this month/i],
    handler: (d) => {
      const list = hiresThisMonth(d.employees);
      const items = list.slice(0, 10).map((e) => ({
        title: `${e.firstName} ${e.lastName}`,
        subtitle: `${e.position || ''} · hired ${e.dateHired?.split('T')[0] || ''}`,
        href: `/dashboard/employees/${e.id}`,
      }));
      return {
        id: 'hires-this-month',
        label: 'New hires this month',
        response: `${list.length} hired this month. Showing top ${items.length}.`,
        results: items,
        href: '/dashboard/employees',
      };
    },
  },

  // ── Pending leave ──
  {
    id: 'pending-leave',
    patterns: [/pending leave|leave.*pending|pending.*approv/i],
    handler: (d) => {
      const list = d.leaveRequests.filter((r) => r.status === 'pending');
      const items = list.slice(0, 10).map((r) => ({
        title: `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`,
        subtitle: `${r.leaveType?.code || ''} · ${Number(r.totalDays)} day(s) · ${new Date(r.startDate).toLocaleDateString()}`,
        href: '/dashboard/leave',
      }));
      return {
        id: 'pending-leave',
        label: 'Pending leave requests',
        response: `${list.length} request${list.length === 1 ? '' : 's'} awaiting approval.`,
        results: items,
        href: '/dashboard/leave',
      };
    },
  },

  // ── Headcount / total employees ──
  {
    id: 'headcount',
    patterns: [/total employees|how many employees|headcount|employee count/i],
    handler: (d) => {
      const active = activeEmployees(d.employees);
      return {
        id: 'headcount',
        label: 'Headcount',
        response: `You currently have ${active.length} active employees out of ${d.employees.length} on record.`,
        href: '/dashboard/employees',
      };
    },
  },

  // ── Training completion ──
  {
    id: 'training-completion',
    patterns: [/training completion|training rate|how.*training/i],
    handler: (d) => {
      const rate = trainingCompletionRate(d.trainingEnrollments);
      return {
        id: 'training-completion',
        label: 'Training completion',
        response: `Current training completion is ${rate}% across ${d.trainingEnrollments.length} enrollment${d.trainingEnrollments.length === 1 ? '' : 's'}.`,
        href: '/dashboard/training',
      };
    },
  },

  // ── Generate payroll/attendance/leave report ──
  {
    id: 'generate-report',
    patterns: [/generate.*report|create.*report|export.*report/i],
    handler: (_d, q) => {
      const which =
        /payroll/i.test(q) ? 'payroll' :
        /attendance/i.test(q) ? 'attendance' :
        /leave/i.test(q) ? 'leave' :
        /compliance|licen/i.test(q) ? 'licenses' : 'employees';
      return {
        id: 'generate-report',
        label: `Generate ${which} report`,
        response: `Opening the ${which} page so you can use the Export button (CSV / printable).`,
        href: `/dashboard/${which}`,
      };
    },
  },

  // ── Incomplete profiles ──
  {
    id: 'incomplete-profiles',
    patterns: [/incomplete profile|missing.*info|missing.*details/i],
    handler: (d) => {
      const list = incompleteProfiles(d.employees);
      const items = list.slice(0, 10).map((e) => ({
        title: `${e.firstName} ${e.lastName}`,
        subtitle: missingFields(e),
        href: `/dashboard/employees/${e.id}`,
      }));
      return {
        id: 'incomplete-profiles',
        label: 'Incomplete profiles',
        response: `${list.length} employee${list.length === 1 ? '' : 's'} have missing data.`,
        results: items,
        href: '/dashboard/employees',
      };
    },
  },

  // ── Resigned / separated ──
  {
    id: 'separated',
    patterns: [/resigned|separated|left.*compan|former employee/i],
    handler: (d) => {
      const list = separatedThisMonth(d.employees);
      const items = list.slice(0, 10).map((e) => ({
        title: `${e.firstName} ${e.lastName}`,
        subtitle: `${e.position || ''} · separated ${e.dateSeparated?.split('T')[0] || ''}`,
        href: `/dashboard/employees/${e.id}`,
      }));
      return {
        id: 'separated',
        label: 'Separations this month',
        response: `${list.length} employee${list.length === 1 ? '' : 's'} separated this month.`,
        results: items,
        href: '/dashboard/former-employees',
      };
    },
  },

  // ── Pending clearance ──
  {
    id: 'pending-clearance',
    patterns: [/pending clearance|exit clearance/i],
    handler: () => ({
      id: 'pending-clearance',
      label: 'Pending clearances',
      response: 'Opening the Exit Clearance page where you can filter by status.',
      href: '/dashboard/exit-clearance',
    }),
  },
];

function missingFields(e: any): string {
  const m: string[] = [];
  if (!e?.email)          m.push('email');
  if (!e?.mobile)         m.push('mobile');
  if (!e?.sssNumber)      m.push('SSS');
  if (!e?.philhealthNumber) m.push('PhilHealth');
  return m.length ? `Missing: ${m.join(', ')}` : '';
}

/**
 * Try to match the user's query to an intent.
 * Returns null if nothing matches — caller can show a fallback.
 */
export function matchIntent(query: string, data: AiData): IntentMatch | null {
  const q = query.trim();
  if (!q) return null;
  for (const rule of RULES) {
    const hit = rule.patterns.some((p) =>
      typeof p === 'string' ? q.toLowerCase().includes(p.toLowerCase()) : p.test(q),
    );
    if (hit) return rule.handler(data, q);
  }
  return null;
}

/** Suggested example queries for the assistant placeholder. */
export const SUGGESTED_QUERIES = [
  'Who is absent today?',
  'Show employees with expiring licenses',
  'Generate payroll report',
  'Hires this year',
  'Pending leave requests',
  'Incomplete profiles',
  'Training completion',
];
