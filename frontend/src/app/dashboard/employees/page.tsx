'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Employee, EmploymentStatus, EmployeeListResponse } from '@/types/employee';
import { Search, Plus, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, Users, Filter } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  probationary: 'badge-warning',
  regular: 'badge-success',
  resigned: 'badge-neutral',
  terminated: 'badge-danger',
  end_of_contract: 'badge-warning',
  awol: 'badge-danger',
  trainee: 'badge-info',
  applicant: 'badge-info',
};

export default function EmployeesPage() {
  const router = useRouter();
  const [data, setData] = useState<Employee[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.employmentStatus = statusFilter;
      const res = await api.get<EmployeeListResponse>('/employees', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch { /* */ } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this employee record?')) return;
    try { await api.delete(`/employees/${id}`); fetchData(meta.page); } catch { alert('Failed'); }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
            <Users className="w-6 h-6 text-primary-600" /> Employees
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            {meta.total.toLocaleString()} total · all employment statuses
          </p>
        </div>
        <button onClick={() => router.push('/dashboard/employees/new')} className="btn-primary w-fit">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 flex-1 min-w-64">
          <Search className="w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, email, position..."
            className="bg-transparent text-sm flex-1 outline-none placeholder:text-surface-400"
          />
        </div>
        <Filter className="w-4 h-4 text-surface-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="">All statuses</option>
          {Object.values(EmploymentStatus).map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
        {(search || statusFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); }}
            className="text-xs text-surface-500 hover:text-surface-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th className="hidden md:table-cell">Position</th>
                <th className="hidden lg:table-cell">Department</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-16 text-surface-400">Loading employees...</td></tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <Users className="w-10 h-10 text-surface-200 mx-auto mb-2" />
                    <p className="text-sm text-surface-500">No employees match your filters</p>
                  </td>
                </tr>
              ) : data.map((e) => (
                <tr key={e.id} className="group">
                  <td className="font-mono text-xs text-surface-500">{e.employeeId}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {e.firstName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-surface-900">{e.lastName}, {e.firstName}</div>
                        <div className="text-xs text-surface-500 md:hidden">{e.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell">{e.position}</td>
                  <td className="hidden lg:table-cell">{e.department}</td>
                  <td>
                    <span className={`${STATUS_BADGE[e.employmentStatus] || 'badge-neutral'} capitalize`}>
                      {e.employmentStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => router.push(`/dashboard/employees/${e.id}`)}
                        className="p-2 rounded-md hover:bg-surface-100 text-surface-500 hover:text-primary-600 transition-colors"
                        title="View"
                      ><Eye className="w-4 h-4" /></button>
                      <button
                        onClick={() => router.push(`/dashboard/employees/${e.id}/edit`)}
                        className="p-2 rounded-md hover:bg-surface-100 text-surface-500 hover:text-primary-600 transition-colors"
                        title="Edit"
                      ><Pencil className="w-4 h-4" /></button>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="p-2 rounded-md hover:bg-rose-50 text-surface-500 hover:text-rose-600 transition-colors"
                        title="Delete"
                      ><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 bg-surface-50/50">
            <p className="text-xs text-surface-500">
              Page <span className="font-semibold text-surface-700">{meta.page}</span> of {meta.totalPages}
              <span className="mx-2 text-surface-300">·</span>
              {meta.total} total
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => fetchData(meta.page - 1)}
                disabled={meta.page <= 1}
                className="p-1.5 rounded-md border border-surface-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              ><ChevronLeft className="w-4 h-4" /></button>
              <button
                onClick={() => fetchData(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="p-1.5 rounded-md border border-surface-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              ><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
