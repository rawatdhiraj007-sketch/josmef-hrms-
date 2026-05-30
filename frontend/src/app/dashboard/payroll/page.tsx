'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { PayrollRecord, ListResponse } from '@/types/attendance';
import {
  DollarSign, Play, Eye, RefreshCw, Download, Loader2,
} from 'lucide-react';

import { Button, Badge, Card, Modal, Input, useToast } from '@/components/ui';
import {
  DataTable, DataToolbar, DataPagination, FilterSelect, BulkActionBar,
  PageHeader, Column,
} from '@/components/data';
import { downloadCsv } from '@/lib/csv-export';

// ─── Status → Badge variant mapping ──────────────────────────
const PAYROLL_STATUS_VARIANT: Record<string, 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand'> = {
  draft:      'neutral',
  processing: 'info',
  approved:   'brand',
  released:   'success',
  cancelled:  'danger',
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function PayrollPage() {
  const toast = useToast();

  // ── Data + meta ────────────────────────────────────────────
  const [data, setData] = useState<PayrollRecord[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  // ── Filters + search + bulk ────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ── Modals ─────────────────────────────────────────────────
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genFrom, setGenFrom] = useState('');
  const [genTo, setGenTo] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: pageSize };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get<ListResponse<PayrollRecord>>('/payroll', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast.error('Failed to load payroll', 'Please try again.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pageSize]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  // Client-side search (within current page, by employee name/dept)
  const filtered = data.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (p.employee?.firstName || '').toLowerCase().includes(q) ||
      (p.employee?.lastName  || '').toLowerCase().includes(q) ||
      (p.employee?.department || '').toLowerCase().includes(q) ||
      (p.employee?.employeeId || '').toLowerCase().includes(q)
    );
  });

  async function handleGenerate() {
    if (!genFrom || !genTo) return;
    setGenerating(true);
    try {
      await api.post('/payroll/generate', { payDateFrom: genFrom, payDateTo: genTo });
      setShowGenerate(false);
      setGenFrom(''); setGenTo('');
      toast.success('Payroll generated', 'Records added to the list.');
      fetchData(1);
    } catch (err: any) {
      toast.error('Generation failed', err?.response?.data?.message || 'Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  const fmt = (n: number) => `₱${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  const fullName = (p: PayrollRecord) => `${p.employee?.lastName ?? ''}, ${p.employee?.firstName ?? ''}`;

  function handleExport() {
    const rows = selectedIds.length > 0 ? filtered.filter((p) => selectedIds.includes(p.id)) : filtered;
    downloadCsv(`payroll-${new Date().toISOString().slice(0, 10)}`, [
      { header: 'Employee', accessor: (p: PayrollRecord) => fullName(p) },
      { header: 'Employee ID', accessor: (p) => p.employee?.employeeId ?? '' },
      { header: 'Department', accessor: (p) => p.employee?.department ?? '' },
      { header: 'Period From', accessor: (p) => p.payDateFrom?.split('T')[0] ?? '' },
      { header: 'Period To', accessor: (p) => p.payDateTo?.split('T')[0] ?? '' },
      { header: 'Gross Pay', accessor: (p) => Number(p.grossPay).toFixed(2) },
      { header: 'Deductions', accessor: (p) => Number(p.totalDeductions).toFixed(2) },
      { header: 'Net Pay', accessor: (p) => Number(p.netPay).toFixed(2) },
      { header: 'Status', accessor: (p) => p.status },
    ], rows);
    toast.success('Export ready', `${rows.length} records downloaded.`);
  }

  // ── Columns ────────────────────────────────────────────────
  const columns: Column<PayrollRecord>[] = [
    {
      key: 'employee',
      header: 'Employee',
      sortAccessor: (p) => fullName(p),
      cell: (p) => (
        <div>
          <div className="font-medium text-surface-900">{fullName(p)}</div>
          <div className="text-xs text-surface-400">{p.employee?.department || '—'}</div>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Period',
      hideOnMobile: true,
      sortAccessor: (p) => p.payDateFrom ?? '',
      cell: (p) => (
        <span className="text-xs text-surface-600 tabular-nums">
          {p.payDateFrom?.split('T')[0]} → {p.payDateTo?.split('T')[0]}
        </span>
      ),
    },
    {
      key: 'gross',
      header: 'Gross',
      align: 'right',
      hideOnMobile: true,
      sortAccessor: (p) => Number(p.grossPay),
      cell: (p) => <span className="tabular-nums text-surface-700">{fmt(p.grossPay)}</span>,
    },
    {
      key: 'deductions',
      header: 'Deductions',
      align: 'right',
      hideOnTablet: true,
      sortAccessor: (p) => Number(p.totalDeductions),
      cell: (p) => <span className="tabular-nums text-rose-600">−{fmt(p.totalDeductions)}</span>,
    },
    {
      key: 'net',
      header: 'Net Pay',
      align: 'right',
      sortAccessor: (p) => Number(p.netPay),
      cell: (p) => <span className="tabular-nums font-semibold text-surface-900">{fmt(p.netPay)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortAccessor: (p) => p.status,
      cell: (p) => (
        <Badge variant={PAYROLL_STATUS_VARIANT[p.status] ?? 'neutral'} dot>
          {p.status}
        </Badge>
      ),
    },
  ];

  const activeFilterCount = (statusFilter ? 1 : 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={DollarSign}
        title="Payroll"
        subtitle={<span><span className="font-semibold text-surface-700 tabular-nums">{meta.total}</span> {meta.total === 1 ? 'record' : 'records'}</span>}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => fetchData(meta.page)}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExport}
              disabled={filtered.length === 0}
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Play className="w-3.5 h-3.5" />}
              onClick={() => setShowGenerate(true)}
            >
              Generate Payroll
            </Button>
          </>
        }
      />

      <DataToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by employee, ID, or department…"
        activeFilterCount={activeFilterCount}
        onClear={() => { setStatusFilter(''); setSearch(''); }}
      >
        <FilterSelect value={statusFilter} onChange={setStatusFilter} ariaLabel="Filter by status">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="processing">Processing</option>
          <option value="approved">Approved</option>
          <option value="released">Released</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>
      </DataToolbar>

      <BulkActionBar selectedCount={selectedIds.length} onClear={() => setSelectedIds([])}>
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={handleExport}
        >
          Export selected
        </Button>
      </BulkActionBar>

      <DataTable<PayrollRecord>
        columns={columns}
        data={filtered}
        rowKey={(p) => p.id}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectedChange={setSelectedIds}
        onRowClick={(p) => setSelectedPayslip(p)}
        emptyIcon={DollarSign}
        emptyTitle="No payroll records"
        emptyDescription={search || statusFilter
          ? 'Try clearing your filters or search.'
          : 'Generate your first payroll run to see records here.'}
        emptyAction={!search && !statusFilter && (
          <Button size="sm" leftIcon={<Play className="w-3.5 h-3.5" />} onClick={() => setShowGenerate(true)}>
            Generate Payroll
          </Button>
        )}
        rowActions={(p) => (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedPayslip(p); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 hover:text-primary-600 transition-colors"
            aria-label="View payslip"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        mobileCard={(p) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-surface-900 truncate">{fullName(p)}</div>
                <div className="text-xs text-surface-400">{p.employee?.department || '—'}</div>
              </div>
              <Badge variant={PAYROLL_STATUS_VARIANT[p.status] ?? 'neutral'} dot>{p.status}</Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-surface-500 tabular-nums">
              <span>{p.payDateFrom?.split('T')[0]} → {p.payDateTo?.split('T')[0]}</span>
              <span className="font-semibold text-surface-900 text-sm">{fmt(p.netPay)}</span>
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
            onPageChange={(p) => fetchData(p)}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={(s) => { setPageSize(s); }}
          />
        </Card>
      )}

      {/* Generate Payroll Modal */}
      <Modal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        title="Generate Payroll"
        description="Run payroll for a date range. Attendance must already be approved."
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowGenerate(false)}>Cancel</Button>
            <Button
              size="sm"
              leftIcon={<Play className="w-3.5 h-3.5" />}
              onClick={handleGenerate}
              loading={generating}
              disabled={!genFrom || !genTo}
            >
              {generating ? 'Generating…' : 'Generate'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            type="date"
            label="Pay Period From"
            value={genFrom}
            onChange={(e) => setGenFrom(e.target.value)}
          />
          <Input
            type="date"
            label="Pay Period To"
            value={genTo}
            onChange={(e) => setGenTo(e.target.value)}
          />
        </div>
      </Modal>

      {/* Payslip Modal */}
      <Modal
        open={!!selectedPayslip}
        onClose={() => setSelectedPayslip(null)}
        title="Payslip"
        size="lg"
      >
        {selectedPayslip && (
          <div className="space-y-4">
            <div className="border-b border-surface-100 pb-3">
              <p className="font-bold text-surface-900">{fullName(selectedPayslip)}</p>
              <p className="text-sm text-surface-500">
                {selectedPayslip.employee?.position} — {selectedPayslip.employee?.department}
              </p>
              <p className="text-xs text-surface-400 mt-1 tabular-nums">
                Period: {selectedPayslip.payDateFrom?.split('T')[0]} to {selectedPayslip.payDateTo?.split('T')[0]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <p className="text-surface-500">Days Worked</p>
              <p className="text-right font-medium tabular-nums">{Number(selectedPayslip.daysWorked)}</p>
              <p className="text-surface-500">Days Absent</p>
              <p className="text-right font-medium tabular-nums">{Number(selectedPayslip.daysAbsent)}</p>
              <p className="text-surface-500">OT Hours</p>
              <p className="text-right font-medium tabular-nums">{Number(selectedPayslip.totalOvertimeHours).toFixed(1)}</p>
              <p className="text-surface-500">Late (min)</p>
              <p className="text-right font-medium tabular-nums">{Number(selectedPayslip.totalLateMinutes).toFixed(0)}</p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3.5">
              <p className="text-2xs font-bold text-emerald-700 mb-2 uppercase tracking-wider">Earnings</p>
              <div className="grid grid-cols-2 gap-y-1 text-sm tabular-nums">
                <p className="text-surface-600">Basic Pay</p>     <p className="text-right">{fmt(selectedPayslip.basicPay)}</p>
                <p className="text-surface-600">Overtime</p>      <p className="text-right">{fmt(selectedPayslip.overtimePay)}</p>
                <p className="text-surface-600">Holiday</p>       <p className="text-right">{fmt(selectedPayslip.holidayPay)}</p>
                <p className="text-surface-600">Allowance</p>     <p className="text-right">{fmt(selectedPayslip.allowance)}</p>
                <p className="font-semibold text-surface-900 pt-1 border-t border-emerald-200/60">Gross Pay</p>
                <p className="text-right font-semibold pt-1 border-t border-emerald-200/60">{fmt(selectedPayslip.grossPay)}</p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-3.5">
              <p className="text-2xs font-bold text-rose-700 mb-2 uppercase tracking-wider">Deductions</p>
              <div className="grid grid-cols-2 gap-y-1 text-sm tabular-nums">
                <p className="text-surface-600">SSS</p>           <p className="text-right">{fmt(selectedPayslip.sssContribution)}</p>
                <p className="text-surface-600">PhilHealth</p>    <p className="text-right">{fmt(selectedPayslip.philhealthContribution)}</p>
                <p className="text-surface-600">Pag-IBIG</p>      <p className="text-right">{fmt(selectedPayslip.pagibigContribution)}</p>
                <p className="text-surface-600">Tax</p>           <p className="text-right">{fmt(selectedPayslip.withholdingTax)}</p>
                <p className="text-surface-600">Late</p>          <p className="text-right">{fmt(selectedPayslip.lateDeduction)}</p>
                <p className="text-surface-600">Absent</p>        <p className="text-right">{fmt(selectedPayslip.absentDeduction)}</p>
                <p className="font-semibold text-surface-900 pt-1 border-t border-rose-200/60">Total</p>
                <p className="text-right font-semibold pt-1 border-t border-rose-200/60">{fmt(selectedPayslip.totalDeductions)}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-200 rounded-xl p-4 text-center">
              <p className="text-2xs text-primary-700 uppercase font-bold tracking-wider">Net Pay</p>
              <p className="text-3xl font-bold text-primary-700 tabular-nums mt-1">{fmt(selectedPayslip.netPay)}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
