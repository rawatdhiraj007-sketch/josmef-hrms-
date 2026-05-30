'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileCheck, Printer, RefreshCw, Loader2 } from 'lucide-react';
import api from '@/lib/api';

import { Button, Badge, Card, Modal, Input, Select, Textarea, useToast } from '@/components/ui';
import { PageHeader, FilterSelect, DataTable, type Column } from '@/components/data';

const CERT_TYPES = [
  { value: 'certificate_of_employment', label: 'Certificate of Employment' },
  { value: 'coe_with_compensation',     label: 'COE with Compensation' },
  { value: 'service_record',            label: 'Service Record' },
  { value: 'salary_certification',      label: 'Salary Certification' },
  { value: 'good_moral',                label: 'Good Moral Certificate' },
  { value: 'work_experience',           label: 'Work Experience Certificate' },
  { value: 'other',                     label: 'Other' },
];

const CERT_STATUSES = ['requested', 'processing', 'released', 'cancelled'];

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'success' | 'neutral'> = {
  requested:  'warning',
  processing: 'info',
  released:   'success',
  cancelled:  'neutral',
};

const certLabel = (v: string) => CERT_TYPES.find((t) => t.value === v)?.label || v;

export default function WorkCertificatesPage() {
  const router = useRouter();
  const toast = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employeeId: '', certificateType: 'certificate_of_employment',
    requestDate: new Date().toISOString().split('T')[0],
    purpose: '', addressedTo: '', remarks: '',
  });

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/work-certificates?${params}`);
      setRecords(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load certificates');
    } finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  async function openForm() {
    try {
      const r = await api.get('/employees?limit=200');
      setEmployees(r.data?.data ?? r.data ?? []);
    } catch { /* */ }
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/work-certificates', form);
      toast.success('Request submitted');
      setShowForm(false);
      setForm({
        employeeId: '', certificateType: 'certificate_of_employment',
        requestDate: new Date().toISOString().split('T')[0],
        purpose: '', addressedTo: '', remarks: '',
      });
      fetchRecords(1);
    } catch (e: any) {
      toast.error('Failed to submit', e?.response?.data?.message || 'Please try again.');
    } finally { setSubmitting(false); }
  }

  async function markReleased(id: string) {
    try {
      await api.put(`/work-certificates/${id}`, { status: 'released', releaseDate: new Date().toISOString().split('T')[0] });
      toast.success('Marked as released');
      fetchRecords(meta.page);
    } catch { toast.error('Failed to update'); }
  }

  async function markProcessing(id: string) {
    try {
      await api.put(`/work-certificates/${id}`, { status: 'processing' });
      toast.success('Moved to processing');
      fetchRecords(meta.page);
    } catch { toast.error('Failed to update'); }
  }

  const columns: Column<any>[] = [
    {
      key: 'cert',
      header: 'Cert #',
      sortAccessor: (r) => r.certificateNumber ?? '',
      cell: (r) => <span className="font-mono text-xs text-primary-700 font-medium">{r.certificateNumber || '—'}</span>,
    },
    {
      key: 'employee',
      header: 'Employee',
      sortAccessor: (r) => `${r.employee?.lastName ?? ''} ${r.employee?.firstName ?? ''}`,
      cell: (r) => (
        <div>
          <div className="font-medium text-surface-900">{r.employee?.firstName} {r.employee?.lastName}</div>
          <div className="text-2xs text-surface-400">{r.employee?.employeeId}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      hideOnMobile: true,
      sortAccessor: (r) => r.certificateType,
      cell: (r) => <span className="text-surface-700 text-xs">{certLabel(r.certificateType)}</span>,
    },
    {
      key: 'purpose',
      header: 'Purpose',
      hideOnTablet: true,
      cell: (r) => <span className="text-surface-600 text-xs line-clamp-1 max-w-xs block">{r.purpose || '—'}</span>,
    },
    {
      key: 'requested',
      header: 'Requested',
      hideOnMobile: true,
      sortAccessor: (r) => r.requestDate ?? '',
      cell: (r) => <span className="text-xs text-surface-600 tabular-nums">{r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortAccessor: (r) => r.status,
      cell: (r) => <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'} dot>{r.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      <PageHeader
        icon={FileCheck}
        title="Work Certificates"
        subtitle="Manage certificate requests (COE, service records, salary certifications)"
        actions={
          <>
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => fetchRecords(meta.page)} loading={loading}>
              Refresh
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openForm}>
              New Request
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-white border border-surface-200 shadow-card">
        <div className="flex items-center gap-2 bg-surface-50 hover:bg-white border border-transparent hover:border-surface-200 rounded-lg px-3 py-1.5 flex-1 min-w-64 focus-within:bg-white focus-within:border-primary-300 focus-within:shadow-soft transition-all">
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee or certificate number…"
            className="bg-transparent text-sm flex-1 outline-none placeholder:text-surface-400 min-w-0"
          />
        </div>
        <FilterSelect value={statusFilter} onChange={setStatusFilter} ariaLabel="Filter by status">
          <option value="">All Status</option>
          {CERT_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </FilterSelect>
      </div>

      <DataTable<any>
        columns={columns}
        data={records}
        rowKey={(r) => r.id}
        loading={loading}
        emptyIcon={FileCheck}
        emptyTitle="No certificate requests"
        emptyDescription={search || statusFilter ? 'Try clearing your filters.' : 'Create the first request to get started.'}
        emptyAction={!search && !statusFilter && (
          <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openForm}>New Request</Button>
        )}
        rowActions={(r) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/work-certificates/${r.id}/print`); }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              title="Print / Preview"
              aria-label="Print certificate"
            >
              <Printer className="w-4 h-4" />
            </button>
            {r.status === 'requested' && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); markProcessing(r.id); }}
                className="text-2xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-medium hover:bg-blue-100"
              >
                Process
              </button>
            )}
            {r.status === 'processing' && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); markReleased(r.id); }}
                className="text-2xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-medium hover:bg-emerald-100"
              >
                Release
              </button>
            )}
          </div>
        )}
        onRowClick={(r) => router.push(`/dashboard/work-certificates/${r.id}/print`)}
      />

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Certificate Request"
        description="Auto-fills employee data into the printable template."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Employee" required value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}>
            <option value="">Select Employee</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
          </Select>
          <Select label="Certificate Type" required value={form.certificateType} onChange={(e) => setForm((f) => ({ ...f, certificateType: e.target.value }))}>
            {CERT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
          <Input type="date" label="Date Requested" required value={form.requestDate} onChange={(e) => setForm((f) => ({ ...f, requestDate: e.target.value }))} />
          <Input label="Addressed To" placeholder="e.g., To Whom It May Concern, Embassy of…" value={form.addressedTo} onChange={(e) => setForm((f) => ({ ...f, addressedTo: e.target.value }))} />
          <Textarea label="Purpose" rows={3} placeholder="e.g., For visa application, bank loan, etc." value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={submitting}>{submitting ? 'Saving…' : 'Submit Request'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
