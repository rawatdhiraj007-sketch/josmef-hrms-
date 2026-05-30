'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { Clock, CalendarRange, Loader2, AlertTriangle } from 'lucide-react';

import { Badge, Card, useToast } from '@/components/ui';

interface Att {
  id: string;
  date: string;
  type: string;
  timeIn?: string;
  timeOut?: string;
  hoursWorked?: number;
  lateMinutes?: number;
  undertimeMinutes?: number;
  remarks?: string;
}

const TYPE_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  present: 'success',
  late:    'warning',
  absent:  'danger',
  leave:   'info',
  off:     'neutral',
};

export default function PortalAttendancePage() {
  const toast = useToast();
  const [rows, setRows] = useState<Att[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/portal/attendance', { params: { month } })
      .then((r) => setRows(r.data))
      .catch(() => toast.error('Failed to load attendance'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  // KPIs for the month
  const kpis = useMemo(() => {
    const total = rows.length;
    const present = rows.filter((r) => r.type === 'present').length;
    const late    = rows.filter((r) => r.type === 'late').length;
    const absent  = rows.filter((r) => r.type === 'absent').length;
    const hours   = rows.reduce((acc, r) => acc + Number(r.hoursWorked || 0), 0);
    const lateMin = rows.reduce((acc, r) => acc + Number(r.lateMinutes  || 0), 0);
    return { total, present, late, absent, hours, lateMin };
  }, [rows]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
              <Clock className="w-4 h-4 text-white" />
            </span>
            My Attendance
          </h1>
          <p className="text-sm text-surface-500 mt-1 ml-11">View your daily attendance log</p>
        </div>
        <label className="relative">
          <span className="sr-only">Month</span>
          <CalendarRange className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-white border border-surface-200 hover:border-surface-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
          />
        </label>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Present" value={kpis.present} unit={`of ${kpis.total}`} tone="success" />
        <Kpi label="Late"    value={kpis.late}    unit={kpis.lateMin > 0 ? `${kpis.lateMin}m total` : '—'} tone="warning" />
        <Kpi label="Absent"  value={kpis.absent}  unit={kpis.absent === 1 ? 'day' : 'days'} tone="danger" />
        <Kpi label="Hours"   value={Number(kpis.hours.toFixed(1))} unit="this month" tone="neutral" />
      </div>

      {/* Table — desktop */}
      <Card padding="none" className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50/70 border-b border-surface-200">
              <tr>
                <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">In</th>
                <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Out</th>
                <th className="text-right px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Hours</th>
                <th className="text-right px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Late</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center">
                  <span className="inline-flex items-center gap-2 text-surface-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                  </span>
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-surface-500">No records for {month}</td></tr>
              ) : rows.map((a) => (
                <tr key={a.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-50/60 transition-colors">
                  <td className="px-4 py-3 text-surface-900 tabular-nums">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={TYPE_VARIANT[a.type] ?? 'neutral'} dot>{a.type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-surface-700 tabular-nums">{a.timeIn || '—'}</td>
                  <td className="px-4 py-3 text-surface-700 tabular-nums">{a.timeOut || '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{Number(a.hoursWorked || 0).toFixed(1)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${a.lateMinutes ? 'text-amber-600' : 'text-surface-400'}`}>
                    {a.lateMinutes ? `${a.lateMinutes}m` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-surface-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-sm text-surface-500">No records for {month}</div>
          </Card>
        ) : (
          <ul className="space-y-2">
            {rows.map((a) => (
              <li key={a.id}>
                <Card padding="sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-surface-900 tabular-nums">{new Date(a.date).toLocaleDateString()}</p>
                      <p className="text-2xs text-surface-500 mt-0.5 tabular-nums">
                        {a.timeIn || '—'} → {a.timeOut || '—'}
                      </p>
                    </div>
                    <Badge variant={TYPE_VARIANT[a.type] ?? 'neutral'} dot>{a.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-100 text-xs">
                    <span className="text-surface-500">Hours <span className="font-semibold text-surface-900 tabular-nums">{Number(a.hoursWorked || 0).toFixed(1)}</span></span>
                    {a.lateMinutes ? (
                      <span className="text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="tabular-nums">{a.lateMinutes}m late</span>
                      </span>
                    ) : null}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Kpi({
  label, value, unit, tone,
}: {
  label: string;
  value: number;
  unit?: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const COLOR: Record<typeof tone, string> = {
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger:  'text-rose-600',
    neutral: 'text-surface-900',
  };
  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-card">
      <div className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold tabular-nums mt-1 ${COLOR[tone]}`}>{value}</div>
      {unit && <div className="text-2xs text-surface-400 mt-0.5">{unit}</div>}
    </div>
  );
}
