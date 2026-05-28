'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { History, Filter, ChevronLeft, ChevronRight, Eye, X } from 'lucide-react';

interface AuditRow {
  id: string;
  createdAt: string;
  userEmail: string;
  userRole: string;
  action: string;
  module: string;
  resourceId?: string;
  summary: string;
  method: string;
  path: string;
  ipAddress?: string;
  statusCode?: number;
  before?: any;
  after?: any;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 text-gray-700',
  EXPORT: 'bg-amber-100 text-amber-700',
  APPROVE: 'bg-emerald-100 text-emerald-700',
  REJECT: 'bg-rose-100 text-rose-700',
  SIGN: 'bg-indigo-100 text-indigo-700',
};

export default function AuditLogPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [selected, setSelected] = useState<AuditRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/audit', {
        params: { page, limit, action: actionFilter || undefined, module: moduleFilter || undefined },
      });
      setRows(res.data.rows);
      setTotal(res.data.total);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter, moduleFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="w-6 h-6 text-rose-600" />
            Audit Log
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Complete record of every change made in the system
          </p>
        </div>
        <span className="text-sm text-gray-500">
          {total.toLocaleString()} entries
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-gray-400" />
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
        >
          <option value="">All actions</option>
          {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', 'APPROVE', 'REJECT', 'SIGN'].map(a =>
            <option key={a} value={a}>{a}</option>
          )}
        </select>
        <select
          value={moduleFilter}
          onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
        >
          <option value="">All modules</option>
          {['auth', 'employees', 'applicants', 'trainees', 'payroll', 'attendance',
            'loans', 'disciplinary', 'nte', 'exit-clearance', 'leave', 'documents'].map(m =>
            <option key={m} value={m}>{m}</option>
          )}
        </select>
        {(actionFilter || moduleFilter) && (
          <button
            onClick={() => { setActionFilter(''); setModuleFilter(''); }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">When</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Who</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Module</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Summary</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No audit entries match filters</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{r.userEmail || '—'}</div>
                  <div className="text-xs text-gray-500">{r.userRole || ''}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[r.action] || 'bg-gray-100 text-gray-700'}`}>
                    {r.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{r.module}</td>
                <td className="px-4 py-3 text-gray-600 max-w-md truncate">{r.summary}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono ${
                    !r.statusCode ? 'text-gray-400' :
                    r.statusCode < 300 ? 'text-green-600' :
                    r.statusCode < 500 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {r.statusCode || '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelected(r)} className="text-rose-600 hover:text-rose-700">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded border border-gray-300 disabled:opacity-50"
            ><ChevronLeft className="w-4 h-4" /></button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded border border-gray-300 disabled:opacity-50"
            ><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold">Audit Entry</h2>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <Detail label="When" value={new Date(selected.createdAt).toLocaleString()} />
                <Detail label="Action" value={selected.action} />
                <Detail label="Module" value={selected.module} />
                <Detail label="Status" value={String(selected.statusCode || '—')} />
                <Detail label="User" value={selected.userEmail || '—'} />
                <Detail label="Role" value={selected.userRole || '—'} />
                <Detail label="Method" value={selected.method} />
                <Detail label="IP" value={selected.ipAddress || '—'} />
              </div>
              <Detail label="Path" value={selected.path} />
              <Detail label="Summary" value={selected.summary} />
              {selected.after && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Payload</div>
                  <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs overflow-x-auto">
                    {JSON.stringify(selected.after, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-gray-900 break-all">{value}</div>
    </div>
  );
}
