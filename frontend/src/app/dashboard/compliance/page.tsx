'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  AlertTriangle, AlertCircle, Info, CheckCircle,
  CreditCard, FileWarning, LogOut, Clock, Briefcase, RefreshCw,
} from 'lucide-react';

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

const severityConfig = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: AlertCircle, iconColor: 'text-red-500' },
  high: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: AlertTriangle, iconColor: 'text-orange-500' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle, iconColor: 'text-yellow-500' },
  low: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', icon: Info, iconColor: 'text-blue-500' },
};

const typeConfig = {
  loan_separation: { label: 'Loan — Separated', icon: CreditCard, color: 'text-red-500' },
  nte_overdue: { label: 'NTE Overdue', icon: FileWarning, color: 'text-orange-500' },
  clearance_overdue: { label: 'Clearance Overdue', icon: LogOut, color: 'text-purple-500' },
  contract_expiring: { label: 'Contract Expiring', icon: Clock, color: 'text-amber-500' },
  disciplinary_stale: { label: 'Unresolved Disciplinary', icon: Briefcase, color: 'text-gray-600' },
};

export default function CompliancePage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [summary, setSummary] = useState<AlertSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  function load() {
    setLoading(true);
    api.get('/compliance/alerts')
      .then(res => {
        setAlerts(res.data.alerts);
        setSummary(res.data.summary);
        setLastRefresh(new Date());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = alerts.filter(a => {
    if (typeFilter && a.type !== typeFilter) return false;
    if (severityFilter && a.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Last refreshed: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <SummaryCard label="Total Alerts" value={summary.total} color="bg-gray-100 text-gray-700" />
          <SummaryCard label="Critical" value={summary.critical} color="bg-red-100 text-red-700" />
          <SummaryCard label="High" value={summary.high} color="bg-orange-100 text-orange-700" />
          <SummaryCard label="Medium" value={summary.medium} color="bg-yellow-100 text-yellow-700" />
        </div>
      )}

      {/* Type breakdown */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {Object.entries(typeConfig).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const count = summary[key as keyof AlertSummary] as number;
            return (
              <button
                key={key}
                onClick={() => setTypeFilter(typeFilter === key ? '' : key)}
                className={`card p-3 text-left transition-all ${typeFilter === key ? 'ring-2 ring-brand-500' : ''}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                  <span className="text-xs text-gray-500 font-medium">{cfg.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="input-field w-44"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(typeFilter || severityFilter) && (
          <button
            onClick={() => { setTypeFilter(''); setSeverityFilter(''); }}
            className="px-4 py-2 text-sm text-gray-600 border rounded-lg hover:bg-surface-100"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading compliance alerts...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <CheckCircle className="w-14 h-14 mx-auto mb-4 text-green-400" />
          <p className="text-lg font-semibold text-gray-700">
            {alerts.length === 0 ? 'No compliance issues found!' : 'No alerts match your filters.'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {alerts.length === 0 ? 'All employees are in good standing.' : 'Try clearing the filters above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const sev = severityConfig[alert.severity];
            const typ = typeConfig[alert.type];
            const SevIcon = sev.icon;
            const TypeIcon = typ.icon;

            return (
              <div
                key={alert.id}
                className={`card p-4 border ${sev.border} ${sev.bg}`}
              >
                <div className="flex items-start gap-4">
                  <SevIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${sev.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sev.badge}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <TypeIcon className={`w-3.5 h-3.5 ${typ.color}`} />
                        {typ.label}
                      </span>
                      {alert.referenceNumber && (
                        <span className="text-xs font-mono text-gray-400">{alert.referenceNumber}</span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{alert.title}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{alert.description}</p>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {alert.employeeNumber && (
                        <span className="font-mono">{alert.employeeNumber}</span>
                      )}
                      {alert.dueDate && (
                        <span>Due: {alert.dueDate}</span>
                      )}
                      {alert.daysOverdue !== undefined && (
                        <span className="text-red-500 font-medium">{alert.daysOverdue} days overdue</span>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  {alert.link && (
                    <button
                      onClick={() => router.push(alert.link!)}
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border border-current text-brand-600 hover:bg-brand-50 font-medium"
                    >
                      View →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold px-2 py-0.5 rounded ${color}`}>{value}</p>
    </div>
  );
}
