'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Gift, ArrowLeft, Info } from 'lucide-react';

export default function NewBonusRunPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    type: '13th_month',
    year: new Date().getFullYear(),
    payoutDate: '',
    amountPerEmployee: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload: any = {
        title: form.title,
        type: form.type,
        year: Number(form.year),
        payoutDate: form.payoutDate,
        notes: form.notes,
      };
      if (form.type !== '13th_month' && form.amountPerEmployee) {
        payload.amountPerEmployee = Number(form.amountPerEmployee);
      }
      const r = await api.post('/bonus', payload);
      router.push(`/dashboard/bonus/${r.data.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/bonus" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="text-2xl font-bold flex items-center gap-2"><Gift className="w-6 h-6 text-rose-600" /> New Bonus Run</h1>

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            required
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. 13th Month Pay 2025"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type *</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="13th_month">13th Month Pay (auto-computed)</option>
              <option value="performance">Performance Bonus</option>
              <option value="christmas">Christmas Bonus</option>
              <option value="commission">Commission</option>
              <option value="signing">Signing Bonus</option>
              <option value="retention">Retention Bonus</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year *</label>
            <input
              required
              type="number"
              value={form.year}
              onChange={e => setForm({ ...form, year: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payout Date *</label>
          <input
            required
            type="date"
            value={form.payoutDate}
            onChange={e => setForm({ ...form, payoutDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {form.type === '13th_month' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              13th month pay will be auto-computed per employee as
              <strong> (total basic pay paid in {form.year}) ÷ 12</strong> — per PH Presidential Decree 851.
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">Amount per Employee (₱)</label>
            <input
              type="number"
              step="0.01"
              value={form.amountPerEmployee}
              onChange={e => setForm({ ...form, amountPerEmployee: e.target.value })}
              placeholder="Leave blank to set per-employee later"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          <Link href="/dashboard/bonus" className="px-4 py-2 text-sm text-gray-600">Cancel</Link>
          <button
            type="submit"
            disabled={submitting}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Draft'}
          </button>
        </div>
      </form>
    </div>
  );
}
