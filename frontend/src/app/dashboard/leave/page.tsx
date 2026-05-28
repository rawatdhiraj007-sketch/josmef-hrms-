'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plane, Plus, Check, X, Clock, Filter } from 'lucide-react';

interface LeaveRequest {
  id: string;
  requestNumber: string;
  employee: { id: string; firstName: string; lastName: string; employeeId: string };
  leaveType: { code: string; name: string };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  approverRemarks?: string;
  approvedAt?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
  taken: 'bg-blue-100 text-blue-700',
};

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        api.get('/leave/requests', { params: { status: statusFilter || undefined, limit: 100 } }),
        api.get('/leave/summary'),
      ]);
      setRequests(r.data.rows);
      setSummary(s.data);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [statusFilter]); // eslint-disable-line

  async function decide(id: string, status: 'approved' | 'rejected') {
    setActing(id);
    try {
      const remarks = status === 'rejected'
        ? window.prompt('Reason for rejection:') || ''
        : window.prompt('Optional approval remarks:') || '';
      await api.patch(`/leave/requests/${id}`, { status, approverRemarks: remarks });
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed');
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Plane className="w-6 h-6 text-rose-600" />
            Leave Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track and approve employee leave requests</p>
        </div>
        <Link href="/dashboard/leave/new" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={summary.total} color="text-gray-900" />
        <StatCard label="Pending Approval" value={summary.pending} color="text-amber-600" />
        <StatCard label="Approved" value={summary.approved} color="text-green-600" />
        <StatCard label="Rejected" value={summary.rejected} color="text-red-600" />
      </div>

      {/* Filter */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Ref #</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Employee</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Dates</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Days</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Reason</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Loading...</td></tr>
            )}
            {!loading && requests.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">No leave requests yet</td></tr>
            )}
            {requests.map(r => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.requestNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{r.employee?.firstName} {r.employee?.lastName}</div>
                  <div className="text-xs text-gray-500">{r.employee?.employeeId}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    {r.leaveType?.code}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs">
                  <div>{new Date(r.startDate).toLocaleDateString()}</div>
                  <div>→ {new Date(r.endDate).toLocaleDateString()}</div>
                </td>
                <td className="px-4 py-3 font-semibold">{Number(r.totalDays)}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.reason}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.status === 'pending' && (
                    <div className="flex gap-1">
                      <button
                        disabled={acting === r.id}
                        onClick={() => decide(r.id, 'approved')}
                        className="p-1.5 rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                        title="Approve"
                      ><Check className="w-4 h-4" /></button>
                      <button
                        disabled={acting === r.id}
                        onClick={() => decide(r.id, 'rejected')}
                        className="p-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                        title="Reject"
                      ><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${color}`}>{value}</div>
    </div>
  );
}
