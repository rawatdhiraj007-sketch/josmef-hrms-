'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Applicant, ApplicantStatus, ApplicantListResponse } from '@/types/applicant';
import { Plus, Eye, Pencil, Trash2, UserPlus } from 'lucide-react';
import PageHeader from '@/components/data/PageHeader';
import DataToolbar, { FilterSelect } from '@/components/data/DataToolbar';
import DataPagination from '@/components/data/DataPagination';
import DataEmpty from '@/components/data/DataEmpty';

const STATUS_BADGE: Record<string, string> = {
  new:              'badge-info',
  screening:        'badge-warning',
  interview:        'badge-info',
  exam:             'badge-info',
  for_requirements: 'badge-warning',
  approved:         'badge-success',
  rejected:         'badge-danger',
  pooled:           'badge-neutral',
  withdrawn:        'badge-neutral',
};

export default function ApplicantsPage() {
  const router = useRouter();
  const [data, setData] = useState<Applicant[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [density, setDensity] = useState<'compact' | 'comfy'>('comfy');

  const fetchData = useCallback(async (page = 1, limit = meta.limit) => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get<ApplicantListResponse>('/applicants', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      console.error('Failed to fetch applicants', err);
    } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this applicant?')) return;
    try {
      await api.delete(`/applicants/${id}`);
      fetchData(meta.page);
    } catch { alert('Failed to delete applicant'); }
  }

  const activeFilterCount = (search ? 1 : 0) + (statusFilter ? 1 : 0);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        icon={UserPlus}
        title="Applicants"
        subtitle={
          <span>
            <span className="font-semibold text-surface-700 tabular-nums">{meta.total.toLocaleString()}</span>
            {' '}total · recruitment pipeline
          </span>
        }
        actions={
          <button onClick={() => router.push('/dashboard/applicants/new')} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Applicant
          </button>
        }
      />

      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, mobile, position…"
        activeFilterCount={activeFilterCount}
        onClear={() => { setSearch(''); setStatusFilter(''); }}
        densityKey="nn:applicants:density"
        onDensityChange={setDensity}
      >
        <FilterSelect value={statusFilter} onChange={setStatusFilter} ariaLabel="Filter by status">
          <option value="">All statuses</option>
          {Object.values(ApplicantStatus).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </FilterSelect>
      </DataToolbar>

      <div className="rounded-xl border border-surface-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`table-modern ${density === 'compact' ? 'table-compact' : 'table-comfy'}`}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th className="hidden md:table-cell">Contact</th>
                <th>Status</th>
                <th className="hidden lg:table-cell">Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-surface-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      Loading applicants…
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <DataEmpty
                      icon={UserPlus}
                      title={activeFilterCount > 0 ? 'No applicants match your filters' : 'No applicants yet'}
                      description={activeFilterCount > 0 ? 'Try clearing filters or adjusting your search.' : 'Add your first applicant or share the public application link.'}
                      action={
                        activeFilterCount > 0 ? (
                          <button
                            onClick={() => { setSearch(''); setStatusFilter(''); }}
                            className="btn-secondary text-xs"
                          >
                            Clear all filters
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push('/dashboard/applicants/new')}
                            className="btn-primary text-xs"
                          >
                            <Plus className="w-3 h-3" /> Add Applicant
                          </button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((a) => (
                  <tr key={a.id} onClick={() => router.push(`/dashboard/applicants/${a.id}`)} className="cursor-pointer group/row">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-soft">
                          {a.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-surface-900 truncate">
                            {a.lastName}, {a.firstName} {a.middleName?.[0] ? `${a.middleName[0]}.` : ''}
                          </div>
                          <div className="text-xs text-surface-500 truncate md:hidden">{a.positionApplied}</div>
                        </div>
                      </div>
                    </td>
                    <td>{a.positionApplied}</td>
                    <td className="hidden md:table-cell">
                      <div className="text-surface-700 truncate max-w-xs">{a.email}</div>
                      <div className="text-xs text-surface-400">{a.mobile}</div>
                    </td>
                    <td>
                      <span className={`${STATUS_BADGE[a.status] || 'badge-neutral'} capitalize`}>
                        {a.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell text-surface-500 tabular-nums">
                      {a.applicationDate ? new Date(a.applicationDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div
                        className="flex items-center justify-end gap-1 opacity-50 group-hover/row:opacity-100 transition-opacity"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <button onClick={() => router.push(`/dashboard/applicants/${a.id}`)}
                          className="w-7 h-7 rounded-md hover:bg-surface-100 text-surface-500 hover:text-primary-600 flex items-center justify-center transition-colors" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => router.push(`/dashboard/applicants/${a.id}/edit`)}
                          className="w-7 h-7 rounded-md hover:bg-surface-100 text-surface-500 hover:text-primary-600 flex items-center justify-center transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(a.id)}
                          className="w-7 h-7 rounded-md hover:bg-rose-50 text-surface-500 hover:text-rose-600 flex items-center justify-center transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DataPagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          pageSize={meta.limit}
          onPageChange={(p) => fetchData(p)}
          pageSizeOptions={[10, 20, 50, 100]}
          onPageSizeChange={(s) => { setMeta(m => ({ ...m, limit: s })); fetchData(1, s); }}
        />
      </div>
    </div>
  );
}
