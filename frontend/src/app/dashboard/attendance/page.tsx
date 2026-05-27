'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { AttendanceRecord, ListResponse } from '@/types/attendance';
import {
  Search, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle,
  Calendar, Filter,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
  half_day: 'bg-orange-100 text-orange-700',
  leave: 'bg-blue-100 text-blue-700',
  holiday: 'bg-purple-100 text-purple-700',
  rest_day: 'bg-gray-100 text-gray-500',
  overtime: 'bg-indigo-100 text-indigo-700',
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
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">{meta.total} records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field w-auto" />
            <span className="text-gray-400">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field w-auto" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-44">
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="half_day">Half Day</option>
            <option value="leave">Leave</option>
            <option value="overtime">Overtime</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Employee</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Time In</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Time Out</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Hours</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">OT</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Late</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Source</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400">No attendance records found</td></tr>
              ) : data.map((r) => (
                <tr key={r.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.employee?.lastName}, {r.employee?.firstName}</p>
                    <p className="text-xs text-gray-400 hidden sm:block">{r.employee?.department}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.date?.split('T')[0]}</td>
                  <td className="px-4 py-3 text-gray-700 font-mono text-xs">{r.timeIn || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 font-mono text-xs">{r.timeOut || '-'}</td>
                  <td className="px-4 py-3 text-gray-700 hidden md:table-cell">{Number(r.hoursWorked).toFixed(1)}h</td>
                  <td className="px-4 py-3 text-gray-700 hidden md:table-cell">{Number(r.overtimeHours) > 0 ? `${Number(r.overtimeHours).toFixed(1)}h` : '-'}</td>
                  <td className="px-4 py-3 text-gray-700 hidden lg:table-cell">{Number(r.lateMinutes) > 0 ? `${Number(r.lateMinutes).toFixed(0)}m` : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
            <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchData(meta.page - 1)} disabled={meta.page <= 1} className="p-2 rounded-lg border border-surface-200 hover:bg-surface-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => fetchData(meta.page + 1)} disabled={meta.page >= meta.totalPages} className="p-2 rounded-lg border border-surface-200 hover:bg-surface-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
