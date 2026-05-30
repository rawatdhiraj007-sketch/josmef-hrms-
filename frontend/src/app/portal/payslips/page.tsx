'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { DollarSign, Download, Loader2, TrendingUp, Receipt, Banknote } from 'lucide-react';

import { Badge, Card, Button, useToast } from '@/components/ui';

interface Payslip {
  id: string;
  periodStart?: string;
  periodEnd?: string;
  cutoff?: string;
  basicPay?: string | number;
  grossPay?: string | number;
  netPay?: string | number;
  totalDeductions?: string | number;
}

function formatPHP(n: any) {
  const v = Number(n) || 0;
  return '₱' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PortalPayslipsPage() {
  const toast = useToast();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/portal/payslips')
      .then((r) => setPayslips(r.data))
      .catch(() => toast.error('Failed to load payslips'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    const gross  = payslips.reduce((acc, p) => acc + Number(p.grossPay || 0), 0);
    const net    = payslips.reduce((acc, p) => acc + Number(p.netPay   || 0), 0);
    const last   = payslips[0];
    return { gross, net, last };
  }, [payslips]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
            <DollarSign className="w-4 h-4 text-white" />
          </span>
          My Payslips
        </h1>
        <p className="text-sm text-surface-500 mt-1 ml-11">Your salary history and earnings breakdown</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          icon={Banknote}
          label="Last Net Pay"
          value={totals.last ? formatPHP(totals.last.netPay) : '—'}
          hint={totals.last?.periodEnd ? `Paid ${new Date(totals.last.periodEnd).toLocaleDateString()}` : 'No payslips yet'}
          accent
        />
        <SummaryCard
          icon={TrendingUp}
          label="Total Gross"
          value={formatPHP(totals.gross)}
          hint={`${payslips.length} payslip${payslips.length === 1 ? '' : 's'}`}
        />
        <SummaryCard
          icon={Receipt}
          label="Total Net"
          value={formatPHP(totals.net)}
          hint={`${payslips.length} payslip${payslips.length === 1 ? '' : 's'}`}
        />
      </div>

      {/* Desktop table */}
      <Card padding="none" className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50/70 border-b border-surface-200">
              <tr>
                <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Period</th>
                <th className="text-left px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Cutoff</th>
                <th className="text-right px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Basic</th>
                <th className="text-right px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Gross</th>
                <th className="text-right px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Deductions</th>
                <th className="text-right px-4 py-3 text-2xs font-semibold text-surface-500 uppercase tracking-wider">Net Pay</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center">
                  <span className="inline-flex items-center gap-2 text-surface-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                  </span>
                </td></tr>
              ) : payslips.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-sm text-surface-500">No payslips yet</td></tr>
              ) : payslips.map((p) => (
                <tr key={p.id} className="border-b border-surface-100 last:border-0 hover:bg-surface-50/60 transition-colors">
                  <td className="px-4 py-3 text-surface-900 tabular-nums">
                    {p.periodStart && p.periodEnd
                      ? `${new Date(p.periodStart).toLocaleDateString()} – ${new Date(p.periodEnd).toLocaleDateString()}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {p.cutoff ? <Badge variant="neutral" size="sm">{p.cutoff}</Badge> : <span className="text-surface-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-surface-700">{formatPHP(p.basicPay)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-surface-900">{formatPHP(p.grossPay)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-rose-600">−{formatPHP(p.totalDeductions)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold text-emerald-700">{formatPHP(p.netPay)}</td>
                  <td className="px-2 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      title="Print"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 hover:text-primary-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-surface-400 text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : payslips.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-sm text-surface-500">No payslips yet</div>
          </Card>
        ) : (
          <ul className="space-y-2">
            {payslips.map((p) => (
              <li key={p.id}>
                <Card padding="sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-surface-600 tabular-nums truncate">
                        {p.periodStart && p.periodEnd
                          ? `${new Date(p.periodStart).toLocaleDateString()} → ${new Date(p.periodEnd).toLocaleDateString()}`
                          : '—'}
                      </p>
                      {p.cutoff && <Badge variant="neutral" size="sm" className="mt-1">{p.cutoff}</Badge>}
                    </div>
                    <Button
                      variant="ghost" size="sm"
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                      onClick={() => window.print()}
                    >
                      Print
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-100">
                    <div>
                      <div className="text-2xs text-surface-500 uppercase tracking-wider">Gross</div>
                      <div className="text-sm tabular-nums font-medium text-surface-900">{formatPHP(p.grossPay)}</div>
                    </div>
                    <div>
                      <div className="text-2xs text-surface-500 uppercase tracking-wider">Deductions</div>
                      <div className="text-sm tabular-nums font-medium text-rose-600">−{formatPHP(p.totalDeductions)}</div>
                    </div>
                    <div>
                      <div className="text-2xs text-surface-500 uppercase tracking-wider">Net</div>
                      <div className="text-sm tabular-nums font-bold text-emerald-700">{formatPHP(p.netPay)}</div>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon, label, value, hint, accent,
}: {
  icon: any; label: string; value: string; hint?: string; accent?: boolean;
}) {
  return (
    <div className={`
      rounded-2xl p-4 border shadow-card transition-all
      ${accent
        ? 'bg-gradient-to-br from-primary-600 to-accent-600 border-transparent text-white shadow-glow'
        : 'bg-white border-surface-200'}
    `}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
        accent ? 'bg-white/15' : 'bg-gradient-to-br from-primary-500/10 to-accent-500/10 text-primary-600'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className={`text-2xs font-semibold uppercase tracking-wider ${accent ? 'text-white/70' : 'text-surface-500'}`}>{label}</div>
      <div className={`text-2xl font-bold tabular-nums mt-1 ${accent ? 'text-white' : 'text-surface-900'}`}>{value}</div>
      {hint && <div className={`text-2xs mt-1 ${accent ? 'text-white/70' : 'text-surface-400'}`}>{hint}</div>}
    </div>
  );
}
