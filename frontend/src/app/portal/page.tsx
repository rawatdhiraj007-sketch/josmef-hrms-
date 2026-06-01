'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Megaphone, Sun, Calendar as CalendarIcon, Sparkles, Activity, Users,
  Award, MoreHorizontal, MessageSquare, User, ListChecks, Plane, Clock,
  Briefcase, ChevronRight, AlertCircle,
} from 'lucide-react';

import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import FlipCounter from '@/components/portal/FlipCounter';

const LS_CHECKIN = 'nn:checkin';

interface MeInfo {
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  employmentStatus?: string;
  dateHired?: string;
  contractEndDate?: string;
  employeeId?: string;
  email?: string;
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
  leaveType: { code: string; name: string };
}

type SubTab = 'overview' | 'dashboard' | 'calendar' | 'delegation';

export default function PortalHome() {
  const { user } = useAuth();
  const { workspace } = useWorkspace();

  const [me, setMe] = useState<MeInfo | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [requests, setRequests] = useState<LeaveReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtab, setSubtab] = useState<SubTab>('overview');

  // Check-in state — drives the live "In" clock on the profile card
  const [checkInAt, setCheckInAt] = useState<string | null>(null);

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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Sync with the global CheckInWidget state
  useEffect(() => {
    function sync() {
      try {
        const raw = localStorage.getItem(LS_CHECKIN);
        if (!raw) { setCheckInAt(null); return; }
        const parsed = JSON.parse(raw);
        if (parsed?.date === new Date().toISOString().slice(0, 10) && parsed.checkInAt && !parsed.checkOutAt) {
          setCheckInAt(parsed.checkInAt);
        } else {
          setCheckInAt(null);
        }
      } catch { setCheckInAt(null); }
    }
    sync();
    const id = setInterval(sync, 1000);
    window.addEventListener('storage', sync);
    return () => { clearInterval(id); window.removeEventListener('storage', sync); };
  }, []);

  // Compose fallback identity data from auth user when /portal/me hasn't returned yet
  const firstName = me?.firstName ?? user?.firstName ?? 'There';
  const lastName  = me?.lastName ?? user?.lastName ?? '';
  const fullName  = `${firstName} ${lastName}`.trim();
  const empId     = me?.employeeId ?? (user as any)?.employeeId ?? '—';
  const position  = me?.position ?? 'Team Member';
  const department = me?.department;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-5 -mt-2 sm:mt-0">
      {/* ── Sub-tabs (Zoho People style) ── */}
      <div className="bg-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200 sticky top-0 z-10">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {([
            { id: 'overview',   label: 'Overview' },
            { id: 'dashboard',  label: 'Dashboard' },
            { id: 'calendar',   label: 'Calendar' },
            { id: 'delegation', label: 'Delegation' },
          ] as { id: SubTab; label: string }[]).map((t) => {
            const active = subtab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubtab(t.id)}
                className={`relative px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors ${
                  active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
                {active && <span aria-hidden className="absolute left-3 right-3 -bottom-px h-0.5 bg-blue-600 rounded-full" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ─────────── OVERVIEW TAB ─────────── */}
      {subtab === 'overview' && (
        <>
          {/* Cover banner */}
          <div className="relative h-40 sm:h-48 lg:h-56 rounded-2xl overflow-hidden shadow-card">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(15,42,30,0.75), rgba(15,42,30,0.55)), radial-gradient(circle at 20% 20%, rgba(74,222,128,0.4), transparent 50%), radial-gradient(circle at 80% 60%, rgba(34,197,94,0.35), transparent 55%), linear-gradient(135deg, #14532d, #166534, #15803d, #22c55e)',
              }}
            />
            {/* Decorative leafy pattern via SVG noise dots */}
            <div aria-hidden className="absolute inset-0 opacity-30" style={{
              backgroundImage:
                "radial-gradient(circle at 12% 30%, rgba(255,255,255,0.18) 1px, transparent 2px), radial-gradient(circle at 38% 70%, rgba(255,255,255,0.12) 1px, transparent 2px), radial-gradient(circle at 72% 28%, rgba(255,255,255,0.16) 1px, transparent 2px), radial-gradient(circle at 88% 75%, rgba(255,255,255,0.10) 1px, transparent 2px)",
              backgroundSize: '160px 160px',
            }} />
            <button
              type="button"
              className="absolute top-3 right-3 w-8 h-8 rounded-md bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-soft"
              aria-label="Banner options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Main grid: left profile column + right activity */}
          <div className="grid lg:grid-cols-[340px_1fr] gap-4 lg:gap-5 -mt-12 lg:-mt-14">
            {/* ── Left column: profile cards ── */}
            <div className="space-y-4">
              {/* Profile card with overlapping avatar */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 pt-6">
                <div className="flex flex-col items-center text-center -mt-16">
                  <Avatar name={fullName} size="xl" className="ring-4 ring-white shadow-lg" />
                  <div className="mt-3 px-2">
                    <div className="text-sm font-semibold text-slate-900 leading-tight truncate max-w-[260px]">
                      <span className="font-mono text-slate-500 text-xs mr-1">{empId} -</span>
                      {fullName}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{position}</div>
                  </div>
                  {/* Live status + flip clock */}
                  <div className="mt-4 w-full">
                    {checkInAt ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <span className="relative flex items-center justify-center w-2 h-2">
                            <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
                            <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </span>
                          In
                        </div>
                        <FlipCounter since={checkInAt} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Not checked in
                        </div>
                        <FlipCounter mode="clock" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reporting To */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-4">
                <div className="text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Reporting To
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name="HR Manager" size="md" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">HR Manager</div>
                    <div className="text-2xs text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      In
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <KpiTile
                  label="Leave balance"
                  value={String(balances.reduce((acc, b) => acc + Number(b.remaining || 0), 0))}
                  unit="days"
                  icon={Plane}
                />
                <KpiTile
                  label="Pending"
                  value={String(requests.filter((r) => r.status === 'pending').length)}
                  unit="requests"
                  icon={Clock}
                />
              </div>
            </div>

            {/* ── Right column: activity feed ── */}
            <div className="space-y-4">
              {/* Activity tabs card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-card">
                <div className="px-4 sm:px-5 pt-4 border-b border-slate-100">
                  <div className="flex items-center gap-1 overflow-x-auto -mb-px">
                    {[
                      { id: 'activities', label: 'Activities', icon: Activity },
                      { id: 'feeds',      label: 'Feeds',      icon: Megaphone },
                      { id: 'profile',    label: 'Profile',    icon: User },
                      { id: 'approvals',  label: 'Approvals',  icon: ListChecks },
                      { id: 'leave',      label: 'Leave',      icon: Plane },
                      { id: 'attendance', label: 'Attendance', icon: Clock },
                      { id: 'time',       label: 'Time Logs',  icon: Briefcase },
                    ].map((t, i) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                          i === 0 ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        <t.icon className="w-3.5 h-3.5" />
                        {t.label}
                        {i === 0 && (
                          <span aria-hidden className="absolute left-2 right-2 -bottom-px h-0.5 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    ))}
                    <button className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Greeting card with sun illustration */}
                <div className="px-4 sm:px-5 py-4 border-b border-slate-100">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/60">
                    <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <div className="text-xs font-bold tracking-tight" style={{ color: '#3B82F6' }}>{workspace.companyName.slice(0, 4)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-900">
                        {greeting} <span className="font-normal">{fullName}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">Have a productive day!</div>
                    </div>
                    <div className="text-4xl pl-2" aria-hidden>☀️</div>
                  </div>
                </div>

                {/* Announcement feed items */}
                <ul className="divide-y divide-slate-100">
                  {ANNOUNCEMENTS.map((a, i) => (
                    <li key={i} className="px-4 sm:px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-md ${a.tone} flex items-center justify-center flex-shrink-0`}>
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-2xs text-slate-500 mb-0.5">
                            <span className="font-semibold text-slate-700">HR</span>
                            <span className="text-slate-400"> · has posted an announcement.</span>
                          </div>
                          <div className="text-sm font-semibold text-slate-900 leading-snug">{a.title}</div>
                          {a.body && <div className="text-xs text-slate-600 mt-1 line-clamp-2">{a.body}</div>}
                          <div className="text-2xs text-slate-400 mt-1.5">{a.timeAgo}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─────────── DASHBOARD TAB ─────────── */}
      {subtab === 'dashboard' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
            <h2 className="text-lg font-bold text-slate-900">Your dashboard</h2>
            <p className="text-sm text-slate-500 mt-1">High-level workforce metrics for the current period.</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
              <DashTile label="Active" value="242" sub="Total employees" icon={Users} />
              <DashTile label="On leave today" value="8" sub="Auto-updated" icon={Plane} />
              <DashTile label="Trainings due" value="14" sub="Mandatory" icon={Award} />
              <DashTile label="Pending approvals" value="3" sub="Awaiting you" icon={ListChecks} />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Your leave summary</h3>
            {loading ? (
              <div className="text-sm text-slate-500">Loading…</div>
            ) : balances.length === 0 ? (
              <div className="text-sm text-slate-500">No leave balances yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {balances.slice(0, 8).map((b) => (
                  <div key={b.leaveType.code} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <div className="text-2xs font-semibold uppercase tracking-wider text-slate-500">{b.leaveType.code}</div>
                    <div className="text-xl font-bold tabular-nums text-slate-900 mt-1">{b.remaining}</div>
                    <div className="text-2xs text-slate-500">of {b.entitled} {b.leaveType.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────── CALENDAR TAB ─────────── */}
      {subtab === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-slate-900">Calendar</h2>
          </div>
          {requests.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No upcoming events this month.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {requests.map((r) => (
                <li key={r.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-primary-300 transition-colors">
                  <div className="w-10 h-10 rounded-md bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
                    <Plane className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900">{r.leaveType?.name ?? 'Leave'}</div>
                    <div className="text-xs text-slate-500 mt-0.5 tabular-nums">
                      {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()} · {Number(r.totalDays)} day(s)
                    </div>
                  </div>
                  <span className={`text-2xs font-semibold px-2 py-0.5 rounded ${
                    r.status === 'approved'  ? 'bg-emerald-50 text-emerald-700' :
                    r.status === 'rejected'  ? 'bg-rose-50 text-rose-700' :
                    r.status === 'pending'   ? 'bg-amber-50 text-amber-700' :
                                               'bg-slate-100 text-slate-700'
                  }`}>{r.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ─────────── DELEGATION TAB ─────────── */}
      {subtab === 'delegation' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-slate-900">Delegation</h2>
          </div>
          <div className="space-y-4">
            {/* You */}
            <div className="bg-primary-50/60 border border-primary-200/60 rounded-lg p-4 flex items-center gap-3">
              <Avatar name={fullName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">{fullName} <span className="text-2xs font-normal text-primary-700 ml-1">· You</span></div>
                <div className="text-xs text-slate-500">{position}{department && ` · ${department}`}</div>
              </div>
            </div>

            {/* Reports To (arrow up) */}
            <div className="pl-5 border-l-2 border-dashed border-slate-200 ml-5">
              <div className="text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Reports to</div>
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
                <Avatar name="HR Manager" size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900">HR Manager</div>
                  <div className="text-xs text-slate-500">Human Resources</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
              <span>Delegation hierarchy is preview-only — full reporting structure will populate once managers are set in employee records.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function KpiTile({
  label, value, unit, icon: Icon,
}: { label: string; value: string; unit?: string; icon: any }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-primary-600" />
        <span className="text-2xs uppercase tracking-wider text-slate-500 font-semibold truncate">{label}</span>
      </div>
      <div className="text-lg font-bold text-slate-900 tabular-nums">{value}</div>
      {unit && <div className="text-2xs text-slate-400">{unit}</div>}
    </div>
  );
}

function DashTile({
  label, value, sub, icon: Icon,
}: { label: string; value: string; sub: string; icon: any }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2 text-slate-500">
        <Icon className="w-4 h-4 text-primary-600" />
        <span className="text-2xs uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
      <div className="text-2xs text-slate-500 mt-0.5">{sub}</div>
    </div>
  );
}

// ─── Static announcement data — replace with real /announcements API when wired ─
const ANNOUNCEMENTS = [
  {
    title: 'Family Connect — Open enrolment closes next Friday',
    body: 'Add eligible family members to your medical plan before the cut-off.',
    tone: 'bg-blue-50 text-blue-700',
    timeAgo: '2 hours ago',
  },
  {
    title: 'Q2 Town Hall — Recording now available',
    body: 'Watch the replay on the Resources page.',
    tone: 'bg-violet-50 text-violet-700',
    timeAgo: 'yesterday',
  },
  {
    title: 'Performance Management cycle for 2026 opens June 15',
    body: 'Goals & objectives setting begins. Calendar invitation will be sent shortly.',
    tone: 'bg-emerald-50 text-emerald-700',
    timeAgo: '2 days ago',
  },
  {
    title: 'New employee benefits portal — Access via your dashboard',
    body: 'Explore wellness perks, learning credits, and partner discounts.',
    tone: 'bg-amber-50 text-amber-700',
    timeAgo: '3 days ago',
  },
];

// Suppress unused import warnings
void Sparkles;
void Sun;
void MessageSquare;
