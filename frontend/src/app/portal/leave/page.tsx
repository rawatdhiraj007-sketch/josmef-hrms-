'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Plus, Plane } from 'lucide-react';

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

export default function PortalLeavePage() {
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [requests, setRequests] = useState<LeaveReq[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [t, b, r] = await Promise.all([
      api.get('/leave/types'),
      api.get('/portal/leave/balances'),
      api.get('/portal/leave/requests'),
    ]);
    setTypes(t.data);
    setBalances(b.data);
    setRequests(r.data.rows);
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
      setError(e?.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Plane className="w-6 h-6 text-rose-600" /> My Leaves</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {balances.map(b => (
          <div key={b.leaveType.code} className="bg-white border border-gray-200 rounded-xl p-3">
            <div className="text-xs text-gray-500">{b.leaveType.code}</div>
            <div className="text-xl font-bold">{b.remaining}<span className="text-sm text-gray-400 font-normal">/{b.entitled}</span></div>
          </div>
        ))}
      </div>

      {/* New form */}
      {showForm && (
        <form onSubmit={submit} className="bg-white border-2 border-rose-200 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold">File Leave Request</h3>
          {error && <div className="bg-red-50 text-red-700 text-sm p-2 rounded">{error}</div>}
          <select required value={form.leaveTypeId} onChange={e => setForm({ ...form, leaveTypeId: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Select leave type</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            <input required type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <textarea required rows={3} placeholder="Reason..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <button type="submit" disabled={submitting} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      )}

      {/* History */}
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No leave requests</div>
        ) : requests.map(r => (
          <div key={r.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{r.leaveType?.code} — {r.leaveType?.name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()} · {Number(r.totalDays)} day(s)
                </div>
                <div className="text-sm text-gray-700 mt-1">{r.reason}</div>
                {r.approverRemarks && <div className="text-xs text-gray-500 mt-1 italic">HR: {r.approverRemarks}</div>}
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                r.status === 'approved' ? 'bg-green-100 text-green-700' :
                r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100'
              }`}>{r.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
