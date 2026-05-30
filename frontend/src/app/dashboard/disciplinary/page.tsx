'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Shield, RefreshCw, Download } from 'lucide-react';
import api from '@/lib/api';

import { Button, Badge, Card, Modal, Input, Select, Textarea, useToast } from '@/components/ui';
import {
  DataTable, DataToolbar, DataPagination, FilterSelect, BulkActionBar,
  PageHeader, Column,
} from '@/components/data';
import { downloadCsv } from '@/lib/csv-export';

const DISC_TYPES = ['verbal_warning', 'written_warning', 'suspension', 'demotion', 'termination'];
const DISC_STATUSES = ['open', 'resolved', 'appealed', 'dismissed'];
const PAGE_SIZE_OPTIONS = [25, 50, 100];

const typeLabel = (t: string) =>
  ({
    verbal_warning: 'Verbal Warning', written_warning: 'Written Warning',
    suspension: 'Suspension', demotion: 'Demotion', termination: 'Termination',
  } as Record<string, string>)[t] || t;

const TYPE_VARIANT: Record<string, 'warning' | 'danger' | 'neutral' | 'info'> = {
  verbal_warning:  'warning',
  written_warning: 'warning',
  suspension:      'danger',
  demotion:        'info',
  termination:     'danger',
};

const STATUS_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'neutral'> = {
  open:      'info',
  resolved:  'success',
  appealed:  'warning',
  dismissed: 'neutral',
};

