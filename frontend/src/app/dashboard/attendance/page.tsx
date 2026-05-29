'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { AttendanceRecord, ListResponse } from '@/types/attendance';
import {
  ChevronLeft, ChevronRight, Clock, Calendar, Filter,
} from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  present: 'badge-success',
  absent: 'badge-danger',
  late: 'badge-warning',
  half_day: 'badge-warning',
  leave: 'badge-info',
  holiday: 'badge-info',
  rest_day: 'badge-neutral',
  overtime: 'badge-info',
};

export default function AttendancePage() {
  const today = new Date().toISOString().split('T')[0];
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 50, dateFrom, dateTo };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get<ListResponse<AttendanceRecord>>('/attendance', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch { /* */ } finally { setLoading(false); }
  }, [dateFrom, dateTo, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
            <Clock className="w-6 h-6 text-primary-600" /> Attendance
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            {meta.total.toLocaleString()} records · {dateFrom === dateTo ? `today (${dateFrom})` : `${dateFrom} → ${dateTo}`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-surface-400" />
          <input
            type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white"
          />
          <span className="text-surface-400 text-sm">to</span>
          <input
            type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white"
          />
        </div>
        <Filter className="w-4 h-4 text-surface-400" />
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="">All statuses</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="half_day">Half Day</option>
          <option value="leave">Leave</option>
          <option value="overtime">Overtime</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th className="hidden md:table-cell">Hours</th>
                <th className="hidden md:table-cell">OT</th>
                <th className="hidden lg:table-cell">Late</th>
                <th>Status</th>
                <th className="hidden lg:table-cell">Source</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-16 text-surface-400">Loading attendance...</td></tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16">
                    <Clock className="w-10 h-10 text-surface-200 mx-auto mb-2" />
                    <p className="text-sm text-surface-500">No attendance records for this period</p>
                  </td>
                </tr>
              ) : data.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="font-medium text-surface-900">{r.employee?.lastName}, {r.employee?.firstName}</div>
                    <div className="text-xs text-surface-500 hidden sm:block">{r.employee?.department}</div>
                  </td>
                  <td>{r.date?.split('T')[0]}</td>
                  <td className="font-mono text-xs">{r.timeIn || '—'}</td>
                  <td className="font-mono text-xs">{r.timeOut || '—'}</td>
                  <td className="hidden md:table-cell tabular-nums">{Number(r.hoursWorked).toFixed(1)}h</td>
                  <td className="hidden md:table-cell tabular-nums">{Number(r.overtimeHours) > 0 ? `${Number(r.overtimeHours).toFixed(1)}h` : '—'}</td>
                  <td className="hidden lg:table-cell tabular-nums">
                    {Number(r.lateMinutes) > 0
                      ? <span className="text-amber-600">{Number(r.lateMinutes).toFixed(0)}m</span>
                      : '—'}
                  </td>
                  <td>
                    <span className={`${STATUS_BADGE[r.status] || 'badge-neutral'} capitalize`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell text-2xs uppercase tracking-wider text-surface-400">{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 bg-surface-50/50">
            <p className="text-xs text-surface-500">
              Page <span className="font-semibold text-surface-700">{meta.page}</span> of {meta.totalPages}
              <span className="mx-2 text-surface-300">·</span>
              {meta.total} total
            </p>
            <div className="flex gap-1">
              <button onClick={() => fetchData(meta.page - 1)} disabled={meta.page <= 1}
                className="p-1.5 rounded-md border border-surface-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => fetchData(meta.page + 1)} disabled={meta.page >= meta.totalPages}
                className="p-1.5 rounded-md border border-surface-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
