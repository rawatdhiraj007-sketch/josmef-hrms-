'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  BarChart3, TrendingUp, Users, Plane, Clock, Building2,
  Sparkles, ArrowUpRight,
} from 'lucide-react';
import {
  Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface Overview {
  trend:      { month: string; headcount: number }[];
  cost:       { month: string; gross: number; net: number; tax: number }[];
  leave:      { code: string; name: string; daysApproved: number; daysPending: number; requestCount: number }[];
  attendance: { type: string; count: number }[];
  dept:       { department: string; headcount: number }[];
  funnel:     { status: string; count: number }[];
}

// NextNova chart palette — indigo/violet/blue accents
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// Reusable premium tooltip style
const tooltipStyle = {
  fontSize: 12,
  borderRadius: 12,
  border: '1px solid #e4e4e7',
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  background: 'rgba(255,255,255,0.95)',
  backdropFilter: 'blur(8px)',
  padding: '8px 12px',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-7 animate-fade-in">
        <HeaderSkeleton />
        <div className="grid lg:grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 rounded-2xl border border-surface-200 bg-white shadow-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-surface-50 border border-surface-200 flex items-center justify-center mb-4">
          <BarChart3 className="w-7 h-7 text-surface-300" />
        </div>
        <h3 className="text-lg font-semibold text-surface-900">Couldn't load analytics</h3>
        <p className="text-sm text-surface-500 mt-1">Please refresh the page or try again later.</p>
      </div>
    );
  }

  // Compute totals for "command center" feel
  const totalHires = data.trend.length > 0 ? data.trend[data.trend.length - 1]?.headcount ?? 0 : 0;
  const totalCost  = data.cost.reduce((s, c) => s + (c.gross ?? 0), 0);
  const totalLeave = data.leave.reduce((s, l) => s + (Number(l.daysApproved) ?? 0), 0);
  const totalApps  = data.funnel.reduce((s, f) => s + (f.count ?? 0), 0);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* ─── Hero header ─── */}
      <header className="relative overflow-hidden rounded-2xl border border-surface-200 bg-gradient-to-br from-white via-white to-accent-500/[0.04] px-6 py-7 sm:px-8 shadow-card">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-primary-300/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-accent-500/15 rounded-full blur-3xl" />

        <div className="relative flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-2xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-primary-200">
                <Sparkles className="w-2.5 h-2.5" />
                ANALYTICS
              </span>
              <span className="text-xs text-surface-500">Real-time HR metrics</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-surface-900 tracking-tight">
              <span className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">
                Workforce intelligence
              </span>
            </h1>
            <p className="text-sm text-surface-500 mt-1.5">
              Live insights across recruitment, payroll, attendance, and compliance.
            </p>
          </div>
        </div>

        {/* Summary stats bar */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-200/70">
          <SummaryStat label="Active Headcount"  value={totalHires.toLocaleString()} />
          <SummaryStat label="Total Payroll (12m)" value={`₱${(totalCost / 1000).toFixed(0)}k`} />
          <SummaryStat label="Leave Days Used"    value={totalLeave.toFixed(0)} />
          <SummaryStat label="Applicants"         value={totalApps.toLocaleString()} />
        </div>
      </header>

      {/* ─── Chart grid ─── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* 1. Headcount trend (AreaChart) */}
        <ChartCard
          title="Headcount Trend"
          subtitle="Last 12 months"
          icon={Users}
          iconGradient="from-primary-500 to-accent-600"
        >
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="60%"  stopColor="#8b5cf6" stopOpacity={0.10} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="trendStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"  stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={tooltipStyle as any}
              />
              <Area
                type="monotone"
                dataKey="headcount"
                stroke="url(#trendStroke)"
                strokeWidth={2.5}
                fill="url(#trendArea)"
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Payroll cost (Bar) */}
        <ChartCard
          title="Payroll Cost"
          subtitle="Gross · Net · Tax (PHP)"
          icon={TrendingUp}
          iconGradient="from-emerald-500 to-teal-600"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.cost} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="grossBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
                <linearGradient id="netBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="taxBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#c2410c" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} width={36}
                tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle as any}
                cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                formatter={(v: any) => `₱${Number(v).toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#71717a', paddingTop: 8 }} iconType="circle" iconSize={8} />
              <Bar dataKey="gross" fill="url(#grossBar)" name="Gross" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="net"   fill="url(#netBar)"   name="Net"   radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="tax"   fill="url(#taxBar)"   name="Tax"   radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Leave usage */}
        <ChartCard
          title="Leave Usage"
          subtitle="By leave type this year"
          icon={Plane}
          iconGradient="from-blue-500 to-cyan-600"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.leave} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="approvedBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="pendingBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f97316" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="code" tick={{ fontSize: 11, fill: '#71717a', fontWeight: 600 }} axisLine={false} tickLine={false} width={52} />
              <Tooltip contentStyle={tooltipStyle as any} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#71717a', paddingTop: 8 }} iconType="circle" iconSize={8} />
              <Bar dataKey="daysApproved" fill="url(#approvedBar)" name="Approved" radius={[0, 6, 6, 0]} />
              <Bar dataKey="daysPending"  fill="url(#pendingBar)"  name="Pending"  radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Attendance breakdown (Pie) */}
        <ChartCard
          title="Attendance Breakdown"
          subtitle="This month"
          icon={Clock}
          iconGradient="from-violet-500 to-purple-600"
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.attendance}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.attendance.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle as any} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#71717a', paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="capitalize text-surface-700">{value.toString().replace('_', ' ')}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Department distribution */}
        <ChartCard
          title="Department Distribution"
          subtitle="Active employees"
          icon={Building2}
          iconGradient="from-pink-500 to-rose-600"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.dept} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="deptBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="department" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={tooltipStyle as any} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
              <Bar dataKey="headcount" fill="url(#deptBar)" radius={[0, 6, 6, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 6. Applicant funnel (Pie) */}
        <ChartCard
          title="Applicant Funnel"
          subtitle="Current pipeline"
          icon={Users}
          iconGradient="from-amber-500 to-orange-600"
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.funnel}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.funnel.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle as any} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#71717a', paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="capitalize text-surface-700">{value.toString().replace('_', ' ')}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────

function ChartCard({
  title, subtitle, icon: Icon, iconGradient, children,
}: {
  title: string;
  subtitle: string;
  icon: any;
  iconGradient: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-surface-200 bg-white shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
      {/* Top accent hairline */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg shadow-black/[0.06]`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">{title}</h3>
            <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-surface-300 group-hover:text-surface-600 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
      </div>

      {/* Chart body */}
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl md:text-2xl font-bold text-surface-900 tracking-tight tabular-nums bg-gradient-to-br from-surface-900 via-surface-800 to-primary-700 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-2xs font-semibold uppercase tracking-wider text-surface-400 mt-1">
        {label}
      </div>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-200 bg-white p-6 shadow-card">
      <div className="h-7 w-72 bg-surface-100 rounded animate-pulse mb-3" />
      <div className="h-4 w-96 bg-surface-100 rounded animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-200/70">
        {[1, 2, 3, 4].map(i => (
          <div key={i}>
            <div className="h-6 w-20 bg-surface-100 rounded animate-pulse mb-2" />
            <div className="h-3 w-24 bg-surface-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
