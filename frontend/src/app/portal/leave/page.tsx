'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Plane, X, CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface LeaveType { id: string; code: string; name: string }
interface Balance {
  leaveType: LeaveType;
  entitled: number;
  used: number;
  pending: number;
  remaining: number;
}
interface LeaveReq {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  leaveType: { code: string; name: string };
  approverRemarks?: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
  approved: { label: 'Approved', icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', icon: XCircle,      className: 'bg-red-50 text-red-700 border-red-200' },
  pending:  { label: 'Pending',  icon: Clock,         className: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const BALANCE_COLORS = [
  'bg-rose-500', 'bg-blue-500', 'bg-violet-500',
  'bg-emerald-500', 'bg-amber-500', 'bg-pink-500',
];

export default function PortalLeavePage() {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [requests, setRequests] = useState<LeaveReq[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [t, b, r] = await Promise.all([
        api.get('/leave/types'),
        api.get('/portal/leave/balances'),
        api.get('/portal/leave/requests'),
      ]);
      setTypes(t.data);
      setBalances(b.data);
      setRequests(r.data.rows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post('/portal/leave/requests', form);
      setShowForm(false);
      setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  const pendingCount  = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Plane className="w-6 h-6 text-rose-600" /> My Leaves
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{new Date().getFullYear()} leave summary</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Apply Leave'}
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">Pending</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          <div className="text-xs text-gray-500 mt-0.5">Approved</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{requests.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total Filed</div>
        </div>
      </div>

      {/* Balance cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Leave Balances</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {balances.map((b, i) => {
            const usedPct = b.entitled > 0 ? Math.round((b.used / b.entitled) * 100) : 0;
            const color   = BALANCE_COLORS[i % BALANCE_COLORS.length];
            return (
              <div key={b.leaveType.code} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{b.leaveType.code}</span>
                  {b.pending > 0 && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">{b.pending} pending</span>
                  )}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-gray-900">{b.remaining}</span>
                  <span className="text-gray-400 text-sm mb-1">/ {b.entitled} days</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">{b.leaveType.name}</div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${usedPct}%` }} />
                </div>
                <div className="text-[10px] text-gray-400 mt-1">{b.used} used · {usedPct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Apply leave form */}
      {showForm && (
        <div className="bg-white border-2 border-rose-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-rose-600" /> File Leave Request
          </h3>
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Leave Type</label>
              <select
                required
                value={form.leaveTypeId}
                onChange={e => setForm({ ...form, leaveTypeId: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
              >
                <option value="">Select leave type…</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date</label>
                <input
                  required
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date</label>
                <input
                  required
                  type="date"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Reason</label>
              <textarea
                required
                rows={3}
                placeholder="Briefly explain your reason for leave…"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* Request history */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Leave History</h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {requests.length === 0 ? (
            <div className="py-16 text-center">
              <Plane className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No leave requests yet</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-rose-600 font-medium hover:underline">
                File your first request →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map(r => {
                const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div key={r.id} className="p-4 flex items-start gap-4">
                    <div className="mt-0.5 shrink-0">
                      <StatusIcon className={`w-5 h-5 ${
                        r.status === 'approved' ? 'text-green-500' :
                        r.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{r.leaveType?.name}</span>
                        <span className="text-xs text-gray-400">{r.leaveType?.code}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(r.startDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' → '}
                        {new Date(r.endDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}
                        <span className="font-medium text-gray-700">{Number(r.totalDays)} day{Number(r.totalDays) !== 1 ? 's' : ''}</span>
                      </div>
                      {r.reason && <p className="text-sm text-gray-600 mt-1 line-clamp-1">{r.reason}</p>}
                      {r.approverRemarks && (
                        <p className="text-xs text-gray-500 mt-1 italic">HR note: {r.approverRemarks}</p>
                      )}
                    </div>
                    <span className={`shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
