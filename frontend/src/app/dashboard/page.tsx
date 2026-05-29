'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
  Users, UserPlus, GraduationCap, DollarSign,
  ArrowRight, ArrowUpRight,
  Plane, ShieldAlert, Gift, FileBarChart, Sparkles,
  Plus, Activity, CalendarCheck, BarChart3,
  Cake, Calendar, AlertTriangle, Briefcase,
  TrendingUp, Zap,
} from 'lucide-react';
import {
  Area, AreaChart, ResponsiveContainer, Tooltip,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';

// ─── Types (unchanged) ──────────────────────────────────────
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

interface ComplianceSummary { total: number; critical: number; high: number }

interface Birthday {
  id: string; firstName: string; lastName: string;
  department?: string; position?: string;
  day: number; dateOfBirth: string;
}

interface OnLeave {
  id: string; employeeId: string;
  firstName: string; lastName: string;
  empNumber: string; department?: string;
  leaveCode: string; leaveName: string;
  startDate: string; endDate: string;
  totalDays: number;
}

interface ExpiringContract {
  id: string; firstName: string; lastName: string;
  department?: string; position?: string;
  contractEndDate: string; daysLeft: number;
}

interface Holiday { date: string; name: string; type: 'regular' | 'special' }

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

  // Mini sparkline data from trend (for KPI cards)
  const sparkData = useMemo(() => trend.slice(-7), [trend]);
  const attendanceRate = stats && (stats.presentToday + stats.absentToday + stats.lateToday) > 0
    ? Math.round(stats.presentToday / (stats.presentToday + stats.absentToday + stats.lateToday) * 100)
    : null;

  return (
    <div className="space-y-7 animate-fade-in">
      {/* ── Hero / greeting ──────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-surface-200 bg-gradient-to-br from-white via-white to-primary-50/40 px-6 py-7 sm:px-8 sm:py-8 shadow-card">
        {/* Decorative ambient glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-accent-500/15 rounded-full blur-3xl" />

        <div className="relative flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-2xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                LIVE
              </span>
              <span className="text-xs text-surface-500">{today}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-surface-900 tracking-tight">
              {greeting}, <span className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">{user?.firstName}</span>
            </h1>
            <p className="text-sm text-surface-500 mt-1.5">
              Here's your workforce command center for today.
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
      </header>

      {/* ── Compliance alert banner (only if critical) ─ */}
      {compliance && compliance.critical > 0 && (
        <Link
          href="/dashboard/compliance"
          className="group block relative overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 p-4 hover:border-rose-300 hover:shadow-card-hover transition-all"
        >
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="relative flex items-center gap-4">
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-500/30">
              <ShieldAlert className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-rose-500 rounded-full" />
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

      {/* ── KPI cards (premium with sparklines) ──────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Employees"
          value={stats?.totalEmployees ?? 0}
          delta={stats ? `${stats.activeEmployees} active` : ''}
          icon={Users}
          accent="primary"
          loading={loading}
          href="/dashboard/employees"
          spark={sparkData}
        />
        <KpiCard
          label="New Applicants"
          value={stats?.newApplicants ?? 0}
          delta={`${stats?.totalApplicants ?? 0} in pipeline`}
          icon={UserPlus}
          accent="violet"
          loading={loading}
          href="/dashboard/applicants"
        />
        <KpiCard
          label="Present Today"
          value={stats?.presentToday ?? 0}
          delta={
            attendanceRate !== null
              ? `${attendanceRate}% attendance rate`
              : `${stats?.lateToday ?? 0} late · ${stats?.absentToday ?? 0} absent`
          }
          icon={CalendarCheck}
          accent="emerald"
          loading={loading}
          href="/dashboard/attendance"
          progress={attendanceRate ?? undefined}
        />
        <KpiCard
          label="Trainees"
          value={stats?.totalTrainees ?? 0}
          delta="In training programs"
          icon={GraduationCap}
          accent="amber"
          loading={loading}
          href="/dashboard/trainees"
        />
      </div>

      {/* ── Main content grid ────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Headcount trend chart */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-all">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="font-semibold text-surface-900">Headcount Trend</h3>
                <span className="badge-info text-2xs">12 mo</span>
              </div>
              <p className="text-xs text-surface-500 mt-1 ml-9">Active employees over time</p>
            </div>
            <Link href="/dashboard/analytics" className="btn-ghost text-xs">
              Analytics <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="h-56 bg-surface-50 rounded-xl animate-pulse" />
          ) : trend.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-surface-400 text-sm">
              <BarChart3 className="w-10 h-10 text-surface-200 mb-2" />
              No data yet — add employees to see trends
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="headcountArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="60%"  stopColor="#8b5cf6" stopOpacity={0.10} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="headcountStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#3b82f6" />
                    <stop offset="50%"  stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 12,
                    border: '1px solid #e4e4e7',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(8px)',
                  }}
                  labelStyle={{ color: '#71717a', fontSize: 11, marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="headcount"
                  stroke="url(#headcountStroke)"
                  strokeWidth={2.5}
                  fill="url(#headcountArea)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick actions */}
        <div className="relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-all">
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-400 to-transparent" />
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="font-semibold text-surface-900">Quick Actions</h3>
          </div>
          <div className="space-y-1">
            <QuickAction href="/dashboard/applicants/new" icon={UserPlus} label="New Applicant" />
            <QuickAction href="/dashboard/leave" icon={Plane} label="Review Leave Requests" />
            <QuickAction href="/dashboard/bonus/new" icon={Gift} label="Create Bonus Run" />
            <QuickAction href="/dashboard/gov-reports" icon={FileBarChart} label="Generate Gov Report" />
            <QuickAction href="/dashboard/training/new" icon={GraduationCap} label="Add Training Course" />
          </div>
        </div>
      </div>

      {/* ── Recent hires + Today at a glance ─────────── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="font-semibold text-surface-900">Recent Hires</h3>
            </div>
            <Link href="/dashboard/employees" className="btn-ghost text-xs">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-surface-50 rounded-lg animate-pulse" />)}
            </div>
          ) : recentHires.length === 0 ? (
            <EmptyMini icon={Users} text="No employees yet" />
          ) : (
            <div className="space-y-1">
              {recentHires.map(emp => (
                <Link
                  key={emp.id}
                  href={`/dashboard/employees/${emp.id}`}
                  className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-surface-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-soft">
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
                    <div className="text-xs text-surface-400 tabular-nums">
                      {new Date(emp.dateHired).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-surface-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <h3 className="font-semibold text-surface-900">Today at a Glance</h3>
          </div>
          <div className="space-y-3">
            <ActivityRow
              label="Attendance Rate"
              value={attendanceRate !== null ? `${attendanceRate}%` : '—'}
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

      {/* ── Birthdays + Holidays ─────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <WidgetCard
          icon={Cake}
          iconColor="from-pink-500 to-rose-600"
          title="Birthdays This Month"
          count={widgets?.birthdays.length ?? 0}
        >
          {widgets?.birthdays.length === 0 ? (
            <EmptyMini icon={Cake} text="No birthdays this month 🎂" />
          ) : (
            <div className="space-y-1">
              {widgets?.birthdays.slice(0, 6).map(b => (
                <div key={b.id} className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-xl hover:bg-surface-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-soft">
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
                  <div className="text-sm font-semibold text-pink-600 tabular-nums">
                    {new Date(b.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
        </WidgetCard>

        <WidgetCard
          icon={Calendar}
          iconColor="from-violet-500 to-purple-600"
          title="Upcoming Holidays"
          badge="PH"
        >
          {widgets?.holidays.length === 0 ? (
            <EmptyMini icon={Calendar} text="No upcoming holidays this year" />
          ) : (
            <div className="space-y-1">
              {widgets?.holidays.slice(0, 6).map(h => {
                const d = new Date(h.date);
                const daysAway = Math.ceil((d.getTime() - Date.now()) / 86400000);
                return (
                  <div key={h.date} className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-xl hover:bg-surface-50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200/60 flex flex-col items-center justify-center flex-shrink-0">
                      <div className="text-[10px] text-violet-600 font-semibold uppercase">
                        {d.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-sm font-bold text-violet-700 leading-none tabular-nums">
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
        </WidgetCard>
      </div>

      {/* ── On leave + Expiring contracts ────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">
        <WidgetCard
          icon={Plane}
          iconColor="from-blue-500 to-cyan-600"
          title="On Leave Today"
          link={{ href: '/dashboard/leave', label: 'All leaves' }}
        >
          {widgets?.onLeave.length === 0 ? (
            <EmptyMini icon={Plane} text="Everyone's at work today ✨" />
          ) : (
            <div className="space-y-1">
              {widgets?.onLeave.slice(0, 6).map(l => (
                <div key={l.id} className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-xl hover:bg-surface-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-soft">
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
        </WidgetCard>

        <WidgetCard
          icon={AlertTriangle}
          iconColor="from-amber-500 to-orange-600"
          title="Contracts Expiring Soon"
          badge={`${widgets?.expiringContracts.length ?? 0} in 30 days`}
          badgeColor="warning"
        >
          {widgets?.expiringContracts.length === 0 ? (
            <EmptyMini icon={Briefcase} text="No contracts expiring soon ✓" />
          ) : (
            <div className="space-y-1">
              {widgets?.expiringContracts.slice(0, 6).map(c => (
                <Link
                  key={c.id}
                  href={`/dashboard/employees/${c.id}`}
                  className="flex items-center gap-3 px-2 py-2 -mx-2 rounded-xl hover:bg-surface-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200/60">
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
                  } tabular-nums`}>
                    {c.daysLeft}d
                  </span>
                </Link>
              ))}
            </div>
          )}
        </WidgetCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────

function KpiCard({
  label, value, delta, icon: Icon, accent, loading, href, spark, progress,
}: {
  label: string;
  value: number | string;
  delta?: string;
  icon: any;
  accent: 'primary' | 'violet' | 'emerald' | 'amber';
  loading?: boolean;
  href?: string;
  spark?: Trend[];
  progress?: number;
}) {
  const accents = {
    primary: { gradient: 'from-primary-500 to-accent-600', tint: 'from-primary-50 via-white to-white', glow: 'group-hover:shadow-glow', bar: 'from-primary-500 to-accent-500' },
    violet:  { gradient: 'from-violet-500 to-purple-700', tint: 'from-violet-50 via-white to-white', glow: 'group-hover:shadow-glow-purple', bar: 'from-violet-500 to-purple-500' },
    emerald: { gradient: 'from-emerald-500 to-teal-600', tint: 'from-emerald-50 via-white to-white', glow: 'group-hover:shadow-[0_0_32px_rgba(16,185,129,0.25)]', bar: 'from-emerald-500 to-teal-500' },
    amber:   { gradient: 'from-amber-500 to-orange-600', tint: 'from-amber-50 via-white to-white', glow: 'group-hover:shadow-[0_0_32px_rgba(245,158,11,0.25)]', bar: 'from-amber-500 to-orange-500' },
  };
  const a = accents[accent];

  const Card = (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-surface-200 bg-gradient-to-br ${a.tint}
                  p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-surface-300 shadow-card hover:shadow-card-hover ${a.glow}`}
    >
      {/* Accent top bar */}
      <div className={`pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${a.bar} opacity-60`} />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shadow-lg shadow-black/[0.06]`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {href && (
          <ArrowUpRight className="w-4 h-4 text-surface-300 group-hover:text-surface-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-7 w-16 bg-surface-100 rounded animate-pulse" />
          <div className="h-3 w-24 bg-surface-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-1.5">
            <div className="text-3xl font-bold text-surface-900 tracking-tight tabular-nums">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {progress !== undefined && progress >= 90 && (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </div>
          <div className="text-xs text-surface-500 mt-1">{delta}</div>

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="mt-3 h-1 bg-surface-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${a.bar}`}
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          )}

          {/* Sparkline */}
          {spark && spark.length > 1 && progress === undefined && (
            <div className="mt-3 h-8 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spark}>
                  <defs>
                    <linearGradient id={`spark-${accent}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="headcount"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    fill={`url(#spark-${accent})`}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

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
      className="flex items-center gap-3 px-2.5 py-2 -mx-1 rounded-xl hover:bg-surface-50 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-surface-100 group-hover:bg-gradient-to-br group-hover:from-primary-500/10 group-hover:to-accent-500/10 group-hover:text-primary-600 flex items-center justify-center text-surface-600 transition-all border border-transparent group-hover:border-primary-200/50">
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm text-surface-700 font-medium flex-1">{label}</span>
      <ArrowRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
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
    emerald: 'from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-200/60',
    rose:    'from-rose-100 to-rose-50 text-rose-600 border-rose-200/60',
    violet:  'from-violet-100 to-violet-50 text-violet-600 border-violet-200/60',
    amber:   'from-amber-100 to-amber-50 text-amber-600 border-amber-200/60',
    surface: 'from-surface-100 to-surface-50 text-surface-500 border-surface-200',
  };
  return (
    <div className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-surface-50 transition-colors">
      <div className={`w-10 h-10 rounded-xl border bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-surface-900">{label}</div>
        {hint && <div className="text-xs text-surface-400 mt-0.5">{hint}</div>}
      </div>
      <div className="text-xl font-bold text-surface-900 tabular-nums">{value}</div>
    </div>
  );
}

function WidgetCard({
  icon: Icon, iconColor, title, count, badge, badgeColor, link, children,
}: {
  icon: any;
  iconColor: string;
  title: string;
  count?: number;
  badge?: string;
  badgeColor?: 'warning' | 'info';
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-6 shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${iconColor} flex items-center justify-center shadow-sm`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-semibold text-surface-900">{title}</h3>
        </div>
        {link && (
          <Link href={link.href} className="btn-ghost text-xs">
            {link.label} <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}
        {badge && (
          <span className={badgeColor === 'warning' ? 'badge-warning' : 'badge-info'}>
            {badge}
          </span>
        )}
        {count !== undefined && !badge && !link && (
          <span className="text-2xs font-semibold uppercase tracking-wider text-surface-400 tabular-nums">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyMini({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-center mb-2">
        <Icon className="w-4 h-4 text-surface-300" />
      </div>
      <p className="text-sm text-surface-400">{text}</p>
    </div>
  );
}
