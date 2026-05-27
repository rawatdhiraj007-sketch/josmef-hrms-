'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import {
  Users, UserPlus, GraduationCap, Clock, DollarSign, AlertCircle,
  TrendingUp, TrendingDown, CheckCircle, XCircle, ArrowRight,
  Calendar, Briefcase,
} from 'lucide-react';

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  totalApplicants: number;
  newApplicants: number;
  totalTrainees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  pendingClearance: number;
  pendingPayroll: number;
}

interface ChartData { label: string; value: string | number }
interface RecentHire { id: string; firstName: string; lastName: string; position: string; department: string; dateHired: string }
interface UpcomingEvent { type: string; title: string; date: string }

const COLORS = ['#3478ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [empByDept, setEmpByDept] = useState<ChartData[]>([]);
  const [empByStatus, setEmpByStatus] = useState<ChartData[]>([]);
  const [appByStatus, setAppByStatus] = useState<ChartData[]>([]);
  const [recentHires, setRecentHires] = useState<RecentHire[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats').catch(() => ({ data: null })),
      api.get('/dashboard/charts/employees-by-department').catch(() => ({ data: [] })),
      api.get('/dashboard/charts/employees-by-status').catch(() => ({ data: [] })),
      api.get('/dashboard/charts/applicants-by-status').catch(() => ({ data: [] })),
      api.get('/dashboard/recent-hires').catch(() => ({ data: [] })),
      api.get('/dashboard/upcoming-events').catch(() => ({ data: [] })),
    ]).then(([s, d, st, ap, rh, ev]) => {
      setStats(s.data);
      setEmpByDept(d.data);
      setEmpByStatus(st.data);
      setAppByStatus(ap.data);
      setRecentHires(rh.data);
      setEvents(ev.data);
    }).finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const s = stats || {} as Stats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Good {greeting()}, {user?.firstName}</h1>
        <p className="text-gray-500 mt-1">Here&apos;s your workforce overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPI icon={Users} label="Active Employees" value={s.activeEmployees} color="bg-blue-500" onClick={() => router.push('/dashboard/employees')} />
        <KPI icon={UserPlus} label="New Applicants" value={s.newApplicants} color="bg-emerald-500" onClick={() => router.push('/dashboard/applicants')} />
        <KPI icon={GraduationCap} label="Trainees" value={s.totalTrainees} color="bg-violet-500" onClick={() => router.push('/dashboard/trainees')} />
        <KPI icon={Clock} label="Present Today" value={s.presentToday} sub={`${s.lateToday} late • ${s.absentToday} absent`} color="bg-amber-500" onClick={() => router.push('/dashboard/attendance')} />
        <KPI icon={DollarSign} label="Pending Payroll" value={s.pendingPayroll} color="bg-rose-500" onClick={() => router.push('/dashboard/payroll')} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Employees by Department */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Employees by Department</h2>
          {empByDept.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {empByDept.map((item, i) => {
                const max = Math.max(...empByDept.map((d) => Number(d.value)));
                const pct = max > 0 ? (Number(item.value) / max) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{item.label || 'Unassigned'}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Applicants by Status */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Applicant Pipeline</h2>
          {appByStatus.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="space-y-3">
              {appByStatus.map((item, i) => {
                const max = Math.max(...appByStatus.map((d) => Number(d.value)));
                const pct = max > 0 ? (Number(item.value) / max) * 100 : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{(item.label || '').replace(/_/g, ' ')}</span>
                      <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                    </div>
                    <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Employee Status Breakdown */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Status</h2>
          {empByStatus.length === 0 ? (
            <p className="text-gray-400 text-sm py-8 text-center">No data yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {empByStatus.map((item, i) => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <div>
                    <p className="text-xs text-gray-500">{(item.label || '').replace(/_/g, ' ')}</p>
                    <p className="font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Hires + Events */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Hires</h2>
              <button onClick={() => router.push('/dashboard/employees')} className="text-sm text-brand-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {recentHires.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent hires</p>
            ) : (
              <div className="space-y-3">
                {recentHires.slice(0, 5).map((h) => (
                  <div key={h.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm">
                        {h.firstName[0]}{h.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{h.firstName} {h.lastName}</p>
                        <p className="text-xs text-gray-400">{h.position}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{h.dateHired?.split('T')[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
            {events.length === 0 ? (
              <p className="text-gray-400 text-sm">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map((ev, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${ev.type === 'contract_expiry' ? 'bg-amber-100' : 'bg-red-100'}`}>
                      {ev.type === 'contract_expiry' ? <Calendar className="w-4 h-4 text-amber-600" /> : <Briefcase className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{ev.title}</p>
                      <p className="text-xs text-gray-400">{ev.date?.split('T')[0]}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Add Applicant', icon: UserPlus, href: '/dashboard/applicants/new' },
            { label: 'Add Employee', icon: Users, href: '/dashboard/employees/new' },
            { label: 'Add Trainee', icon: GraduationCap, href: '/dashboard/trainees/new' },
            { label: 'Attendance', icon: Clock, href: '/dashboard/attendance' },
            { label: 'Run Payroll', icon: DollarSign, href: '/dashboard/payroll' },
            { label: 'Exit Clearance', icon: AlertCircle, href: '/dashboard/exit-clearance/new' },
          ].map((a) => (
            <button key={a.label} onClick={() => router.push(a.href)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-sm font-medium text-gray-700">
              <a.icon className="w-5 h-5 text-brand-600" />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, sub, color, onClick }: {
  icon: any; label: string; value: number; sub?: string; color: string; onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className="card p-4 cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`${color} w-10 h-10 rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value ?? 0}</p>
          <p className="text-xs text-gray-500">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}
