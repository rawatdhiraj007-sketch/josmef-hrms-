'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, DollarSign, RefreshCw, Download } from 'lucide-react';
import api from '@/lib/api';

import { Button, Badge, Card, Modal, Input, Select, Textarea, useToast } from '@/components/ui';
import {
  DataTable, DataToolbar, DataPagination, FilterSelect, BulkActionBar,
  PageHeader, Column,
} from '@/components/data';
import { downloadCsv } from '@/lib/csv-export';

const LOAN_TYPES = ['sss', 'pagibig', 'company', 'cash_advance', 'other'];
const LOAN_STATUSES = ['active', 'fully_paid', 'cancelled', 'defaulted'];
const PAGE_SIZE_OPTIONS = [25, 50, 100];

const LOAN_STATUS_VARIANT: Record<string, 'success' | 'info' | 'neutral' | 'danger'> = {
  active:     'success',
  fully_paid: 'info',
  cancelled:  'neutral',
  defaulted:  'danger',
};

const formatType = (t: string) =>
  ({ sss: 'SSS Loan', pagibig: 'Pag-IBIG Loan', company: 'Company Loan', cash_advance: 'Cash Advance', other: 'Other' } as Record<string, string>)[t] || t;
const formatCurrency = (v: number) => `₱${Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function LoansPage() {
  const toast = useToast();

  const [loans, setLoans] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pageSize, setPageSize] = useState(20);

  // Bulk
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Add Loan modal
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employeeId: '', loanType: 'company', principalAmount: '', monthlyAmortization: '',
    loanDate: '', firstPaymentDate: '', termMonths: '', interestRate: '', purpose: '',
    loanReference: '', remarks: '',
  });

  const fetchLoans = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('loanType', typeFilter);
      const res = await api.get(`/loans?${params}`);
      setLoans(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
    // toast intentionally omitted — context value is stable; including it
    // would create a re-fetch loop on any provider re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, typeFilter, pageSize]);

  useEffect(() => { fetchLoans(1); }, [fetchLoans]);

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
      await api.post('/loans', {
        ...form,
        principalAmount: Number(form.principalAmount),
        monthlyAmortization: form.monthlyAmortization ? Number(form.monthlyAmortization) : undefined,
        termMonths: form.termMonths ? Number(form.termMonths) : undefined,
        interestRate: form.interestRate ? Number(form.interestRate) : undefined,
      });
      toast.success('Loan added', 'Record saved successfully.');
      setShowForm(false);
      setForm({
        employeeId: '', loanType: 'company', principalAmount: '', monthlyAmortization: '',
        loanDate: '', firstPaymentDate: '', termMonths: '', interestRate: '', purpose: '',
        loanReference: '', remarks: '',
      });
      fetchLoans(1);
    } catch (e: any) {
      toast.error('Failed to save', e?.response?.data?.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function fullName(l: any) {
    return `${l.employee?.firstName ?? ''} ${l.employee?.lastName ?? ''}`.trim();
  }

  function handleExport() {
    const rows = selectedIds.length > 0 ? loans.filter((l) => selectedIds.includes(l.id)) : loans;
    downloadCsv(`loans-${new Date().toISOString().slice(0, 10)}`, [
      { header: 'Employee',    accessor: (l: any) => fullName(l) },
      { header: 'Employee ID', accessor: (l) => l.employee?.employeeId ?? '' },
      { header: 'Loan Type',   accessor: (l) => formatType(l.loanType) },
      { header: 'Reference',   accessor: (l) => l.loanReference ?? '' },
      { header: 'Principal',   accessor: (l) => Number(l.principalAmount).toFixed(2) },
      { header: 'Outstanding', accessor: (l) => Number(l.outstandingBalance).toFixed(2) },
      { header: 'Monthly',     accessor: (l) => Number(l.monthlyAmortization).toFixed(2) },
      { header: 'Loan Date',   accessor: (l) => l.loanDate ? new Date(l.loanDate).toISOString().slice(0, 10) : '' },
      { header: 'Status',      accessor: (l) => l.status },
    ], rows);
    toast.success('Export ready', `${rows.length} loans downloaded.`);
  }

  const columns: Column<any>[] = [
    {
      key: 'employee',
      header: 'Employee',
      sortAccessor: (l) => fullName(l),
      cell: (l) => (
        <div>
          <div className="font-medium text-surface-900">{fullName(l)}</div>
          <div className="text-xs text-surface-400">{l.employee?.employeeId}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Loan Type',
      hideOnMobile: true,
      sortAccessor: (l) => l.loanType,
      cell: (l) => (
        <div>
          <div className="text-surface-700">{formatType(l.loanType)}</div>
          {l.loanReference && <div className="text-xs text-surface-400">{l.loanReference}</div>}
        </div>
      ),
    },
    {
      key: 'principal',
      header: 'Principal',
      align: 'right',
      hideOnMobile: true,
      sortAccessor: (l) => Number(l.principalAmount),
      cell: (l) => <span className="tabular-nums font-medium text-surface-900">{formatCurrency(l.principalAmount)}</span>,
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      align: 'right',
      sortAccessor: (l) => Number(l.outstandingBalance),
      cell: (l) => <span className="tabular-nums text-surface-700">{formatCurrency(l.outstandingBalance)}</span>,
    },
    {
      key: 'monthly',
      header: 'Monthly',
      align: 'right',
      hideOnTablet: true,
      sortAccessor: (l) => Number(l.monthlyAmortization),
      cell: (l) => <span className="tabular-nums text-surface-700">{formatCurrency(l.monthlyAmortization)}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      hideOnTablet: true,
      sortAccessor: (l) => l.loanDate ?? '',
      cell: (l) => <span className="text-xs tabular-nums text-surface-600">{l.loanDate ? new Date(l.loanDate).toLocaleDateString() : '—'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortAccessor: (l) => l.status,
      cell: (l) => (
        <Badge variant={LOAN_STATUS_VARIANT[l.status] ?? 'neutral'} dot>
          {l.status.replace('_', ' ')}
        </Badge>
      ),
    },
  ];

  const activeFilterCount = (statusFilter ? 1 : 0) + (typeFilter ? 1 : 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={DollarSign}
        title="Loans"
        subtitle="Manage employee loans — SSS, Pag-IBIG, company, and cash advances"
        actions={
          <>
            <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => fetchLoans(meta.page)} loading={loading}>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExport} disabled={loans.length === 0}>
              Export
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openForm}>
              Add Loan
            </Button>
          </>
        }
      />

      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employee or reference…"
        activeFilterCount={activeFilterCount}
        onClear={() => { setStatusFilter(''); setTypeFilter(''); setSearch(''); }}
      >
        <FilterSelect value={typeFilter} onChange={setTypeFilter} ariaLabel="Filter by type">
          <option value="">All Types</option>
          {LOAN_TYPES.map((t) => <option key={t} value={t}>{formatType(t)}</option>)}
        </FilterSelect>
        <FilterSelect value={statusFilter} onChange={setStatusFilter} ariaLabel="Filter by status">
          <option value="">All Status</option>
          {LOAN_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
        </FilterSelect>
      </DataToolbar>

      <BulkActionBar selectedCount={selectedIds.length} onClear={() => setSelectedIds([])}>
        <Button size="sm" variant="secondary" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExport}>
          Export selected
        </Button>
      </BulkActionBar>

      <DataTable<any>
        columns={columns}
        data={loans}
        rowKey={(l) => l.id}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectedChange={setSelectedIds}
        emptyIcon={DollarSign}
        emptyTitle="No loans found"
        emptyDescription={search || statusFilter || typeFilter
          ? 'Try clearing your filters or search.'
          : 'Add your first loan record to get started.'}
        emptyAction={!search && !statusFilter && !typeFilter && (
          <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openForm}>Add Loan</Button>
        )}
        mobileCard={(l) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-surface-900 truncate">{fullName(l)}</div>
                <div className="text-xs text-surface-400">{formatType(l.loanType)}</div>
              </div>
              <Badge variant={LOAN_STATUS_VARIANT[l.status] ?? 'neutral'} dot>{l.status.replace('_', ' ')}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-surface-500 tabular-nums">
              <span>Outstanding</span>
              <span className="font-semibold text-surface-900 text-sm">{formatCurrency(l.outstandingBalance)}</span>
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
            onPageChange={(p) => fetchLoans(p)}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={(s) => { setPageSize(s); }}
          />
        </Card>
      )}

      {/* Add Loan Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add New Loan"
        description="Record a loan disbursement — SSS, Pag-IBIG, company, or cash advance."
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

          <Select
            label="Loan Type" required
            value={form.loanType}
            onChange={(e) => setForm((f) => ({ ...f, loanType: e.target.value }))}
          >
            {LOAN_TYPES.map((t) => <option key={t} value={t}>{formatType(t)}</option>)}
          </Select>

          {['sss', 'pagibig'].includes(form.loanType) && (
            <Input
              label="Loan Reference #"
              placeholder="SSS / Pag-IBIG reference number"
              value={form.loanReference}
              onChange={(e) => setForm((f) => ({ ...f, loanReference: e.target.value }))}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number" label="Principal Amount (₱)" required placeholder="0.00"
              value={form.principalAmount}
              onChange={(e) => setForm((f) => ({ ...f, principalAmount: e.target.value }))}
            />
            <Input
              type="number" label="Monthly Amortization (₱)" placeholder="0.00"
              value={form.monthlyAmortization}
              onChange={(e) => setForm((f) => ({ ...f, monthlyAmortization: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date" label="Loan Date"
              value={form.loanDate}
              onChange={(e) => setForm((f) => ({ ...f, loanDate: e.target.value }))}
            />
            <Input
              type="number" label="Term (months)" placeholder="12"
              value={form.termMonths}
              onChange={(e) => setForm((f) => ({ ...f, termMonths: e.target.value }))}
            />
          </div>

          <Textarea
            label="Purpose" rows={3} placeholder="Purpose of loan…"
            value={form.purpose}
            onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" size="sm" loading={submitting}>
              {submitting ? 'Saving…' : 'Save Loan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
