'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  AlertTriangle, AlertCircle, Info, CheckCircle, ShieldCheck,
  CreditCard, FileWarning, LogOut, Clock, Briefcase, RefreshCw,
  Download, Printer, Stethoscope, ChevronRight, Building2,
} from 'lucide-react';

import { Button, Badge, Card, useToast } from '@/components/ui';
import { PageHeader, FilterSelect } from '@/components/data';
import { downloadCsv } from '@/lib/csv-export';

interface ComplianceAlert {
  id: string;
  type: 'loan_separation' | 'nte_overdue' | 'clearance_overdue' | 'contract_expiring' | 'disciplinary_stale';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  employeeId?: string;
  employeeName?: string;
  employeeNumber?: string;
  referenceId?: string;
  referenceNumber?: string;
  dueDate?: string;
  daysOverdue?: number;
  link?: string;
}

interface AlertSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  loan_separation: number;
  nte_overdue: number;
  clearance_overdue: number;
  contract_expiring: number;
  disciplinary_stale: number;
}

interface LicenseRow {
  id: string;
  licenseType?: string;
  licenseNumber?: string;
  issuingAuthority?: string;
  countryCode?: string;
  expiryDate?: string;
  employee?: { firstName?: string; lastName?: string; employeeId?: string; position?: string };
}

const SEVERITY_VARIANT: Record<string, 'danger' | 'warning' | 'info' | 'neutral'> = {
  critical: 'danger',
  high:     'warning',
  medium:   'info',
  low:      'neutral',
};

const TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  loan_separation:    { label: 'Loan — Separated',         icon: CreditCard,  color: 'text-rose-600' },
  nte_overdue:        { label: 'NTE Overdue',              icon: FileWarning, color: 'text-amber-600' },
  clearance_overdue:  { label: 'Clearance Overdue',        icon: LogOut,      color: 'text-violet-600' },
  contract_expiring:  { label: 'Contract Expiring',        icon: Clock,       color: 'text-amber-600' },
  disciplinary_stale: { label: 'Unresolved Disciplinary',  icon: Briefcase,   color: 'text-surface-600' },
};

// ─── License authority groupings (PH-specific) ───
const AUTHORITY_GROUPS: { id: string; label: string; match: (l: LicenseRow) => boolean; icon: any }[] = [
  { id: 'prc',         label: 'PRC (Professional)',        match: (l) => (l.licenseType ?? '').startsWith('prc_'),                          icon: Stethoscope },
  { id: 'doh',         label: 'DOH (Facility)',            match: (l) => l.licenseType === 'doh_facility',                                  icon: Building2 },
  { id: 'philhealth',  label: 'PhilHealth Accreditation',  match: (l) => l.licenseType === 'philhealth_accreditation',                      icon: ShieldCheck },
  { id: 'nbi',         label: 'NBI Clearance',             match: (l) => l.licenseType === 'nbi',                                           icon: ShieldCheck },
  { id: 'clinical',    label: 'Clinical Certs (BLS/ACLS)', match: (l) => ['bls','acls','pals','nrp','atls','iv_therapy','infection_control'].includes(l.licenseType ?? ''), icon: ShieldCheck },
  { id: 'uk',          label: 'UK (NMC/GMC/HCPC)',         match: (l) => ['nmc','gmc','hcpc','gdc','gphc'].includes(l.licenseType ?? ''),   icon: ShieldCheck },
  { id: 'other',       label: 'Other',                     match: (l) => true,                                                              icon: ShieldCheck },
];

// ─── Aging buckets ───
type AgingBucket = 'expired' | '7d' | '30d' | '90d' | 'safe';
function bucketize(expiry: string | undefined): AgingBucket | null {
  if (!expiry) return null;
  const diff = new Date(expiry).getTime() - Date.now();
  if (diff < 0) return 'expired';
  const days = diff / (1000 * 60 * 60 * 24);
  if (days <= 7)  return '7d';
  if (days <= 30) return '30d';
  if (days <= 90) return '90d';
  return 'safe';
}
const BUCKET_META: Record<AgingBucket, { label: string; tone: 'danger' | 'warning' | 'info' | 'success'; range: string }> = {
  expired: { label: 'Expired',           tone: 'danger',  range: 'Past expiry' },
  '7d':    { label: 'Expires < 7 days',  tone: 'danger',  range: '0–7 days'    },
  '30d':   { label: 'Expires < 30 days', tone: 'warning', range: '8–30 days'   },
  '90d':   { label: 'Expires < 90 days', tone: 'info',    range: '31–90 days'  },
  safe:    { label: 'Current',           tone: 'success', range: '90+ days'    },
};

