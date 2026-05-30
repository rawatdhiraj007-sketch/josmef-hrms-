'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Plane, DollarSign, Clock, User, GraduationCap, AlertCircle,
  CalendarDays, Loader2, Sparkles, ArrowRight, CheckCircle2,
  XCircle, ChevronRight, Briefcase,
} from 'lucide-react';

import { Badge, Card } from '@/components/ui';
import Avatar from '@/components/ui/Avatar';

interface MeInfo {
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  employmentStatus?: string;
  dateHired?: string;
  contractEndDate?: string;
}

interface Balance {
  leaveType: { code: string; name: string };
  entitled: number;
  used: number;
  pending: number;
  remaining: number;
}

interface LeaveReq {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  leaveType: { code: string };
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  approved: 'success',
  pending:  'warning',
  rejected: 'danger',
  cancelled: 'neutral',
  taken:    'success',
};

const STATUS_ICON: Record<string, any> = {
  approved: CheckCircle2,
  rejected: XCircle,
  pending:  Clock,
};

export default function PortalHome() {
  const [me, setMe] = useState<MeInfo | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [requests, setRequests] = useState<LeaveReq[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [m, b, r] = await Promise.all([
          api.get('/portal/me'),
          api.get('/portal/leave/balances'),
          api.get('/portal/leave/requests'),
        ]);
        setMe(m.data);
        setBalances(b.data);
        setRequests(r.data.rows.slice(0, 5));
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load portal');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <div className="font-semibold">Portal unavailable</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      </div>
    );
  }

  // ── Derived KPIs ──
  const totalRemaining = balances.reduce((acc, b) => acc + Number(b.remaining || 0), 0);
  const totalEntitled  = balances.reduce((acc, b) => acc + Number(b.entitled  || 0), 0);
  const pendingCount   = requests.filter((r) => r.status === 'pending').length;
  const approvedCount  = requests.filter((r) => r.status === 'approved').length;

  const fullName = `${me?.firstName ?? ''} ${me?.lastName ?? ''}`.trim();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 text-white shadow-glow">
        {/* Decorative pattern */}
        <div aria-hidden className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div aria-hidden className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div aria-hidden className="absolute -bottom-8 -left-8 w-40 h-40 bg-accent-300/20 rounded-full blur-3xl" />

        <div className="relative p-6 sm:p-8 flex items-center gap-4 sm:gap-5">
          <Avatar name={fullName} size="xl" className="ring-2 ring-white/40" />
          <div className="min-w-0 flex-1">
            <div className="text-2xs uppercase tracking-wider text-white/70 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> {greeting}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
              {me?.firstName}!
            </h1>
            {(me?.position || me?.department) && (
              <p className="text-white/80 text-sm mt-1 flex items-center gap-1.5 truncate">
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">
                  {me?.position}{me?.department && ` · ${me.department}`}
                </span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── KPI CARDS ── */}
      <section>
        <h2 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3 px-1">
          At a glance
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={Plane}
            label="Leave Remaining"
            value={totalRemaining}
            unit={`of ${totalEntitled}`}
            tone="brand"
          />
          <KpiCard
            icon={Clock}
            label="Pending"
            value={pendingCount}
            unit={pendingCount === 1 ? 'request' : 'requests'}
            tone="warning"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Approved"
            value={approvedCount}
            unit={approvedCount === 1 ? 'this year' : 'this year'}
            tone="success"
          />
          <KpiCard
            icon={CalendarDays}
            label="Year"
            value={new Date().getFullYear()}
            unit="leave year"
            tone="neutral"
          />
        </div>
      </section>

      {/* ── QUICK ACTIONS ── */}
      <section>
        <h2 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3 px-1">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction
            href="/portal/leave"
            icon={Plane}
            label="File Leave"
            description="Request time off"
          />
          <QuickAction
            href="/portal/payslips"
            icon={DollarSign}
            label="Payslips"
            description="View earnings"
          />
          <QuickAction
            href="/portal/attendance"
            icon={Clock}
            label="Attendance"
            description="Check log"
          />
          <QuickAction
            href="/portal/training"
            icon={GraduationCap}
            label="Training"
            description="Your courses"
          />
        </div>
      </section>

      {/* ── BALANCES + ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Leave balances detail */}
        <Card padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <div>
              <h2 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                <Plane className="w-4 h-4 text-primary-600" /> Leave Balances
              </h2>
              <p className="text-2xs text-surface-500 mt-0.5">{new Date().getFullYear()} · {balances.length} types</p>
            </div>
            <Link
              href="/portal/leave"
              className="text-2xs font-medium text-primary-700 hover:text-primary-900 inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {balances.length === 0 ? (
            <div className="py-10 text-center">
              <Plane className="w-8 h-8 mx-auto mb-2 text-surface-300" />
              <p className="text-sm text-surface-500">No leave balances yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-surface-100">
              {balances.slice(0, 5).map((b) => {
                const pct = b.entitled > 0
                  ? Math.min(100, Math.round((Number(b.used) / Number(b.entitled)) * 100))
                  : 0;
                return (
                  <li key={b.leaveType.code} className="px-5 py-3 hover:bg-surface-50/60 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="brand" size="sm">{b.leaveType.code}</Badge>
                          <span className="text-sm text-surface-900 font-medium truncate">{b.leaveType.name}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-surface-900 tabular-nums leading-none">
                          {b.remaining}
                        </div>
                        <div className="text-2xs text-surface-500 mt-1">of {b.entitled}</div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Recent leave requests */}
        <Card padding="none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <div>
              <h2 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-600" /> Recent Requests
              </h2>
              <p className="text-2xs text-surface-500 mt-0.5">{requests.length} {requests.length === 1 ? 'request' : 'requests'}</p>
            </div>
            <Link
              href="/portal/leave"
              className="text-2xs font-medium text-primary-700 hover:text-primary-900 inline-flex items-center gap-1"
            >
              See history <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {requests.length === 0 ? (
            <div className="py-10 text-center px-4">
              <Plane className="w-8 h-8 mx-auto mb-2 text-surface-300" />
              <p className="text-sm font-medium text-surface-700">No requests yet</p>
              <p className="text-2xs text-surface-500 mt-0.5 mb-4">File your first leave request</p>
              <Link
                href="/portal/leave"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-700 hover:text-primary-900"
              >
                File a request <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-surface-100">
              {requests.map((r) => {
                const Icon = STATUS_ICON[r.status] ?? Clock;
                return (
                  <li key={r.id}>
                    <Link
                      href="/portal/leave"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-surface-50/60 transition-colors group"
                    >
                      <Icon className={`
                        w-5 h-5 flex-shrink-0
                        ${r.status === 'approved' ? 'text-emerald-500' :
                          r.status === 'rejected' ? 'text-rose-500' :
                          r.status === 'pending'  ? 'text-amber-500' : 'text-surface-400'}
                      `} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-surface-900">
                            {r.leaveType?.code} · {Number(r.totalDays)} day{Number(r.totalDays) > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-2xs text-surface-500 mt-0.5 tabular-nums">
                          {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={STATUS_VARIANT[r.status] ?? 'neutral'} dot>
                        {r.status}
                      </Badge>
                      <ChevronRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-600 transition-colors" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── KPI Card ───
function KpiCard({
  icon: Icon, label, value, unit, tone,
}: {
  icon: any;
  label: string;
  value: number | string;
  unit?: string;
  tone: 'brand' | 'warning' | 'success' | 'neutral';
}) {
  const TONE_BG: Record<typeof tone, string> = {
    brand:   'from-primary-500/10 to-accent-500/10 text-primary-600',
    warning: 'from-amber-500/10   to-amber-400/10  text-amber-600',
    success: 'from-emerald-500/10 to-teal-500/10   text-emerald-600',
    neutral: 'from-surface-500/10 to-surface-400/10 text-surface-600',
  };
  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${TONE_BG[tone]} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">
        {label}
      </div>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold text-surface-900 tabular-nums leading-none">{value}</span>
        {unit && <span className="text-2xs text-surface-400">{unit}</span>}
      </div>
    </div>
  );
}

// ─── Quick Action ───
function QuickAction({
  href, icon: Icon, label, description,
}: {
  href: string;
  icon: any;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="
        group bg-white border border-surface-200 rounded-2xl p-4
        shadow-card hover:shadow-card-hover hover:border-primary-200
        hover:-translate-y-0.5 transition-all
        flex flex-col items-start
      "
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow mb-3">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-sm font-semibold text-surface-900">{label}</div>
      <div className="text-2xs text-surface-500 mt-0.5">{description}</div>
    </Link>
  );
}