export default function DisciplinaryPage() {
  const toast = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employeeId: '', type: 'written_warning', incidentDate: '', offense: '',
    description: '', actionTaken: '', suspensionDays: '', issuedBy: '', remarks: '',
  });

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/disciplinary?${params}`);
      setRecords(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load records');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, statusFilter, pageSize]);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  async function fetchEmployees() {
    try {
      const res = await api.get('/employees?limit=200');
      setEmployees(res.data.data);
    } catch { /* */ }
  }
  function openForm() { fetchEmployees(); setShowForm(true); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/disciplinary', {
        ...form,
        suspensionDays: form.suspensionDays ? Number(form.suspensionDays) : undefined,
      });
      toast.success('Record added', 'Disciplinary action recorded.');
      setShowForm(false);
      setForm({
        employeeId: '', type: 'written_warning', incidentDate: '', offense: '',
        description: '', actionTaken: '', suspensionDays: '', issuedBy: '', remarks: '',
      });
      fetchRecords(1);
    } catch (e: any) {
      toast.error('Failed to save', e?.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function fullName(r: any) {
    return `${r.employee?.firstName ?? ''} ${r.employee?.lastName ?? ''}`.trim();
  }

  function handleExport() {
    const rows = selectedIds.length > 0 ? records.filter((r) => selectedIds.includes(r.id)) : records;
    downloadCsv(`disciplinary-${new Date().toISOString().slice(0, 10)}`, [
      { header: 'Employee',     accessor: (r: any) => fullName(r) },
      { header: 'Employee ID',  accessor: (r) => r.employee?.employeeId ?? '' },
      { header: 'Type',         accessor: (r) => typeLabel(r.type) },
      { header: 'Offense',      accessor: (r) => r.offense ?? '' },
      { header: 'Incident Date', accessor: (r) => r.incidentDate ? new Date(r.incidentDate).toISOString().slice(0, 10) : '' },
      { header: 'Status',       accessor: (r) => r.status },
    ], rows);
    toast.success('Export ready', `${rows.length} records downloaded.`);
  }

  const columns: Column<any>[] = [
    {
      key: 'employee',
      header: 'Employee',
      sortAccessor: (r) => fullName(r),
      cell: (r) => (
        <div>
          <div className="font-medium text-surface-900">{fullName(r)}</div>
          <div className="text-xs text-surface-400">{r.employee?.employeeId}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortAccessor: (r) => r.type,
      cell: (r) => <Badge variant={TYPE_VARIANT[r.type] ?? 'neutral'} dot>{typeLabel(r.type)}</Badge>,
    },
    {
      key: 'offense',
      header: 'Offense',
      hideOnMobile: true,
      sortAccessor: (r) => r.offense ?? '',
      cell: (r) => <span className="text-surface-700 line-clamp-1 max-w-md block">{r.offense}</span>,
    },
    {
      key: 'date',
      header: 'Incident Date',
      hideOnTablet: true,
      sortAccessor: (r) => r.incidentDate ?? '',
      cell: (r) => <span className="text-xs tabular-nums text-surface-600">{r.incidentDate ? new Date(r.incidentDate).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortAccessor: (r) => r.status,
      cell: (r) => <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'} dot>{r.status}</Badge>,
    },
  ];

  const activeFilterCount = (typeFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Shield}
        title="Disciplinary Actions"
        subtitle="Track warnings, suspensions, and corrective actions"
        actions={
          <>
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => fetchRecords(meta.page)} loading={loading}>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExport} disabled={records.length === 0}>
              Export
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openForm}>
              Add Record
            </Button>
          </>
        }
      />

      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employee or offense…"
        activeFilterCount={activeFilterCount}
        onClear={() => { setTypeFilter(''); setStatusFilter(''); setSearch(''); }}
      >
        <FilterSelect value={typeFilter} onChange={setTypeFilter} ariaLabel="Filter by type">
          <option value="">All Types</option>
          {DISC_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
        </FilterSelect>
        <FilterSelect value={statusFilter} onChange={setStatusFilter} ariaLabel="Filter by status">
          <option value="">All Status</option>
          {DISC_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
        </FilterSelect>
      </DataToolbar>

      <BulkActionBar selectedCount={selectedIds.length} onClear={() => setSelectedIds([])}>
        <Button size="sm" variant="secondary" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExport}>
          Export selected
        </Button>
      </BulkActionBar>

      <DataTable<any>
        columns={columns}
        data={records}
        rowKey={(r) => r.id}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectedChange={setSelectedIds}
        emptyIcon={Shield}
        emptyTitle="No disciplinary records"
        emptyDescription={search || typeFilter || statusFilter
          ? 'Try clearing your filters or search.'
          : 'When you record warnings or actions, they will appear here.'}
        emptyAction={!search && !typeFilter && !statusFilter && (
          <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openForm}>Add Record</Button>
        )}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-surface-900 truncate">{fullName(r)}</div>
                <div className="text-xs text-surface-400 truncate">{r.offense}</div>
              </div>
              <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'} dot>{r.status}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={TYPE_VARIANT[r.type] ?? 'neutral'} size="sm">{typeLabel(r.type)}</Badge>
              {r.incidentDate && (
                <span className="text-xs text-surface-500 tabular-nums">{new Date(r.incidentDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        )}
      />

      {meta.totalPages > 1 && (
        <Card variant="ghost" padding="none">
          <DataPagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={pageSize}
            onPageChange={(p) => fetchRecords(p)}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={(s) => { setPageSize(s); }}
          />
        </Card>
      )}

      {/* Add Disciplinary Record Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Disciplinary Record"
        description="Record an offense and corresponding action."
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Employee" required
            value={form.employeeId}
            onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}
          >
            <option value="">Select Employee</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type" required
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              {DISC_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}
            </Select>
            <Input
              type="date" label="Incident Date" required
              value={form.incidentDate}
              onChange={(e) => setForm((f) => ({ ...f, incidentDate: e.target.value }))}
            />
          </div>

          <Input
            label="Offense" required placeholder="e.g., Tardiness, Insubordination"
            value={form.offense}
            onChange={(e) => setForm((f) => ({ ...f, offense: e.target.value }))}
          />

          <Textarea
            label="Description" required rows={3} placeholder="Detailed description of the incident…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          {form.type === 'suspension' && (
            <Input
              type="number" label="Suspension Days" placeholder="Number of days"
              value={form.suspensionDays}
              onChange={(e) => setForm((f) => ({ ...f, suspensionDays: e.target.value }))}
            />
          )}

          <Input
            label="Issued By" placeholder="Name of officer"
            value={form.issuedBy}
            onChange={(e) => setForm((f) => ({ ...f, issuedBy: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={submitting}>
              {submitting ? 'Saving…' : 'Save Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