export default function CompliancePage() {
  const router = useRouter();
  const toast = useToast();

  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [bucketFilter, setBucketFilter] = useState<string>('');
  const [authorityFilter, setAuthorityFilter] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  async function load() {
    setLoading(true);
    try {
      const [aRes, lRes] = await Promise.all([
        api.get('/compliance/alerts').catch(() => ({ data: { alerts: [], summary: null } })),
        api.get('/licenses', { params: { limit: 500 } }).catch(() => ({ data: { data: [] } })),
      ]);
      setAlerts(aRes.data?.alerts ?? []);
      setSummary(aRes.data?.summary ?? null);
      setLicenses(lRes.data?.data ?? lRes.data ?? []);
      setLastRefresh(new Date());
    } catch {
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  // ── License aging stats ──
  const aging = useMemo(() => {
    const byBucket: Record<AgingBucket, LicenseRow[]> = { expired: [], '7d': [], '30d': [], '90d': [], safe: [] };
    licenses.forEach((l) => {
      const b = bucketize(l.expiryDate);
      if (b) byBucket[b].push(l);
    });
    return byBucket;
  }, [licenses]);

  const filteredLicenses = useMemo(() => {
    return licenses.filter((l) => {
      const bucket = bucketize(l.expiryDate);
      if (bucketFilter && bucket !== bucketFilter) return false;
      if (authorityFilter) {
        const group = AUTHORITY_GROUPS.find((g) => g.id === authorityFilter);
        if (group && !group.match(l)) return false;
      }
      return true;
    });
  }, [licenses, bucketFilter, authorityFilter]);

  const filteredAlerts = alerts.filter((a) => {
    if (typeFilter && a.type !== typeFilter) return false;
    if (severityFilter && a.severity !== severityFilter) return false;
    return true;
  });

  function handleExport() {
    const rows = filteredLicenses.map((l) => ({ ...l, bucket: bucketize(l.expiryDate) }));
    downloadCsv(`compliance-licenses-${new Date().toISOString().slice(0, 10)}`, [
      { header: 'Employee',     accessor: (r: any) => `${r.employee?.firstName ?? ''} ${r.employee?.lastName ?? ''}`.trim() },
      { header: 'Employee ID',  accessor: (r) => r.employee?.employeeId ?? '' },
      { header: 'Position',     accessor: (r) => r.employee?.position ?? '' },
      { header: 'License Type', accessor: (r) => r.licenseType ?? '' },
      { header: 'License #',    accessor: (r) => r.licenseNumber ?? '' },
      { header: 'Authority',    accessor: (r) => r.issuingAuthority ?? '' },
      { header: 'Country',      accessor: (r) => r.countryCode ?? '' },
      { header: 'Expiry',       accessor: (r) => r.expiryDate ? new Date(r.expiryDate).toISOString().slice(0, 10) : '' },
      { header: 'Status',       accessor: (r) => r.bucket ? BUCKET_META[r.bucket as AgingBucket].label : '' },
    ], rows);
    toast.success('Export ready', `${rows.length} licenses downloaded.`);
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        icon={ShieldCheck}
        title="Compliance Center"
        subtitle={
          <span className="flex items-center gap-1.5">
            Last refreshed {lastRefresh.toLocaleTimeString()}
            <span className="text-surface-300">·</span>
            <span className="tabular-nums">{licenses.length}</span> tracked licenses
          </span>
        }
        actions={
          <>
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />} onClick={load} loading={loading}>
              Refresh
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />} onClick={() => window.print()}>
              Print
            </Button>
            <Button variant="secondary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExport} disabled={filteredLicenses.length === 0}>
              Export CSV
            </Button>
          </>
        }
      />

      {/* ─── License aging dashboard ─── */}
      <section>
        <h2 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" /> License Aging
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.keys(BUCKET_META) as AgingBucket[]).map((b) => {
            const meta = BUCKET_META[b];
            const count = aging[b]?.length ?? 0;
            const active = bucketFilter === b;
            return (
              <button
                key={b} type="button"
                onClick={() => setBucketFilter(active ? '' : b)}
                className={`text-left bg-white border rounded-2xl p-4 shadow-card transition-all hover:shadow-card-hover ${
                  active ? 'border-primary-300 ring-2 ring-primary-200' : 'border-surface-200'
                }`}
              >
                <Badge variant={meta.tone === 'success' ? 'success' : meta.tone === 'danger' ? 'danger' : meta.tone === 'warning' ? 'warning' : 'info'} size="sm" dot>
                  {meta.label}
                </Badge>
                <div className="text-3xl font-bold text-surface-900 tabular-nums mt-2 leading-none">{count}</div>
                <div className="text-2xs text-surface-500 mt-1">{meta.range}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── By authority ─── */}
      <section>
        <h2 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Stethoscope className="w-3.5 h-3.5" /> By Issuing Authority
        </h2>
        <div className="flex flex-wrap gap-2">
          {AUTHORITY_GROUPS.map((g) => {
            const count = licenses.filter(g.match).length;
            if (count === 0 && g.id !== 'other') return null;
            const active = authorityFilter === g.id;
            const Icon = g.icon;
            return (
              <button
                key={g.id} type="button"
                onClick={() => setAuthorityFilter(active ? '' : g.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm ${
                  active ? 'border-primary-300 bg-primary-50 text-primary-700 ring-2 ring-primary-200' : 'border-surface-200 bg-white text-surface-700 hover:border-primary-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="font-medium">{g.label}</span>
                <span className="font-bold tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── License table (filtered) ─── */}
      <Card padding="none">
        <div className="px-5 py-3 border-b border-surface-100 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-surface-900">Licenses</h2>
            <p className="text-2xs text-surface-500 mt-0.5">
              {filteredLicenses.length} of {licenses.length}
              {bucketFilter && <> · filtered: {BUCKET_META[bucketFilter as AgingBucket].label}</>}
              {authorityFilter && <> · {AUTHORITY_GROUPS.find((g) => g.id === authorityFilter)?.label}</>}
            </p>
          </div>
          {(bucketFilter || authorityFilter) && (
            <button onClick={() => { setBucketFilter(''); setAuthorityFilter(''); }}
              className="text-2xs text-surface-500 hover:text-surface-900 hover:bg-surface-100 px-2 py-1 rounded-md">
              Clear filters
            </button>
          )}
        </div>
        {loading ? (
          <div className="py-12 text-center text-sm text-surface-400">Loading…</div>
        ) : filteredLicenses.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-surface-700">{licenses.length === 0 ? 'No licenses tracked yet.' : 'No licenses match your filters.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50/70 border-b border-surface-200">
                <tr>
                  <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Employee</th>
                  <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">License</th>
                  <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Authority</th>
                  <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Expiry</th>
                  <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLicenses.slice(0, 100).map((l) => {
                  const b = bucketize(l.expiryDate);
                  const meta = b ? BUCKET_META[b] : null;
                  return (
                    <tr key={l.id} onClick={() => router.push('/dashboard/licenses')}
                      className="border-b border-surface-100 last:border-0 hover:bg-surface-50/60 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="font-medium text-surface-900">{l.employee?.firstName} {l.employee?.lastName}</div>
                        <div className="text-2xs text-surface-500">{l.employee?.employeeId} · {l.employee?.position || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-surface-700 text-xs">{l.licenseType?.replace(/_/g, ' ')}</div>
                        <div className="text-2xs font-mono text-surface-500">{l.licenseNumber || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-surface-600">
                        {l.issuingAuthority || '—'}
                        {l.countryCode && <Badge variant="neutral" size="sm" className="ml-2">{l.countryCode}</Badge>}
                      </td>
                      <td className="px-4 py-3 text-xs tabular-nums text-surface-600">{l.expiryDate ? new Date(l.expiryDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        {meta ? (
                          <Badge variant={meta.tone === 'success' ? 'success' : meta.tone === 'danger' ? 'danger' : meta.tone === 'warning' ? 'warning' : 'info'} size="sm" dot>
                            {meta.label}
                          </Badge>
                        ) : <span className="text-2xs text-surface-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredLicenses.length > 100 && (
              <div className="px-4 py-2 text-2xs text-surface-500 text-center">
                Showing first 100 of {filteredLicenses.length}. Use Export CSV for the full list.
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ─── Operational alerts (legacy compliance/alerts) ─── */}
      {summary && (
        <section>
          <h2 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" /> Operational Alerts
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <KpiCard label="Total"    value={summary.total}    tone="neutral" />
            <KpiCard label="Critical" value={summary.critical} tone="danger" />
            <KpiCard label="High"     value={summary.high}     tone="warning" />
            <KpiCard label="Medium"   value={summary.medium}   tone="info" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
            {Object.entries(TYPE_META).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const count = summary[key as keyof AlertSummary] as number;
              const active = typeFilter === key;
              return (
                <button
                  key={key} type="button"
                  onClick={() => setTypeFilter(active ? '' : key)}
                  className={`text-left bg-white border rounded-xl p-3 transition-all shadow-card hover:shadow-card-hover ${
                    active ? 'border-primary-300 ring-2 ring-primary-200' : 'border-surface-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className="text-2xs text-surface-500 font-medium truncate">{cfg.label}</span>
                  </div>
                  <p className="text-xl font-bold text-surface-900 tabular-nums">{count}</p>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            <FilterSelect value={severityFilter} onChange={setSeverityFilter} ariaLabel="Filter by severity">
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </FilterSelect>
            {(typeFilter || severityFilter) && (
              <button onClick={() => { setTypeFilter(''); setSeverityFilter(''); }}
                className="text-2xs text-surface-500 hover:text-surface-900 hover:bg-surface-100 px-2 py-1 rounded-md">
                Clear filters
              </button>
            )}
          </div>

          {filteredAlerts.length === 0 ? (
            <Card>
              <div className="py-10 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-surface-700">
                  {alerts.length === 0 ? 'No operational compliance issues' : 'No alerts match your filters'}
                </p>
                {alerts.length === 0 && <p className="text-2xs text-surface-500 mt-1">All employees are in good standing.</p>}
              </div>
            </Card>
          ) : (
            <ul className="space-y-2">
              {filteredAlerts.map((a) => {
                const typ = TYPE_META[a.type];
                const TypeIcon = typ.icon;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => a.link && router.push(a.link)}
                      disabled={!a.link}
                      className="w-full text-left bg-white border border-surface-200 hover:border-primary-200 rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all flex items-start gap-3 group disabled:cursor-default"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${SEVERITY_VARIANT[a.severity] === 'danger' ? 'bg-rose-50 text-rose-600' : SEVERITY_VARIANT[a.severity] === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={SEVERITY_VARIANT[a.severity]} size="sm">{a.severity}</Badge>
                          <span className="text-sm font-semibold text-surface-900">{a.title}</span>
                          {a.referenceNumber && <span className="text-2xs font-mono text-surface-400">{a.referenceNumber}</span>}
                        </div>
                        <p className="text-xs text-surface-600 mt-1">{a.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-2xs text-surface-500">
                          {a.employeeNumber && <span className="font-mono">{a.employeeNumber}</span>}
                          {a.dueDate && <span>Due: {a.dueDate}</span>}
                          {a.daysOverdue !== undefined && <span className="text-rose-600 font-medium">{a.daysOverdue}d overdue</span>}
                        </div>
                      </div>
                      {a.link && <ChevronRight className="w-4 h-4 text-surface-300 group-hover:text-primary-600 transition-colors mt-1" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function KpiCard({ label, value, tone }: { label: string; value: number; tone: 'neutral' | 'danger' | 'warning' | 'info' }) {
  const color = {
    neutral: 'text-surface-900',
    danger:  'text-rose-600',
    warning: 'text-amber-600',
    info:    'text-blue-600',
  }[tone];
  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-4 text-center shadow-card">
      <div className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-bold tabular-nums mt-1 ${color}`}>{value}</div>
    </div>
  );
}
