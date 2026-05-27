'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Trainee, TraineeStatusEnum, TraineeListResponse } from '@/types/trainee';
import { Search, Plus, ChevronLeft, ChevronRight, Eye, Pencil, Trash2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  ongoing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  dropped: 'bg-gray-100 text-gray-500',
  for_deployment: 'bg-amber-100 text-amber-700',
  deployed: 'bg-emerald-100 text-emerald-700',
};

export default function TraineesPage() {
  const router = useRouter();
  const [data, setData] = useState<Trainee[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get<TraineeListResponse>('/trainees', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch { /* */ } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this trainee record?')) return;
    try { await api.delete(`/trainees/${id}`); fetchData(meta.page); } catch { alert('Failed'); }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainees</h1>
          <p className="text-gray-500 text-sm mt-1">{meta.total} total trainees</p>
        </div>
        <button onClick={() => router.push('/dashboard/trainees/new')} className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-5 h-5" /> Add Trainee
        </button>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search trainees..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-48">
            <option value="">All Status</option>
            {Object.values(TraineeStatusEnum).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Position</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Program</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Start Date</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">No trainees found</td></tr>
              ) : data.map((t) => (
                <tr key={t.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.lastName}, {t.firstName}</td>
                  <td className="px-4 py-3 text-gray-700">{t.positionApplied}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{t.trainingProgram || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[t.status] || 'bg-gray-100 text-gray-600'}`}>
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{t.trainingStartDate?.split('T')[0]}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => router.push(`/dashboard/trainees/${t.id}`)} className="p-2 rounded-lg hover:bg-surface-100 text-gray-500 hover:text-brand-600" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => router.push(`/dashboard/trainees/${t.id}/edit`)} className="p-2 rounded-lg hover:bg-surface-100 text-gray-500 hover:text-brand-600" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
            <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchData(meta.page - 1)} disabled={meta.page <= 1} className="p-2 rounded-lg border border-surface-200 hover:bg-surface-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => fetchData(meta.page + 1)} disabled={meta.page >= meta.totalPages} className="p-2 rounded-lg border border-surface-200 hover:bg-surface-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
