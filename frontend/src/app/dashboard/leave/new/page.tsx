'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, Plane } from 'lucide-react';

interface Employee { id: string; firstName: string; lastName: string; employeeId: string }
interface LeaveType { id: string; code: string; name: string; annualEntitlement: number }
interface Balance {
  leaveType: LeaveType;
  entitled: number;
  used: number;
  pending: number;
  remaining: number;
}

export default function NewLeavePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [form, setForm] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/employees', { params: { limit: 500 } }).then(r => setEmployees(r.data.rows || r.data));
    api.get('/leave/types').then(r => setTypes(r.data));
  }, []);

  useEffect(() => {
    if (form.employeeId) {
      api.get(`/leave/balances/${form.employeeId}`).then(r => setBalances(r.data));
    } else {
      setBalances([]);
    }
  }, [form.employeeId]);

  const daysRequested = (() => {
    if (!form.startDate || !form.endDate) return 0;
    const s = new Date(form.startDate);
    const e = new Date(form.endDate);
    if (e < s) return 0;
    return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
  })();

  const selectedBalance = balances.find(b => b.leaveType.id === form.leaveTypeId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/leave/requests', form);
      router.push('/dashboard/leave');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/leave" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Leave Management
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Plane className="w-6 h-6 text-rose-600" /> File Leave Request
        </h1>
      </div>

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
          <select
            required
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} ({emp.employeeId})
              </option>
            ))}
          </select>
        </div>

        {balances.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-rose-900 uppercase mb-2">Available Balances ({new Date().getFullYear()})</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {balances.map(b => (
                <div key={b.leaveType.id} className="bg-white rounded-lg p-2 text-center">
                  <div className="text-xs text-gray-500">{b.leaveType.code}</div>
                  <div className="font-bold text-rose-700">{b.remaining}</div>
                  <div className="text-[10px] text-gray-400">of {b.entitled}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
          <select
            required
            value={form.leaveTypeId}
            onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select leave type</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>{t.code} — {t.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        {daysRequested > 0 && selectedBalance && (
          <div className={`text-sm p-3 rounded-lg ${daysRequested > selectedBalance.remaining ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            Requesting <strong>{daysRequested} day{daysRequested > 1 ? 's' : ''}</strong>
            {' '}— Remaining: <strong>{selectedBalance.remaining}</strong>
            {daysRequested > selectedBalance.remaining && ' ⚠️ Exceeds balance'}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
          <textarea
            required
            rows={4}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Describe the reason for this leave request..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          <Link href="/dashboard/leave" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
