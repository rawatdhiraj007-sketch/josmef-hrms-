'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Gift, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface Item {
  id: string;
  employee: { firstName: string; lastName: string; employeeId: string };
  basis: number;
  amount: number;
  remarks?: string;
}
interface Run {
  id: string;
  runNumber: string;
  title: string;
  type: string;
  year: number;
  payoutDate: string;
  status: string;
  totalAmount: number;
  totalEmployees: number;
  notes?: string;
  items: Item[];
}

export default function BonusRunDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [run, setRun] = useState<Run | null>(null);
  const [editAmt, setEditAmt] = useState<Record<string, string>>({});

  async function load() {
    const r = await api.get(`/bonus/${id}`);
    setRun(r.data);
  }

  useEffect(() => { if (id) load(); }, [id]);

  async function saveAmount(itemId: string) {
    if (editAmt[itemId] === undefined) return;
    await api.patch(`/bonus/items/${itemId}`, { amount: Number(editAmt[itemId]) });
    setEditAmt(prev => { const c = { ...prev }; delete c[itemId]; return c; });
    await load();
  }

  async function release() {
    if (!confirm('Mark this bonus run as RELEASED? This locks all amounts.')) return;
    await api.patch(`/bonus/${id}/status`, { status: 'released' });
    await load();
  }

  async function cancel() {
    if (!confirm('Cancel this bonus run?')) return;
    await api.patch(`/bonus/${id}/status`, { status: 'cancelled' });
    await load();
  }

  if (!run) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const isDraft = run.status === 'draft';

  return (
    <div className="space-y-6">
      <Link href="/dashboard/bonus" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-rose-600" /> {run.title}
          </h1>
          <p className="text-gray-500 text-sm font-mono mt-1">{run.runNumber}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
          run.status === 'released' ? 'bg-green-100 text-green-700' :
          run.status === 'cancelled' ? 'bg-red-100 text-red-700' :
          run.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
        }`}>{run.status}</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Employees" value={String(run.totalEmployees)} />
        <SummaryCard label="Total Amount" value={`₱${Number(run.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
        <SummaryCard label="Payout Date" value={new Date(run.payoutDate).toLocaleDateString()} />
        <SummaryCard label="Year" value={String(run.year)} />
      </div>

      {isDraft && (
        <div className="flex gap-2">
          <button onClick={release} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Release Run
          </button>
          <button onClick={cancel} className="border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Cancel Run
          </button>
        </div>
      )}

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Employee</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Basis</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {run.items.map(item => (
              <tr key={item.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{item.employee.firstName} {item.employee.lastName}</div>
                  <div className="text-xs text-gray-500">{item.employee.employeeId}</div>
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  {Number(item.basis) > 0 ? `₱${Number(item.basis).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {isDraft ? (
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={Number(item.amount)}
                        onChange={e => setEditAmt(prev => ({ ...prev, [item.id]: e.target.value }))}
                        className="w-28 border border-gray-300 rounded px-2 py-1 text-right text-sm"
                      />
                      {editAmt[item.id] !== undefined && (
                        <button onClick={() => saveAmount(item.id)} className="text-rose-600 text-xs font-medium">Save</button>
                      )}
                    </div>
                  ) : (
                    <span className="font-semibold">₱{Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{item.remarks || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}
