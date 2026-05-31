'use client';

import { useState } from 'react';
import {
  Users, BarChart3, DollarSign, Sparkles, Send, MoreHorizontal,
  Search, ArrowUpRight, ArrowDownRight, Bell, Settings,
  Stethoscope, Briefcase, Plane, Award,
} from 'lucide-react';
import Logo from '@/components/Logo';

type Tab = 'employees' | 'analytics' | 'payroll' | 'ai';

/**
 * Pixel-perfect mock of the NextNova dashboard, embedded on the
 * landing page so visitors can see the product without signing up.
 *
 * Purely visual — no API calls, no real data, no routing into the
 * actual dashboard. Click handlers on the tabs swap the inner view
 * but everything is canned content.
 */
export default function DashboardPreview() {
  const [tab, setTab] = useState<Tab>('employees');

  return (
    <div className="relative">
      {/* Subtle outer glow under the frame */}
      <div aria-hidden className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary-200/40 via-accent-100/30 to-transparent blur-3xl" />

      {/* Browser chrome frame */}
      <div className="relative rounded-2xl bg-white border border-slate-200 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.25)] overflow-hidden">
        {/* Window controls bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-slate-50/80">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <div className="mx-auto px-3 py-0.5 text-2xs text-slate-500 bg-white border border-slate-200 rounded-md">
            app.nextnova.ai / dashboard
          </div>
        </div>

        {/* App body — sidebar + main */}
        <div className="grid grid-cols-[180px_1fr] min-h-[520px] bg-slate-50/30">
          {/* Sidebar */}
          <aside className="border-r border-slate-200 bg-white px-3 py-4 flex flex-col gap-1">
            <div className="px-2 pb-3 mb-2 border-b border-slate-100">
              <Logo width={100} />
            </div>
            <SidebarItem icon={BarChart3} label="Overview" />
            <SidebarItem icon={Users}     label="Employees" active={tab === 'employees'} onClick={() => setTab('employees')} />
            <SidebarItem icon={BarChart3} label="Analytics" active={tab === 'analytics'} onClick={() => setTab('analytics')} />
            <SidebarItem icon={DollarSign} label="Payroll"  active={tab === 'payroll'}   onClick={() => setTab('payroll')} />
            <SidebarItem icon={Plane}     label="Leave" />
            <SidebarItem icon={Award}     label="Licenses" />
            <SidebarItem icon={Briefcase} label="Shifts" />
            <div className="mt-auto">
              <SidebarItem icon={Sparkles} label="AI Co-pilot" active={tab === 'ai'} onClick={() => setTab('ai')} accent />
            </div>
          </aside>

          {/* Main */}
          <main className="flex flex-col min-w-0">
            {/* Topbar */}
            <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-200 bg-white">
              <div className="text-xs text-slate-500">Dashboard <span className="text-slate-300 mx-1">/</span> <span className="text-slate-900 font-medium capitalize">{tab}</span></div>
              <div className="flex-1" />
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-2xs text-slate-500">
                <Search className="w-3 h-3" /> Search…
              </div>
              <button className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <Bell className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <Settings className="w-3.5 h-3.5" />
              </button>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-2xs font-bold flex items-center justify-center">M</div>
            </div>

            {/* Tab content */}
            <div className="flex-1 p-5">
              {tab === 'employees'  && <EmployeesView />}
              {tab === 'analytics'  && <AnalyticsView />}
              {tab === 'payroll'    && <PayrollView />}
              {tab === 'ai'         && <AiView />}
            </div>
          </main>
        </div>
      </div>

      {/* Tab pill list — under the preview, mobile-friendly */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <TabPill active={tab === 'employees'} onClick={() => setTab('employees')} icon={Users}      label="Employees" />
        <TabPill active={tab === 'analytics'} onClick={() => setTab('analytics')} icon={BarChart3}  label="Analytics" />
        <TabPill active={tab === 'payroll'}   onClick={() => setTab('payroll')}   icon={DollarSign} label="Payroll" />
        <TabPill active={tab === 'ai'}        onClick={() => setTab('ai')}        icon={Sparkles}   label="AI Assistant" />
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function SidebarItem({
  icon: Icon, label, active, onClick, accent,
}: { icon: any; label: string; active?: boolean; onClick?: () => void; accent?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
        active
          ? accent
            ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 border border-primary-200'
            : 'bg-primary-50 text-primary-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function TabPill({
  icon: Icon, label, active, onClick,
}: { icon: any; label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        active
          ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white shadow-soft'
          : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

// ─── Employees view ─────────────────────────────────────────────
function EmployeesView() {
  const rows = [
    { name: 'Maria Cruz',     role: 'Registered Nurse',  dept: 'ICU',         status: 'Active',  tone: 'success' as const },
    { name: 'James Reyes',    role: 'Resident Physician', dept: 'Emergency',  status: 'Active',  tone: 'success' as const },
    { name: 'Patricia Tan',   role: 'Pharmacist',         dept: 'Pharmacy',   status: 'On leave', tone: 'warning' as const },
    { name: 'Antonio Lopez',  role: 'Med Tech',           dept: 'Laboratory', status: 'Active',  tone: 'success' as const },
    { name: 'Sofia Mendoza',  role: 'Physical Therapist', dept: 'Rehab',      status: 'Active',  tone: 'success' as const },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Employees</div>
          <div className="text-2xs text-slate-500">242 active · 8 on leave</div>
        </div>
        <button className="text-2xs bg-gradient-to-br from-primary-600 to-accent-600 text-white px-3 py-1.5 rounded-md font-semibold">+ Add</button>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 text-slate-500 text-2xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Employee</th>
              <th className="text-left px-3 py-2 font-semibold hidden sm:table-cell">Dept</th>
              <th className="text-left px-3 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-white text-2xs font-bold flex items-center justify-center">
                      {r.name[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{r.name}</div>
                      <div className="text-2xs text-slate-500">{r.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-slate-600 hidden sm:table-cell">{r.dept}</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-medium ${
                    r.tone === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${r.tone === 'success' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Analytics view ─────────────────────────────────────────────
function AnalyticsView() {
  const bars = [42, 58, 49, 73, 65, 81, 70, 88, 76, 92, 84, 95];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <KpiTile label="Active headcount" value="242" delta="+4.2%" up />
        <KpiTile label="Avg attendance"   value="94%" delta="+1.8%" up />
        <KpiTile label="Pending leaves"   value="7"   delta="−2"    />
      </div>
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-semibold text-slate-900">Headcount growth</div>
            <div className="text-2xs text-slate-500">Last 12 months</div>
          </div>
          <div className="text-2xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">+18% YoY</div>
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-gradient-to-t from-primary-500 to-accent-500 origin-bottom"
                style={{
                  height: `${h}%`,
                  animation: `nn-bar-grow 0.6s ${i * 0.04}s ease-out backwards`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiTile({ label, value, delta, up }: { label: string; value: string; delta: string; up?: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="text-2xs text-slate-500 uppercase tracking-wider font-semibold">{label}</div>
      <div className="text-lg font-bold text-slate-900 tracking-tight mt-1 tabular-nums">{value}</div>
      <div className={`text-2xs font-semibold mt-0.5 flex items-center gap-0.5 ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {delta}
      </div>
    </div>
  );
}

// ─── Payroll view ───────────────────────────────────────────────
function PayrollView() {
  const lines = [
    { label: 'Basic Pay',           value: '₱ 4,520,000.00' },
    { label: 'Overtime',            value: '₱   312,400.00' },
    { label: 'Holiday Pay',         value: '₱   148,200.00' },
    { label: '13th-Month Accrual',  value: '₱   376,666.67' },
  ];
  const deductions = [
    { label: 'SSS',          value: '₱ 89,420.00' },
    { label: 'PhilHealth',   value: '₱ 67,800.00' },
    { label: 'Pag-IBIG',     value: '₱ 24,200.00' },
    { label: 'Withholding',  value: '₱ 412,500.00' },
  ];
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-semibold text-slate-900">Current payroll run</div>
            <div className="text-2xs text-slate-500">Pay period · May 15–31, 2026</div>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-2xs font-semibold">
            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" /> Processing
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Earnings</div>
            <div className="space-y-1.5">
              {lines.map((l) => (
                <div key={l.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{l.label}</span>
                  <span className="font-mono text-slate-900 tabular-nums">{l.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deductions</div>
            <div className="space-y-1.5">
              {deductions.map((l) => (
                <div key={l.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{l.label}</span>
                  <span className="font-mono text-rose-700 tabular-nums">−{l.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-900">Net payroll</span>
          <span className="font-mono text-base font-bold text-emerald-700 tabular-nums">₱ 4,762,946.67</span>
        </div>
      </div>
    </div>
  );
}

// ─── AI Assistant view ─────────────────────────────────────────
function AiView() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_220px] gap-3">
      {/* Chat */}
      <div className="bg-white border border-slate-200 rounded-lg flex flex-col min-h-[300px]">
        <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 text-xs">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold text-slate-900">NextNova AI</span>
          <span className="text-2xs text-slate-400">· Advisory only</span>
        </div>
        <div className="flex-1 p-3 space-y-2.5">
          <ChatBubble role="user">Who has expired licenses this month?</ChatBubble>
          <ChatBubble role="ai">
            <span className="block">Found <strong>4 expired</strong> and <strong>9 expiring within 7 days</strong>.</span>
            <ul className="mt-2 space-y-1.5">
              <li className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded">
                <Stethoscope className="w-3 h-3 text-rose-600" />
                <span className="text-2xs"><strong>Maria Cruz</strong> · PRC RN · expired 14 days ago</span>
              </li>
              <li className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded">
                <Stethoscope className="w-3 h-3 text-amber-600" />
                <span className="text-2xs"><strong>James Reyes</strong> · PRC MD · expires in 3 days</span>
              </li>
              <li className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded">
                <Stethoscope className="w-3 h-3 text-amber-600" />
                <span className="text-2xs"><strong>Patricia Tan</strong> · PRC Pharmacist · expires in 5 days</span>
              </li>
            </ul>
          </ChatBubble>
        </div>
        <div className="px-3 py-2 border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5">
            <input
              type="text" disabled value="Ask anything about your business…"
              className="flex-1 bg-transparent text-xs outline-none text-slate-400"
            />
            <button className="w-5 h-5 rounded bg-gradient-to-br from-primary-600 to-accent-600 text-white flex items-center justify-center">
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Side suggestions */}
      <div className="space-y-2">
        <SuggestionPill>Generate executive brief</SuggestionPill>
        <SuggestionPill>Pending leave requests</SuggestionPill>
        <SuggestionPill>Training completion rate</SuggestionPill>
        <SuggestionPill>Health score breakdown</SuggestionPill>
      </div>
    </div>
  );
}

function ChatBubble({ role, children }: { role: 'user' | 'ai'; children: React.ReactNode }) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-gradient-to-br from-primary-600 to-accent-600 text-white px-2.5 py-1.5 rounded-lg rounded-br-sm text-xs">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500/15 to-accent-500/15 border border-primary-200/50 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-3 h-3 text-primary-600" />
      </div>
      <div className="max-w-[85%] bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-lg rounded-tl-sm text-xs text-slate-800">{children}</div>
    </div>
  );
}

function SuggestionPill({ children }: { children: React.ReactNode }) {
  return (
    <button className="w-full text-left text-2xs bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50/40 text-slate-700 px-2.5 py-2 rounded-md transition-colors flex items-center gap-1.5">
      <Sparkles className="w-3 h-3 text-primary-500" />
      <span className="truncate">{children}</span>
    </button>
  );
}

// Suppress unused import warning when only some icons are used
void MoreHorizontal;
