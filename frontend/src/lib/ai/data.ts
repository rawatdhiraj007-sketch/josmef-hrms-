'use client';

import api from '@/lib/api';
import type { AiData } from './types';

/**
 * Fetch every data source the AI layer needs, in parallel.
 * Degrades gracefully — any failing source ends up empty + listed in `failed`.
 */
export async function loadAiData(): Promise<AiData> {
  const failed: string[] = [];

  // Generic safe-wrapper. Catches ALL throws — even those from the .then
  // callback (e.g. accessing a field on a 204 response body). Always returns
  // the fallback on any failure.
  async function safe<T>(name: string, p: Promise<T>, fallback: T): Promise<T> {
    try {
      const v = await p;
      return v;
    } catch {
      failed.push(name);
      return fallback;
    }
  }

  // Bulletproof array-extractor: regardless of what the API returns
  // ({ data: [...] }, { rows: [...] }, raw [...], '', null, undefined, etc.),
  // always hand back an actual array. Prevents .filter/.map/.reduce on
  // non-array values inside the AI compute functions.
  const toArray = (r: any): any[] => {
    const d = r?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.rows)) return d.rows;
    return [];
  };

  const toLeaveSummary = (r: any) => {
    const d = r?.data ?? {};
    return {
      total:    Number(d.total)    || 0,
      pending:  Number(d.pending)  || 0,
      approved: Number(d.approved) || 0,
      rejected: Number(d.rejected) || 0,
    };
  };

  const [
    employees, licenses, leaveRequests, leaveSummary, trainings, trainingEnrollments,
  ] = await Promise.all([
    safe('employees',           api.get('/employees', { params: { limit: 1000 } }).then(toArray), [] as any[]),
    safe('licenses',            api.get('/licenses',  { params: { limit: 500 } }).then(toArray),  [] as any[]),
    safe('leaveRequests',       api.get('/leave/requests', { params: { limit: 500 } }).then(toArray), [] as any[]),
    safe('leaveSummary',        api.get('/leave/summary').then(toLeaveSummary), { total: 0, pending: 0, approved: 0, rejected: 0 }),
    safe('trainings',           api.get('/training/courses').then(toArray), [] as any[]),
    safe('trainingEnrollments', api.get('/training/enrollments').then(toArray), [] as any[]),
  ]);

  return {
    // Hard guarantee: every field is the right type — even if upstream lied.
    employees:           Array.isArray(employees)           ? employees           : [],
    licenses:            Array.isArray(licenses)            ? licenses            : [],
    leaveRequests:       Array.isArray(leaveRequests)       ? leaveRequests       : [],
    leaveSummary,
    trainings:           Array.isArray(trainings)           ? trainings           : [],
    trainingEnrollments: Array.isArray(trainingEnrollments) ? trainingEnrollments : [],
    loadedAt: new Date(),
    failed,
  };
}

// ─── Derived metrics ──────────────────────────────────────

export function expiringLicenses(licenses: any[], days: number): any[] {
  const cutoff = Date.now() + days * 24 * 60 * 60 * 1000;
  return licenses.filter((l) => {
    if (!l?.expiryDate) return false;
    const e = new Date(l.expiryDate).getTime();
    return e <= cutoff && e >= Date.now();
  });
}

export function expiredLicenses(licenses: any[]): any[] {
  return licenses.filter((l) => l?.expiryDate && new Date(l.expiryDate).getTime() < Date.now());
}

export function hiresThisYear(employees: any[]): any[] {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
  return employees.filter((e) =>
    e?.dateHired && new Date(e.dateHired).getTime() >= startOfYear,
  );
}

export function hiresThisMonth(employees: any[]): any[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return employees.filter((e) =>
    e?.dateHired && new Date(e.dateHired).getTime() >= startOfMonth,
  );
}

export function separatedThisMonth(employees: any[]): any[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  return employees.filter((e) =>
    e?.dateSeparated && new Date(e.dateSeparated).getTime() >= startOfMonth,
  );
}

export function incompleteProfiles(employees: any[]): any[] {
  // Heuristic: missing email, mobile, SSS, or PhilHealth
  return employees.filter((e) =>
    !e?.email || !e?.mobile || !e?.sssNumber || !e?.philhealthNumber,
  );
}

export function trainingCompletionRate(enrollments: any[]): number {
  if (!enrollments.length) return 0;
  const completed = enrollments.filter((e) => e?.status === 'completed').length;
  return Math.round((completed / enrollments.length) * 100);
}

export function pendingLeaveCount(requests: any[]): number {
  return requests.filter((r) => r?.status === 'pending').length;
}

export function activeEmployees(employees: any[]): any[] {
  return employees.filter((e) =>
    e?.employmentStatus !== 'resigned' &&
    e?.employmentStatus !== 'terminated' &&
    e?.employmentStatus !== 'end_of_contract' &&
    !e?.dateSeparated,
  );
}
