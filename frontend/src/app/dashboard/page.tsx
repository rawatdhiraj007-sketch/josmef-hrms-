'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
  Users, UserPlus, GraduationCap, DollarSign,
  ArrowRight, ArrowUpRight,
  Plane, ShieldAlert, Gift, FileBarChart, Sparkles,
  Plus, Activity, CalendarCheck, BarChart3,
  Cake, Calendar, AlertTriangle, Briefcase,
} from 'lucide-react';
import {
  Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from 'recharts';

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  totalApplicants: number;
  newApplicants: number;
  totalTrainees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}

interface Trend { month: string; headcount: number }

interface RecentHire {
  id: string;
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  dateHired?: string;
}

interface ComplianceSummary {
  total: number;
  critical: number;
  high: number;
}

interface Birthday {
  id: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  day: number;
  dateOfBirth: string;
}

interface OnLeave {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  empNumber: string;
  department?: string;
  leaveCode: string;
  leaveName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
}

interface ExpiringContract {
  id: string;
  firstName: string;
  lastName: string;
  department?: string;
  position?: string;
  contractEndDate: string;
  daysLeft: number;
}

interface Holiday {
  date: string;
  name: string;
  type: 'regular' | 'special';
}

interface Widgets {
  birthdays: Birthday[];
  onLeave: OnLeave[];
  expiringContracts: ExpiringContract[];
  holidays: Holiday[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [trend, setTrend] = useState<Trend[]>([]);
  const [recentHires, setRecentHires] = useState<RecentHire[]>([]);
  const [compliance, setCompliance] = useState<ComplianceSummary | null>(null);
  const [widgets, setWidgets] = useState<Widgets | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, t, h, c, w] = await Promise.all([
          api.get('/dashboard/stats').catch(() => ({ data: {} })),
          api.get('/analytics/headcount-trend').catch(() => ({ data: [] })),
          api.get('/employees', { params: { limit: 5 } }).catch(() => ({ data: { rows: [] } })),
          api.get('/compliance/alerts').catch(() => ({ data: { summary: null } })),
          api.get('/dashboard/widgets').catch(() => ({ data: null })),
        ]);
        setStats(s.data);
        setTrend(t.data);
        setRecentHires(h.data?.rows ?? []);
        setCompliance(c.data?.summary);
        setWidgets(w.data);
      } finally { setLoading(false); }
    })();
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Hero / greeting ────────────────────────────── */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-surface-500">{today}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900 mt-0.5 tracking-tight">
            {greeting}, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Here's what's happening at JOSMEF today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/employees/new" className="btn-secondary">
            <Plus className="w-4 h-4" /> Add Employee
          </Link>
          <Link href="/dashboard/payroll" className="btn-primary">
            <DollarSign className="w-4 h-4" /> Run Payroll
          </Link>
        </div>
      </div>

      {/* ── Compliance alert banner (only if critical) ── */}
      {compliance && compliance.critical > 0 && (
        <Link
          href="/dashboard/compliance"
          className="block bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-xl p-4 hover:shadow-card transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-surface-900">
                {compliance.critical} critical compliance issue{compliance.critical !== 1 && 's'} need your attention
              </div>
              <div className="text-sm text-surface-600">
                {compliance.total} total open · {compliance.high} high priority
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-rose-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      )}

      {/* ── KPI cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Employees"
          value={stats?.totalEmployees ?? 0}
          delta={stats ? `${stats.activeEmployees} active` : ''}
          icon={Users}
          accent="primary"
          loading={loading}
          href="/dashboard/employees"
        />
        <KpiCard
          label="New Applicants"
          value={stats?.newApplicants ?? 0}
          delta={`${stats?.totalApplicants ?? 0} total pipeline`}
          icon={UserPlus}
          accent="violet"
          loading={loading}
          href="/dashboard/applicants"
        />
        <KpiCard
          label="Present Today"
          value={stats?.presentToday ?? 0}
          delta={`${stats?.lateToday ?? 0} late · ${stats?.absentToday ?? 0} absent`}
          icon={CalendarCheck}
          accent="emerald"
          loading={loading}
          href="/dashboard/attendance"
        />
        <KpiCard
          label="Trainees"
          value={stats?.totalTrainees ?? 0}
          delta="In training"
          icon={GraduationCap}
          accent="amber"
          loading={loading}
          href="/dashboard/trainees"
        />
      </div>

      {/* ── Main content grid ──────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Headcount trend chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-surface-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary-600" />
                Headcount Trend
              </h3>
              <p className="text-xs text-surface-500 mt-0.5">Active employees over the last 12 months</p>
            </div>
            <Link href="/dashboard/analytics" className="btn-ghost text-xs">
              View analytics <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="h-56 bg-surface-50 rounded-lg animate-pulse" />
          ) : trend.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-surface-400 text-sm">
              No data yet — add employees to see trends
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <LineChart data={trend}>
                <defs>
                  <linearGradient id="headcountGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #e4e4e7',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="headcount"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, fill: '#e11d48' }}
                  fill="url(#headcountGrad)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions */}
        <div className="card p-6">
          <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <QuickAction href="/dashboard/applicants/new" icon={UserPlus} label="New Applicant" />
            <QuickAction href="/dashboard/leave" icon={Plane} label="Review Leave Requests" />
            <QuickAction href="/dashboard/bonus/new" icon={Gift} label="Create Bonus Run" />
            <QuickAction href="/dashboard/gov-reports" icon={FileBarChart} label="Generate Gov Report" />
            <QuickAction href="/dashboard/training/new" icon={GraduationCap} label="Add Training Course" />
          </div>
        </div>
      </div>

      {/* ── Recent hires + today snapshot ─────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" />
              Recent Hires
            </h3>
            <Link href="/dashboard/employees" className="btn-ghost text-xs">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-surface-50 rounded-lg animate-pulse" />)}
            </div>
          ) : recentHires.length === 0 ? (
            <div className="text-sm text-surface-400 py-6 text-center">No employees yet</div>
          ) : (
            <div className="space-y-1">
              {recentHires.map(emp => (
                <Link
                  key={emp.id}
                  href={`/dashboard/employees/${emp.id}`}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-surface-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {emp.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-900 truncate">
                      {emp.firstName} {emp.lastName}
                    </div>
                    <div className="text-xs text-surface-500 truncate">
                      {emp.position || emp.department || 'Employee'}
                    </div>
                  </div>
                  {emp.dateHired && (
                    <div className="text-xs text-surface-400">
                      {new Date(emp.dateHired).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-surface-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6" id="today-glance">
          <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600" />
            Today at a Glance
          </h3>
          <div className="space-y-4">
            <ActivityRow
              label="Attendance Rate"
              value={
                stats && (stats.presentToday + stats.absentToday + stats.lateToday) > 0
                  ? `${Math.round(stats.presentToday / (stats.presentToday + stats.absentToday + stats.lateToday) * 100)}%`
                  : '—'
              }
              icon={CalendarCheck}
              color="emerald"
            />
            <ActivityRow
              label="Open Compliance Issues"
              value={compliance?.total ?? 0}
              icon={ShieldAlert}
              color={compliance && compliance.critical > 0 ? 'rose' : 'surface'}
            />
            <ActivityRow
              label="Active Applicants"
              value={stats?.newApplicants ?? 0}
              icon={UserPlus}
              color="violet"
            />
            <ActivityRow
              label="Training Programs"
              value="—"
              icon={GraduationCap}
              color="amber"
              hint="From Training module"
            />
          </div>
        </div>
      </div>

      {/* ── Birthdays + Holidays row ──────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Birthdays this month */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <Cake className="w-4 h-4 text-pink-500" />
              Birthdays This Month
            </h3>
            <span className="text-2xs font-semibold uppercase tracking-wider text-surface-400">
              {widgets?.birthdays.length ?? 0}
            </span>
          </div>
          {widgets?.birthdays.length === 0 ? (
            <div className="text-sm text-surface-400 py-6 text-center">
              No birthdays this month 🎂
            </div>
          ) : (
            <div className="space-y-1">
              {widgets?.birthdays.slice(0, 6).map(b => (
                <div key={b.id} className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-surface-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {b.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-900 truncate">
                      {b.firstName} {b.lastName}
                    </div>
                    <div className="text-xs text-surface-500 truncate">
                      {b.department || b.position || 'Employee'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-pink-600">
                      {new Date(b.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
              {(widgets?.birthdays.length ?? 0) > 6 && (
                <div className="text-xs text-surface-400 text-center pt-2">
                  +{(widgets?.birthdays.length ?? 0) - 6} more
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming PH holidays */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-500" />
              Upcoming Holidays
            </h3>
            <span className="text-2xs font-semibold uppercase tracking-wider text-surface-400">PH</span>
          </div>
          {widgets?.holidays.length === 0 ? (
            <div className="text-sm text-surface-400 py-6 text-center">
              No upcoming holidays this year
            </div>
          ) : (
            <div className="space-y-1">
              {widgets?.holidays.slice(0, 6).map(h => {
                const d = new Date(h.date);
                const daysAway = Math.ceil((d.getTime() - Date.now()) / 86400000);
                return (
                  <div key={h.date} className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-surface-50 transition-colors">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-violet-50 flex flex-col items-center justify-center flex-shrink-0">
                      <div className="text-2xs text-violet-600 font-semibold uppercase">
                        {d.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-sm font-bold text-violet-700 leading-none">
                        {d.getDate()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-surface-900 truncate">{h.name}</div>
                      <div className="text-xs text-surface-500">
                        {h.type === 'regular' ? 'Regular' : 'Special non-working'} ·
                        {daysAway === 0 ? ' Today' :
                         daysAway === 1 ? ' Tomorrow' :
                         ` in ${daysAway} days`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── On Leave + Expiring Contracts row ─────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Who's on leave today */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <Plane className="w-4 h-4 text-blue-500" />
              On Leave Today
            </h3>
            <Link href="/dashboard/leave" className="btn-ghost text-xs">
              All leaves <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {widgets?.onLeave.length === 0 ? (
            <div className="text-sm text-surface-400 py-6 text-center">
              Everyone's at work today ✨
            </div>
          ) : (
            <div className="space-y-1">
              {widgets?.onLeave.slice(0, 6).map(l => (
                <div key={l.id} className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-surface-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {l.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-900 truncate">
                      {l.firstName} {l.lastName}
                    </div>
                    <div className="text-xs text-surface-500 truncate">
                      Returns {new Date(l.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <span className="badge-info">{l.leaveCode}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring contracts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Contracts Expiring Soon
            </h3>
            <span className="badge-warning">{widgets?.expiringContracts.length ?? 0} in 30 days</span>
          </div>
          {widgets?.expiringContracts.length === 0 ? (
            <div className="text-sm text-surface-400 py-6 text-center">
              No contracts expiring soon ✓
            </div>
          ) : (
            <div className="space-y-1">
              {widgets?.expiringContracts.slice(0, 6).map(c => (
                <Link
                  key={c.id}
                  href={`/dashboard/employees/${c.id}`}
                  className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-lg hover:bg-surface-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-900 truncate">
                      {c.firstName} {c.lastName}
                    </div>
                    <div className="text-xs text-surface-500 truncate">
                      {c.department || c.position || 'Employee'} · expires {new Date(c.contractEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <span className={`badge ${
                    c.daysLeft <= 7 ? 'badge-danger' :
                    c.daysLeft <= 14 ? 'badge-warning' : 'badge-neutral'
                  }`}>
                    {c.daysLeft}d
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────

function KpiCard({
  label, value, delta, icon: Icon, accent, loading, href,
}: {
  label: string;
  value: number | string;
  delta?: string;
  icon: any;
  accent: 'primary' | 'violet' | 'emerald' | 'amber';
  loading?: boolean;
  href?: string;
}) {
  const colors = {
    primary: 'from-primary-100 to-primary-50 text-primary-600',
    violet: 'from-violet-100 to-violet-50 text-violet-600',
    emerald: 'from-emerald-100 to-emerald-50 text-emerald-600',
    amber: 'from-amber-100 to-amber-50 text-amber-600',
  };
  const Card = (
    <div className="kpi-card group">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[accent]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {href && (
          <ArrowUpRight className="w-4 h-4 text-surface-300 group-hover:text-surface-600 transition-colors" />
        )}
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-7 w-16 bg-surface-100 rounded animate-pulse" />
          <div className="h-3 w-24 bg-surface-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold text-surface-900 tracking-tight tabular-nums">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-xs text-surface-500 mt-1">{delta}</div>
          <div className="text-2xs uppercase tracking-wider text-surface-400 font-semibold mt-2">
            {label}
          </div>
        </>
      )}
    </div>
  );
  return href ? <Link href={href}>{Card}</Link> : Card;
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 -mx-1 rounded-lg hover:bg-surface-50 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-surface-100 group-hover:bg-primary-100 group-hover:text-primary-600 flex items-center justify-center text-surface-600 transition-colors">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-surface-700 font-medium flex-1">{label}</span>
      <ArrowRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-surface-600 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function ActivityRow({
  label, value, icon: Icon, color, hint,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: 'emerald' | 'rose' | 'violet' | 'amber' | 'surface';
  hint?: string;
}) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
    surface: 'bg-surface-100 text-surface-500',
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-surface-900">{label}</div>
        {hint && <div className="text-xs text-surface-400 mt-0.5">{hint}</div>}
      </div>
      <div className="text-lg font-bold text-surface-900 tabular-nums">{value}</div>
    </div>
  );
}
