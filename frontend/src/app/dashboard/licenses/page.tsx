'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Award, Plus, Filter, Stethoscope, AlertTriangle, CheckCircle,
  Clock, XCircle, ExternalLink, Search,
} from 'lucide-react';

interface License {
  id: string;
  licenseType: string;
  customTypeLabel?: string;
  licenseNumber: string;
  issuingAuthority?: string;
  countryCode?: string;
  expiryDate: string;
  status: string;
  cpdUnits?: number;
  cpdRequired?: number;
  daysUntilExpiry: number;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    position?: string;
    department?: string;
  };
}

interface Summary {
  total: number;
  active: number;
  expired: number;
  expiring30: number;
  expiring90: number;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'badge-success',
  expiring_soon: 'badge-warning',
  expired: 'badge-danger',
  suspended: 'badge-neutral',
  revoked: 'badge-neutral',
  pending_renewal: 'badge-info',
};

const LICENSE_TYPE_LABELS: Record<string, string> = {
  prc_rn: 'PRC RN',
  prc_md: 'PRC MD',
  prc_pt: 'PRC PT',
  prc_ot: 'PRC OT',
  prc_mt: 'PRC MedTech',
  prc_rt: 'PRC RT',
  prc_pharmacist: 'PRC Pharmacist',
  prc_dentist: 'PRC Dentist',
  prc_psychologist: 'PRC Psychologist',
  prc_radtech: 'PRC RadTech',
  prc_nutritionist: 'PRC Nutritionist',
  prc_midwife: 'PRC Midwife',
  prc_other: 'PRC (Other)',
  doh_facility: 'DOH Facility',
  philhealth_accreditation: 'PhilHealth',
  nmc: 'UK NMC',
  gmc: 'UK GMC',
  hcpc: 'UK HCPC',
  gdc: 'UK GDC',
  gphc: 'UK GPhC',
  us_state_rn: 'US RN',
  us_state_md: 'US MD',
  us_dea: 'US DEA',
  eu_regulator: 'EU Regulator',
  bls: 'BLS',
  acls: 'ACLS',
  pals: 'PALS',
  nrp: 'NRP',
  atls: 'ATLS',
  iv_therapy: 'IV Therapy',
  infection_control: 'Infection Control',
  nbi: 'NBI Clearance',
  dbs: 'UK DBS',
  other: 'Other',
};

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [l, s] = await Promise.all([
        api.get('/licenses', {
          params: {
            status: statusFilter || undefined,
            licenseType: typeFilter || undefined,
            limit: 200,
          },
        }),
        api.get('/licenses/summary'),
      ]);
      setLicenses(l.data.rows);
      setSummary(s.data);
    } catch { setLicenses([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [statusFilter, typeFilter]);

  const filtered = licenses.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      `${l.employee.firstName} ${l.employee.lastName}`.toLowerCase().includes(q) ||
      l.licenseNumber.toLowerCase().includes(q) ||
      LICENSE_TYPE_LABELS[l.licenseType]?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
            <Stethoscope className="w-6 h-6 text-primary-600" />
            Professional Licenses
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Track PRC, DOH, NMC, GMC, BLS/ACLS and other healthcare credentials with auto-expiry alerts
          </p>
        </div>
        <Link href="/dashboard/licenses/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add License
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard
          label="Total Licenses"
          value={summary?.total ?? 0}
          icon={Award}
          color="primary"
        />
        <StatCard
          label="Active"
          value={summary?.active ?? 0}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          label="Expiring in 30d"
          value={summary?.expiring30 ?? 0}
          icon={Clock}
          color="amber"
          onClick={() => setStatusFilter('expiring_soon')}
        />
        <StatCard
          label="Expiring in 90d"
          value={summary?.expiring90 ?? 0}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          label="Expired"
          value={summary?.expired ?? 0}
          icon={XCircle}
          color="rose"
          onClick={() => setStatusFilter('expired')}
        />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 flex-1 min-w-64">
          <Search className="w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, license number, or type..."
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
          <option value="active">Active</option>
          <option value="expiring_soon">Expiring soon</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
          <option value="revoked">Revoked</option>
          <option value="pending_renewal">Pending renewal</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="">All license types</option>
          <optgroup label="PH PRC">
            <option value="prc_rn">Registered Nurse</option>
            <option value="prc_md">Physician</option>
            <option value="prc_pt">Physical Therapist</option>
            <option value="prc_mt">Med Technologist</option>
            <option value="prc_pharmacist">Pharmacist</option>
          </optgroup>
          <optgroup label="UK">
            <option value="nmc">NMC</option>
            <option value="gmc">GMC</option>
            <option value="hcpc">HCPC</option>
          </optgroup>
          <optgroup label="Clinical Certs">
            <option value="bls">BLS</option>
            <option value="acls">ACLS</option>
            <option value="pals">PALS</option>
          </optgroup>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="table-modern">
          <thead>
            <tr>
              <th>Employee</th>
              <th>License Type</th>
              <th>License #</th>
              <th>Expiry</th>
              <th>CPD Units</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="text-center py-12 text-surface-400">Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <Stethoscope className="w-12 h-12 text-surface-200 mx-auto mb-3" />
                  <p className="text-surface-500 mb-1">No licenses tracked yet</p>
                  <p className="text-xs text-surface-400 mb-4">
                    Add your first healthcare professional's license to enable expiry alerts
                  </p>
                  <Link href="/dashboard/licenses/new" className="btn-primary text-xs inline-flex">
                    <Plus className="w-3 h-3" /> Add first license
                  </Link>
                </td>
              </tr>
            )}
            {filtered.map(l => (
              <tr key={l.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
                      {l.employee.firstName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-surface-900">
                        {l.employee.firstName} {l.employee.lastName}
                      </div>
                      <div className="text-xs text-surface-500">
                        {l.employee.position || l.employee.employeeId}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge-info">
                    {LICENSE_TYPE_LABELS[l.licenseType] || l.licenseType}
                  </span>
                </td>
                <td className="font-mono text-xs text-surface-700">{l.licenseNumber}</td>
                <td>
                  <div className="font-medium text-surface-900">
                    {new Date(l.expiryDate).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </div>
                  <div className={`text-xs ${
                    l.daysUntilExpiry < 0 ? 'text-rose-600 font-semibold' :
                    l.daysUntilExpiry <= 30 ? 'text-amber-600 font-semibold' :
                    l.daysUntilExpiry <= 90 ? 'text-amber-500' : 'text-surface-500'
                  }`}>
                    {l.daysUntilExpiry < 0
                      ? `Expired ${Math.abs(l.daysUntilExpiry)}d ago`
                      : `${l.daysUntilExpiry}d remaining`}
                  </div>
                </td>
                <td className="text-sm">
                  {l.cpdRequired ? (
                    <div>
                      <div className="font-medium tabular-nums">
                        {Number(l.cpdUnits)} / {Number(l.cpdRequired)}
                      </div>
                      <div className="w-20 h-1.5 bg-surface-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            Number(l.cpdUnits) >= Number(l.cpdRequired) ? 'bg-emerald-500' :
                            Number(l.cpdUnits) >= Number(l.cpdRequired) * 0.7 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (Number(l.cpdUnits) / Number(l.cpdRequired)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-surface-400">—</span>
                  )}
                </td>
                <td>
                  <span className={`${STATUS_STYLES[l.status] || 'badge-neutral'} capitalize`}>
                    {l.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <Link
                    href={`/dashboard/licenses/${l.id}`}
                    className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, color, onClick,
}: {
  label: string;
  value: number;
  icon: any;
  color: 'primary' | 'emerald' | 'amber' | 'rose';
  onClick?: () => void;
}) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`card p-4 text-left ${onClick ? 'hover:shadow-card-hover hover:border-surface-300 transition cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-surface-900 tabular-nums">{value}</div>
      <div className="text-2xs font-semibold uppercase tracking-wider text-surface-400 mt-1">
        {label}
      </div>
    </button>
  );
}
