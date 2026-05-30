'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Plane, Plus, Check, X, Clock, RefreshCw, Download, Inbox,
} from 'lucide-react';

import { Button, Badge, Card, useToast } from '@/components/ui';
import {
  DataTable, DataToolbar, DataPagination, FilterSelect, BulkActionBar,
  PageHeader, Column,
} from '@/components/data';
import { downloadCsv } from '@/lib/csv-export';

// ─── Types (unchanged from original — preserved as-is) ───────
interface LeaveRequest {
  id: string;
  requestNumber: string;
  employee: { id: string; firstName: string; lastName: string; employeeId: string };
  leaveType: { code: string; name: string };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  approverRemarks?: string;
  approvedAt?: string;
}

const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'danger' | 'neutral' | 'info'> = {
  pending:   'warning',
  approved:  'success',
  rejected:  'danger',
  cancelled: 'neutral',
  taken:     'info',
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export default function LeavePage() {
  const toast = useToast();

  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  // Filters + UI state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  // Bulk + pagination (client-side pagination over the loaded set)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        api.get('/leave/requests', { params: { status: statusFilter || undefined, limit: 100 } }),
        api.get('/leave/summary'),
      ]);
      setRequests(r.data.rows);
      setSummary(s.data);
    } catch {
      setRequests([]);
      toast.error('Failed to load requests', 'Please try again.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function decide(id: string, status: 'approved' | 'rejected') {
    setActing(id);
    try {
      const remarks = status === 'rejected'
        ? window.prompt('Reason for rejection:') || ''
        : window.prompt('Optional approval remarks:') || '';
      await api.patch(`/leave/requests/${id}`, { status, approverRemarks: remarks });
      toast.success(`Request ${status}`, status === 'approved' ? 'Leave granted.' : 'Leave denied.');
      await load();
    } catch (e: any) {
      toast.error('Action failed', e?.response?.data?.message || 'Please try again.');
    } finally {
      setActing(null);
    }
  }

  // ── Derived: filter + paginate client-side ────────────────
  const filtered = requests.filter((r) => {
    if (typeFilter && r.leaveType?.code !== typeFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r.requestNumber || '').toLowerCase().includes(q) ||
      (r.employee?.firstName || '').toLowerCase().includes(q) ||
      (r.employee?.lastName  || '').toLowerCase().includes(q) ||
      (r.employee?.employeeId || '').toLowerCase().includes(q) ||
      (r.reason || '').toLowerCase().includes(q)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Unique leave types from current dataset
  const leaveTypes = Array.from(
    new Map(requests.filter((r) => r.leaveType?.code).map((r) => [r.leaveType.code, r.leaveType])).values()
  );

  const fullName = (r: LeaveRequest) => `${r.employee?.firstName ?? ''} ${r.employee?.lastName ?? ''}`.trim();

  function handleExport() {
    const rows = selectedIds.length > 0 ? filtered.filter((r) => selectedIds.includes(r.id)) : filtered;
    downloadCsv(`leave-requests-${new Date().toISOString().slice(0, 10)}`, [
      { header: 'Ref #',       accessor: (r: LeaveRequest) => r.requestNumber },
      { header: 'Employee',    accessor: (r) => fullName(r) },
      { header: 'Employee ID', accessor: (r) => r.employee?.employeeId ?? '' },
      { header: 'Type',        accessor: (r) => r.leaveType?.name ?? r.leaveType?.code ?? '' },
      { header: 'Start Date',  accessor: (r) => r.startDate?.split('T')[0] ?? '' },
      { header: 'End Date',    accessor: (r) => r.endDate?.split('T')[0]   ?? '' },
      { header: 'Days',        accessor: (r) => Number(r.totalDays) },
      { header: 'Reason',      accessor: (r) => r.reason ?? '' },
      { header: 'Status',      accessor: (r) => r.status },
    ], rows);
    toast.success('Export ready', `${rows.length} requests downloaded.`);
  }

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'ref',
      header: 'Ref #',
      sortAccessor: (r) => r.requestNumber,
      cell: (r) => <span className="font-mono text-xs text-surface-600">{r.requestNumber}</span>,
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
      key: 'type',
      header: 'Type',
      hideOnMobile: true,
      sortAccessor: (r) => r.leaveType?.code ?? '',
      cell: (r) => (
        <Badge variant="brand" size="sm">{r.leaveType?.code ?? '—'}</Badge>
      ),
    },
    {
      key: 'dates',
      header: 'Dates',
      hideOnMobile: true,
      sortAccessor: (r) => r.startDate ?? '',
      cell: (r) => (
        <div className="text-xs text-surface-600 tabular-nums">
          <div>{new Date(r.startDate).toLocaleDateString()}</div>
          <div className="text-surface-400">→ {new Date(r.endDate).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: 'days',
      header: 'Days',
      align: 'right',
      sortAccessor: (r) => Number(r.totalDays),
      cell: (r) => <span className="font-semibold tabular-nums">{Number(r.totalDays)}</span>,
    },
    {
      key: 'reason',
      header: 'Reason',
      hideOnTablet: true,
      cell: (r) => <span className="text-surface-600 line-clamp-1 max-w-xs block">{r.reason}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortAccessor: (r) => r.status,
      cell: (r) => (
        <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'} dot>
          {r.status}
        </Badge>
      ),
    },
  ];

  const activeFilterCount = (statusFilter ? 1 : 0) + (typeFilter ? 1 : 0);

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Plane}
        title="Leave Management"
        subtitle="Track and approve employee leave requests"
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={load}
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
            <Link href="/dashboard/leave/new">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                New Request
              </Button>
            </Link>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests"  value={summary.total}     variant="neutral" />
        <StatCard label="Pending Approval" value={summary.pending}  variant="warning" />
        <StatCard label="Approved"        value={summary.approved}  variant="success" />
        <StatCard label="Rejected"        value={summary.rejected}  variant="danger"  />
      </div>

      <DataToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by ref, employee, reason…"
        activeFilterCount={activeFilterCount}
        onClear={() => { setStatusFilter(''); setTypeFilter(''); setSearch(''); }}
      >
        <FilterSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} ariaLabel="Filter by status">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>
        {leaveTypes.length > 0 && (
          <FilterSelect value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1); }} ariaLabel="Filter by type">
            <option value="">All types</option>
            {leaveTypes.map((t) => <option key={t.code} value={t.code}>{t.name}</option>)}
          </FilterSelect>
        )}
      </DataToolbar>

      <BulkActionBar selectedCount={selectedIds.length} onClear={() => setSelectedIds([])}>
        <Button size="sm" variant="secondary" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExport}>
          Export selected
        </Button>
      </BulkActionBar>

      <DataTable<LeaveRequest>
        columns={columns}
        data={paged}
        rowKey={(r) => r.id}
        loading={loading}
        selectable
        selectedIds={selectedIds}
        onSelectedChange={setSelectedIds}
        emptyIcon={Inbox}
        emptyTitle="No leave requests"
        emptyDescription={
          search || statusFilter || typeFilter
            ? 'Try clearing your filters or search.'
            : 'When employees submit leave requests, they will appear here.'
        }
        emptyAction={
          !search && !statusFilter && !typeFilter && (
            <Link href="/dashboard/leave/new">
              <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>New Request</Button>
            </Link>
          )
        }
        rowActions={(r) => (
          r.status === 'pending' ? (
            <div className="flex gap-1">
              <button
                type="button"
                disabled={acting === r.id}
                onClick={(e) => { e.stopPropagation(); decide(r.id, 'approved'); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 transition-colors"
                title="Approve"
                aria-label="Approve request"
              ><Check className="w-4 h-4" /></button>
              <button
                type="button"
                disabled={acting === r.id}
                onClick={(e) => { e.stopPropagation(); decide(r.id, 'rejected'); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-600 hover:bg-rose-50 disabled:opacity-40 transition-colors"
                title="Reject"
                aria-label="Reject request"
              ><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <Clock className="w-3.5 h-3.5 text-surface-300" />
          )
        )}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-medium text-surface-900 truncate">{fullName(r)}</div>
                <div className="text-xs text-surface-400 font-mono">{r.requestNumber}</div>
              </div>
              <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'} dot>{r.status}</Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-surface-500">
              <Badge variant="brand" size="sm">{r.leaveType?.code}</Badge>
              <span className="tabular-nums">{Number(r.totalDays)} days</span>
            </div>
          </div>
        )}
      />

      {filtered.length > pageSize && (
        <Card variant="ghost" padding="none">
          <DataPagination
            page={page}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          />
        </Card>
      )}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────
function StatCard({
  label, value, variant,
}: {
  label: string;
  value: number;
  variant: 'neutral' | 'warning' | 'success' | 'danger';
}) {
  const tone = {
    neutral: 'text-surface-900',
    warning: 'text-amber-600',
    success: 'text-emerald-600',
    danger:  'text-rose-600',
  }[variant];
  return (
    <Card padding="sm" hover>
      <div className="text-2xs text-surface-500 uppercase tracking-wider font-medium">{label}</div>
      <div className={`text-2xl font-bold mt-1 tabular-nums ${tone}`}>{value}</div>
    </Card>
  );
}
