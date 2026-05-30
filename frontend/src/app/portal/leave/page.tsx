'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import {
  Plus, Plane, CalendarDays, Clock, CheckCircle2, XCircle, Info,
  Loader2, ChevronRight, Tag,
} from 'lucide-react';

import { Button, Badge, Card, Modal, Input, Select, Textarea, Tabs, useToast } from '@/components/ui';

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

const STATUS_VARIANT: Record<string, 'success' | 'danger' | 'warning' | 'neutral' | 'info'> = {
  approved:  'success',
  rejected:  'danger',
  pending:   'warning',
  cancelled: 'neutral',
  taken:     'info',
};

const STATUS_ICON: Record<string, any> = {
  approved: CheckCircle2,
  rejected: XCircle,
  pending:  Clock,
};

export default function PortalLeavePage() {
  const toast = useToast();
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [requests, setRequests] = useState<LeaveReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('all');

  // Form state
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

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
    } catch {
      toast.error('Failed to load leaves', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Days requested (live computation for form)
  const daysRequested = useMemo(() => {
    if (!form.startDate || !form.endDate) return 0;
    const s = new Date(form.startDate);
    const e = new Date(form.endDate);
    if (e < s) return 0;
    return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
  }, [form.startDate, form.endDate]);

  const selectedBalance = balances.find((b) => b.leaveType.id === form.leaveTypeId);
  const exceedsBalance = !!(selectedBalance && daysRequested > selectedBalance.remaining);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/portal/leave/requests', form);
      setShowForm(false);
      setForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      toast.success('Leave request submitted', 'You will be notified once HR responds.');
      await load();
    } catch (e: any) {
      toast.error('Submission failed', e?.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const pendingCount  = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const filteredRequests = tab === 'all'
    ? requests
    : requests.filter((r) => r.status === tab);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
              <Plane className="w-4 h-4 text-white" />
            </span>
            My Leaves
          </h1>
          <p className="text-sm text-surface-500 mt-1 ml-11">{new Date().getFullYear()} leave summary</p>
        </div>
        <Button
          variant="primary" size="md"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setShowForm(true)}
        >
          File Leave
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Pending"  value={pendingCount}  tone="warning" />
        <StatCard label="Approved" value={approvedCount} tone="success" />
        <StatCard label="Rejected" value={rejectedCount} tone="danger" />
      </div>

      {/* ── Balance cards ── */}
      <section>
        <h2 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3">
          Leave Balances
        </h2>
        {balances.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-sm text-surface-500">No leave balances assigned</div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {balances.map((b) => {
              const pct = b.entitled > 0
                ? Math.min(100, Math.round((Number(b.used) / Number(b.entitled)) * 100))
                : 0;
              return (
                <Card key={b.leaveType.code} padding="md" className="relative overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="brand" size="sm">{b.leaveType.code}</Badge>
                    {b.pending > 0 && (
                      <Badge variant="warning" size="sm">
                        {b.pending} pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-3xl font-bold text-surface-900 tabular-nums leading-none">{b.remaining}</span>
                    <span className="text-surface-400 text-xs">/ {b.entitled} days</span>
                  </div>
                  <p className="text-xs text-surface-500 mb-3 line-clamp-1">{b.leaveType.name}</p>
                  <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-2xs text-surface-400 tabular-nums">{b.used} used</span>
                    <span className="text-2xs font-medium text-surface-500 tabular-nums">{pct}%</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Request history with tabs ── */}
      <section>
        <h2 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3">
          Request History
        </h2>
        <Card padding="none">
          <div className="px-3 pt-3">
            <Tabs
              variant="pill"
              value={tab}
              onChange={setTab}
              tabs={[
                { value: 'all',      label: 'All',      count: requests.length },
                { value: 'pending',  label: 'Pending',  count: pendingCount },
                { value: 'approved', label: 'Approved', count: approvedCount },
                { value: 'rejected', label: 'Rejected', count: rejectedCount },
              ]}
            />
          </div>

          {filteredRequests.length === 0 ? (
            <div className="py-12 text-center">
              <Plane className="w-10 h-10 text-surface-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-surface-700">
                {tab === 'all' ? 'No leave requests yet' : `No ${tab} requests`}
              </p>
              {tab === 'all' && (
                <Button
                  variant="ghost" size="sm" className="mt-3"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setShowForm(true)}
                >
                  File your first request
                </Button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-surface-100">
              {filteredRequests.map((r) => {
                const Icon = STATUS_ICON[r.status] ?? Clock;
                return (
                  <li key={r.id} className="px-4 sm:px-5 py-3 flex items-start gap-3 hover:bg-surface-50/60 transition-colors">
                    <div className="mt-0.5 flex-shrink-0">
                      <Icon className={`
                        w-5 h-5
                        ${r.status === 'approved' ? 'text-emerald-500' :
                          r.status === 'rejected' ? 'text-rose-500' :
                          r.status === 'pending'  ? 'text-amber-500' : 'text-surface-400'}
                      `} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-surface-900">{r.leaveType?.name}</span>
                        <Badge variant="brand" size="sm">{r.leaveType?.code}</Badge>
                      </div>
                      <div className="text-xs text-surface-500 mt-0.5 tabular-nums flex items-center gap-1.5 flex-wrap">
                        <CalendarDays className="w-3 h-3" />
                        <span>
                          {new Date(r.startDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                          {' → '}
                          {new Date(r.endDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span aria-hidden className="text-surface-300">·</span>
                        <span className="font-medium text-surface-700">{Number(r.totalDays)} day{Number(r.totalDays) !== 1 ? 's' : ''}</span>
                      </div>
                      {r.reason && (
                        <p className="text-xs text-surface-600 mt-1.5 line-clamp-2 flex items-start gap-1.5">
                          <Tag className="w-3 h-3 mt-0.5 flex-shrink-0 text-surface-400" />
                          <span>{r.reason}</span>
                        </p>
                      )}
                      {r.approverRemarks && (
                        <p className="text-xs text-surface-500 mt-1 italic px-2 py-1 rounded bg-surface-50 border border-surface-100">
                          HR note: {r.approverRemarks}
                        </p>
                      )}
                    </div>
                    <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'} dot>
                      {r.status}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      {/* ── File Leave Modal ── */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="File Leave Request"
        description="Submit a new request for HR approval."
        size="md"
      >
        <form onSubmit={submit} className="space-y-4">
          <Select
            label="Leave Type" required
            value={form.leaveTypeId}
            onChange={(e) => setForm((f) => ({ ...f, leaveTypeId: e.target.value }))}
          >
            <option value="">Select leave type…</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.code} — {t.name}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date" label="Start Date" required
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
            <Input
              type="date" label="End Date" required
              min={form.startDate}
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </div>

          {daysRequested > 0 && selectedBalance && (
            <div className={`text-sm p-3 rounded-xl border flex items-start gap-2 ${
              exceedsBalance
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                Requesting <strong>{daysRequested} day{daysRequested > 1 ? 's' : ''}</strong>
                {' '}— Remaining: <strong className="tabular-nums">{selectedBalance.remaining}</strong>
                {exceedsBalance && ' — Exceeds balance.'}
              </div>
            </div>
          )}

          <Textarea
            label="Reason" required rows={3}
            placeholder="Briefly explain your reason for leave…"
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={submitting} disabled={exceedsBalance}>
              {submitting ? 'Submitting…' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── Stat Card ───
function StatCard({
  label, value, tone,
}: {
  label: string;
  value: number;
  tone: 'warning' | 'success' | 'danger';
}) {
  const COLOR: Record<typeof tone, string> = {
    warning: 'text-amber-600',
    success: 'text-emerald-600',
    danger:  'text-rose-600',
  };
  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-4 text-center shadow-card">
      <div className={`text-2xl font-bold tabular-nums ${COLOR[tone]}`}>{value}</div>
      <div className="text-2xs text-surface-500 mt-1 uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}
