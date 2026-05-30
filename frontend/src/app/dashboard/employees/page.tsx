'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Employee, EmploymentStatus, EmployeeListResponse } from '@/types/employee';
import { Plus, Eye, Pencil, Trash2, Users } from 'lucide-react';
import PageHeader from '@/components/data/PageHeader';
import DataToolbar, { FilterSelect } from '@/components/data/DataToolbar';
import DataPagination from '@/components/data/DataPagination';
import DataEmpty from '@/components/data/DataEmpty';

const STATUS_BADGE: Record<string, string> = {
  probationary:    'badge-warning',
  regular:         'badge-success',
  resigned:        'badge-neutral',
  terminated:      'badge-danger',
  end_of_contract: 'badge-warning',
  awol:            'badge-danger',
  trainee:         'badge-info',
  applicant:       'badge-info',
};

export default function EmployeesPage() {
  const router = useRouter();
  const [data, setData] = useState<Employee[]>([]);
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
      if (statusFilter) params.employmentStatus = statusFilter;
      const res = await api.get<EmployeeListResponse>('/employees', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch { /* */ } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this employee record?')) return;
    try { await api.delete(`/employees/${id}`); fetchData(meta.page); } catch { alert('Failed'); }
  }

  const activeFilterCount = (search ? 1 : 0) + (statusFilter ? 1 : 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ── Page header ── */}
      <PageHeader
        icon={Users}
        title="Employees"
        subtitle={
          <span>
            <span className="font-semibold text-surface-700 tabular-nums">{meta.total.toLocaleString()}</span>
            {' '}total · across all employment statuses
          </span>
        }
        actions={
          <button onClick={() => router.push('/dashboard/employees/new')} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Employee
          </button>
        }
      />

      {/* ── Toolbar ── */}
      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, ID, email, position…"
        activeFilterCount={activeFilterCount}
        onClear={() => { setSearch(''); setStatusFilter(''); }}
        densityKey="nn:employees:density"
        onDensityChange={setDensity}
      >
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          ariaLabel="Filter by status"
        >
          <option value="">All statuses</option>
          {Object.values(EmploymentStatus).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </FilterSelect>
      </DataToolbar>

      {/* ── Table ── */}
      <div className="rounded-xl border border-surface-200 bg-white shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`table-modern ${density === 'compact' ? 'table-compact' : 'table-comfy'}`}>
            <thead>
              <tr>
                <th>Employee</th>
                <th className="hidden md:table-cell">Position</th>
                <th className="hidden lg:table-cell">Department</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-surface-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                      Loading employees…
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <DataEmpty
                      icon={Users}
                      title={activeFilterCount > 0 ? 'No employees match your filters' : 'No employees yet'}
                      description={activeFilterCount > 0 ? 'Try clearing filters or adjusting your search.' : 'Add your first employee to get started.'}
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
                            onClick={() => router.push('/dashboard/employees/new')}
                            className="btn-primary text-xs"
                          >
                            <Plus className="w-3 h-3" /> Add Employee
                          </button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                data.map((e) => (
                  <tr key={e.id} onClick={() => router.push(`/dashboard/employees/${e.id}`)} className="cursor-pointer">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-soft">
                          {e.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-surface-900 truncate">
                            {e.lastName}, {e.firstName}
                          </div>
                          <div className="text-xs text-surface-500 truncate font-mono">
                            {e.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell">{e.position || '—'}</td>
                    <td className="hidden lg:table-cell">{e.department || '—'}</td>
                    <td>
                      <span className={`${STATUS_BADGE[e.employmentStatus] || 'badge-neutral'} capitalize`}>
                        {e.employmentStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div
                        className="flex items-center justify-end gap-1 opacity-50 group-hover/row:opacity-100 transition-opacity"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <button
                          onClick={() => router.push(`/dashboard/employees/${e.id}`)}
                          className="w-7 h-7 rounded-md hover:bg-surface-100 text-surface-500 hover:text-primary-600 flex items-center justify-center transition-colors"
                          title="View"
                        ><Eye className="w-3.5 h-3.5" /></button>
                        <button
                          onClick={() => router.push(`/dashboard/employees/${e.id}/edit`)}
                          className="w-7 h-7 rounded-md hover:bg-surface-100 text-surface-500 hover:text-primary-600 flex items-center justify-center transition-colors"
                          title="Edit"
                        ><Pencil className="w-3.5 h-3.5" /></button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="w-7 h-7 rounded-md hover:bg-rose-50 text-surface-500 hover:text-rose-600 flex items-center justify-center transition-colors"
                          title="Delete"
                        ><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
