'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ExitClearance, ClearanceStatusEnum } from '@/types/exit-clearance';
import { Search, Plus, ChevronLeft, ChevronRight, Eye, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  in_progress: AlertCircle,
  completed: CheckCircle,
};

export default function ExitClearancePage() {
  const router = useRouter();
  const [data, setData] = useState<ExitClearance[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await api.get('/exit-clearance', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch { /* */ } finally { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function getProgress(items: any[]): string {
    if (!items || items.length === 0) return '0/0';
    const cleared = items.filter((i: any) => i.isCleared).length;
    return `${cleared}/${items.length}`;
  }

  function getProgressPct(items: any[]): number {
    if (!items || items.length === 0) return 0;
    return Math.round((items.filter((i: any) => i.isCleared).length / items.length) * 100);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exit Clearance</h1>
          <p className="text-gray-500 text-sm mt-1">{meta.total} records</p>
        </div>
        <button onClick={() => router.push('/dashboard/exit-clearance/new')} className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-5 h-5" /> New Clearance
        </button>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search employee..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-48">
            <option value="">All Status</option>
            {Object.values(ClearanceStatusEnum).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="card p-12 text-center text-gray-400">Loading...</div>
        ) : data.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">No exit clearance records found</div>
        ) : data.map((ec) => {
          const pct = getProgressPct(ec.items);
          return (
            <div key={ec.id} className="card p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(`/dashboard/exit-clearance/${ec.id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{ec.employee?.lastName}, {ec.employee?.firstName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[ec.status]}`}>
                      {ec.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {ec.employee?.position} — {ec.employee?.department} • {ec.separationType.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Last working day: {ec.lastWorkingDay?.split('T')[0]}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-medium text-gray-700">{getProgress(ec.items)}</p>
                  <p className="text-xs text-gray-400">cleared</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-green-500' : 'bg-brand-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => fetchData(meta.page - 1)} disabled={meta.page <= 1} className="p-2 rounded-lg border border-surface-200 hover:bg-surface-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => fetchData(meta.page + 1)} disabled={meta.page >= meta.totalPages} className="p-2 rounded-lg border border-surface-200 hover:bg-surface-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
