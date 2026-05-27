'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Archive, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const REASONS = ['resigned', 'terminated', 'end_of_contract', 'retired', 'awol', 'redundancy', 'retrenchment', 'death', 'other'];

const reasonColor = (r: string) => ({
  resigned: 'bg-yellow-100 text-yellow-700',
  terminated: 'bg-red-100 text-red-700',
  end_of_contract: 'bg-orange-100 text-orange-700',
  retired: 'bg-blue-100 text-blue-700',
  awol: 'bg-red-200 text-red-800',
  redundancy: 'bg-purple-100 text-purple-700',
  retrenchment: 'bg-purple-100 text-purple-700',
  death: 'bg-gray-200 text-gray-700',
  other: 'bg-gray-100 text-gray-600',
}[r] || 'bg-gray-100 text-gray-600');

export default function FormerEmployeesPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (reasonFilter) params.set('separationReason', reasonFilter);
      const res = await api.get(`/former-employees?${params}`);
      setRecords(res.data.data);
      setMeta(res.data.meta);
    } catch { } finally { setLoading(false); }
  }, [search, reasonFilter]);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Former Employees</h1>
          <p className="text-sm text-gray-500 mt-1">Archive of separated, resigned, and retired employees</p>
        </div>
        <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
          <span className="font-semibold">{meta.total}</span> total records
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, employee ID, or FMR number..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select value={reasonFilter} onChange={e => setReasonFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All Reasons</option>
          {REASONS.map(r => <option key={r} value={r} className="capitalize">{r.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">FMR #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">EMP ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Position</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date Hired</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date Separated</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Reason</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Final Pay</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-brand-700 font-medium">{r.formerEmployeeNumber || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.firstName} {r.lastName}</div>
                    <div className="text-xs text-gray-500">{r.department}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.employeeId}</td>
                  <td className="px-4 py-3 text-gray-700">{r.position}</td>
                  <td className="px-4 py-3 text-gray-600">{r.dateHired ? new Date(r.dateHired).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.dateSeparated ? new Date(r.dateSeparated).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${reasonColor(r.separationReason)}`}>
                      {r.separationReason?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">₱{Number(r.finalPay || 0).toLocaleString()}</div>
                    {r.finalPayReleased && <div className="text-xs text-green-600">Released</div>}
                  </td>
                  <td className="px-4 py-3">
                    {r.clearanceCompleted
                      ? <span className="text-xs text-green-600 font-medium">Completed</span>
                      : <span className="text-xs text-yellow-600 font-medium">Pending</span>
                    }
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={9} className="text-center py-12 text-gray-500">No former employee records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{meta.total} total records</span>
          <div className="flex gap-2">
            <button disabled={meta.page <= 1} onClick={() => fetchRecords(meta.page - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
            <span className="px-3 py-1">{meta.page} / {meta.totalPages}</span>
            <button disabled={meta.page >= meta.totalPages} onClick={() => fetchRecords(meta.page + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
