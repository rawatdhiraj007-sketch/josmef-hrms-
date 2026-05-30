'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, FileWarning, RefreshCw, Download } from 'lucide-react';
import api from '@/lib/api';

import { Button, Badge, Card, Modal, Input, Select, Textarea, useToast } from '@/components/ui';
import {
  DataTable, DataToolbar, DataPagination, FilterSelect, BulkActionBar,
  PageHeader, Column,
} from '@/components/data';
import { downloadCsv } from '@/lib/csv-export';

const NTE_STATUSES = ['issued', 'acknowledged', 'explained', 'closed'];
const PAGE_SIZE_OPTIONS = [25, 50, 100];

const STATUS_VARIANT: Record<string, 'warning' | 'info' | 'brand' | 'success' | 'neutral'> = {
  issued:       'warning',
  acknowledged: 'info',
  explained:    'brand',
  closed:       'success',
};

export default function NtePage() {
  const toast = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(20);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employeeId: '', dateIssued: '', deadlineToReply: '',
    subject: '', description: '', issuedBy: '', remarks: '',
  });

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/nte?${params}`);
      setRecords(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load NTEs');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, pageSize]);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  async function openForm() {
    try {
      const r = await api.get('/employees?limit=200');
      setEmployees(r.data.data);
    } catch { /* */ }
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/nte', form);
      toast.success('NTE issued', 'Notice recorded successfully.');
      setShowForm(false);
      setForm({
        employeeId: '', dateIssued: '', deadlineToReply: '',
        subject: '', description: '', issuedBy: '', remarks: '',
      });
      fetchRecords(1);
    } catch (e: any) {
      toast.error('Failed to issue NTE', e?.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function fullName(r: any) {
    return `${r.employee?.firstName ?? ''} ${r.employee?.lastName ?? ''}`.trim();
  }

  function isOverdue(r: any) {
    return r.deadlineToReply && new Date(r.deadlineToReply) < new Date() && r.status === 'issued';
  }

  function handleExport() {
    const rows = selectedIds.length > 0 ? records.filter((r) => selectedIds.includes(r.id)) : records;
    downloadCsv(`nte-${new Date().toISOString().slice(0, 10)}`, [
      { header: 'NTE #',       accessor: (r: any) => r.nteNumber ?? '' },
      { header: 'Employee',    accessor: (r) => fullName(r) },
      { header: 'Employee ID', accessor: (r) => r.employee?.employeeId ?? '' },
      { header: 'Subject',     accessor: (r) => r.subject ?? '' },
      { header: 'Date Issued', accessor: (r) => r.dateIssued ? new Date(r.dateIssued).toISOString().slice(0, 10) : '' },
      { header: 'Deadline',    accessor: (r) => r.deadlineToReply ? new Date(r.deadlineToReply).toISOString().slice(0, 10) : '' },
      { header: 'Status',      accessor: (r) => r.status },
    ], rows);
    toast.success('Export ready', `${rows.length} NTEs downloaded.`);
  }

  const columns: Column<any>[] = [
    {
      key: 'nte',
      header: 'NTE #',
      sortAccessor: (r) => r.nteNumber ?? '',
      cell: (r) => <span className="font-mono text-xs text-primary-700 font-medium">{r.nteNumber || '—'}</span>,
    },
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
      key: 'subject',
      header: 'Subject',
      hideOnMobile: true,
      sortAccessor: (r) => r.subject ?? '',
      cell: (r) => <span className="text-surface-700 line-clamp-1 max-w-md block">{r.subject}</span>,
    },
    {
      key: 'issued',
      header: 'Date Issued',
      hideOnTablet: true,
      sortAccessor: (r) => r.dateIssued ?? '',
      cell: (r) => <span className="text-xs tabular-nums text-surface-600">{r.dateIssued ? new Date(r.dateIssued).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'deadline',
      header: 'Deadline',
      hideOnTablet: true,
      sortAccessor: (r) => r.deadlineToReply ?? '',
      cell: (r) => r.deadlineToReply ? (
        <span className={`text-xs tabular-nums ${isOverdue(r) ? 'text-rose-600 font-semibold' : 'text-surface-600'}`}>
          {new Date(r.deadlineToReply).toLocaleDateString()}
          {isOverdue(r) && <span className="ml-1 text-2xs">(overdue)</span>}
        </span>
      ) : <span className="text-surface-400">—</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortAccessor: (r) => r.status,
      cell: (r) => <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'} dot>{r.status}</Badge>,
    },
  ];

  const activeFilterCount = statusFilter ? 1 : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        icon={FileWarning}
        title="Notice to Explain (NTE)"
        subtitle="Issue and track notices to explain for employee offenses"
        actions={
          <>
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => fetchRecords(meta.page)} loading={loading}>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExport} disabled={records.length === 0}>
              Export
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openForm}>
              Issue NTE
            </Button>
          </>
        }
      />

      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employee or NTE number…"
        activeFilterCount={activeFilterCount}
        onClear={() => { setStatusFilter(''); setSearch(''); }}
      >
        <FilterSelect value={statusFilter} onChange={setStatusFilter} ariaLabel="Filter by status">
          <option value="">All Status</option>
          {NTE_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
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
        emptyIcon={FileWarning}
        emptyTitle="No NTE records"
        emptyDescription={search || statusFilter
          ? 'Try clearing your filters or search.'
          : 'When you issue your first Notice to Explain, it will appear here.'}
        emptyAction={!search && !statusFilter && (
          <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openForm}>Issue NTE</Button>
        )}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-surface-900 truncate">{fullName(r)}</div>
                <div className="text-xs text-surface-400 font-mono">{r.nteNumber || '—'}</div>
              </div>
              <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'} dot>{r.status}</Badge>
            </div>
            <div className="text-xs text-surface-600 line-clamp-1">{r.subject}</div>
            {r.deadlineToReply && (
              <div className={`text-2xs tabular-nums ${isOverdue(r) ? 'text-rose-600 font-semibold' : 'text-surface-500'}`}>
                Deadline: {new Date(r.deadlineToReply).toLocaleDateString()} {isOverdue(r) && '(overdue)'}
              </div>
            )}
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

      {/* Issue NTE Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Issue Notice to Explain"
        description="Formally request a written explanation for a workplace incident."
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
            <Input
              type="date" label="Date Issued" required
              value={form.dateIssued}
              onChange={(e) => setForm((f) => ({ ...f, dateIssued: e.target.value }))}
            />
            <Input
              type="date" label="Reply Deadline"
              value={form.deadlineToReply}
              onChange={(e) => setForm((f) => ({ ...f, deadlineToReply: e.target.value }))}
            />
          </div>

          <Input
            label="Subject" required
            placeholder="e.g., Unauthorized Absence, Violation of Company Policy"
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          />

          <Textarea
            label="Description" required rows={4}
            placeholder="Detailed description of the offense…"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />

          <Input
            label="Issued By" placeholder="Officer name"
            value={form.issuedBy}
            onChange={(e) => setForm((f) => ({ ...f, issuedBy: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={submitting}>
              {submitting ? 'Issuing…' : 'Issue NTE'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
