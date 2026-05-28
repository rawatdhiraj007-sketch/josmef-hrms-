'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Gift, Plus, Users } from 'lucide-react';

interface BonusRun {
  id: string;
  runNumber: string;
  title: string;
  type: string;
  year: number;
  payoutDate: string;
  status: string;
  totalAmount: string | number;
  totalEmployees: number;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  processing: 'bg-blue-100 text-blue-700',
  released: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const TYPE_LABELS: Record<string, string> = {
  '13th_month': '13th Month',
  performance: 'Performance Bonus',
  christmas: 'Christmas Bonus',
  commission: 'Commission',
  signing: 'Signing Bonus',
  retention: 'Retention Bonus',
  other: 'Other',
};

export default function BonusPage() {
  const [runs, setRuns] = useState<BonusRun[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get('/bonus');
      setRuns(r.data);
    } catch { setRuns([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-rose-600" /> Bonus Runs
          </h1>
          <p className="text-gray-500 text-sm mt-1">13th-month pay, performance bonuses, and one-time payouts</p>
        </div>
        <Link href="/dashboard/bonus/new" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Bonus Run
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Ref #</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Year</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Payout</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Employees</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="py-8 text-center text-gray-400">Loading...</td></tr>}
            {!loading && runs.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-gray-400">No bonus runs yet</td></tr>
            )}
            {runs.map(r => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{r.runNumber}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/bonus/${r.id}`} className="font-medium text-rose-600 hover:underline">{r.title}</Link>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    {TYPE_LABELS[r.type] || r.type}
                  </span>
                </td>
                <td className="px-4 py-3">{r.year}</td>
                <td className="px-4 py-3">{new Date(r.payoutDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-center flex items-center justify-center gap-1">
                  <Users className="w-3 h-3 text-gray-400" /> {r.totalEmployees}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₱{Number(r.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[r.status] || ''}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
