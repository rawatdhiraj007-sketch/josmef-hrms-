'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
  Clock,
  DollarSign,
  LogOut,
  ClipboardCheck,
  Sparkles,
  Archive,
  CreditCard,
  AlertTriangle,
  FileWarning,
  AlertCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ShieldAlert,
  History,
  Plane,
  Gift,
  FileBarChart,
  BarChart3,
  Stethoscope,
  Briefcase,
  Plug,
  Zap,
  X,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

// ⚠️  Same nav data as before — preserved 1:1
const navSections: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Recruitment',
    items: [
      { label: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
      { label: 'Applicants', href: '/dashboard/applicants', icon: UserPlus },
      { label: 'Trainees', href: '/dashboard/trainees', icon: GraduationCap },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'Employees', href: '/dashboard/employees', icon: Users },
      { label: 'Licenses', href: '/dashboard/licenses', icon: Stethoscope },
      { label: 'Former Employees', href: '/dashboard/former-employees', icon: Archive },
      { label: 'Training', href: '/dashboard/training', icon: GraduationCap },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Shifts', href: '/dashboard/shifts', icon: Clock },
      { label: 'Attendance', href: '/dashboard/attendance', icon: Clock },
      { label: 'Kiosk Mode', href: '/kiosk', icon: Clock },
      { label: 'Payroll', href: '/dashboard/payroll', icon: DollarSign },
      { label: 'Bonus Runs', href: '/dashboard/bonus', icon: Gift },
      { label: 'Leave Management', href: '/dashboard/leave', icon: Plane },
      { label: 'Exit Clearance', href: '/dashboard/exit-clearance', icon: ClipboardCheck },
    ],
  },
  {
    label: '201 File',
    items: [
      { label: 'Loans', href: '/dashboard/loans', icon: CreditCard },
      { label: 'Disciplinary', href: '/dashboard/disciplinary', icon: AlertTriangle },
      { label: 'NTE', href: '/dashboard/nte', icon: FileWarning },
      { label: 'Incident Reports', href: '/dashboard/incident-reports', icon: AlertCircle },
      { label: 'Work Certificates', href: '/dashboard/work-certificates', icon: Award },
    ],
  },
  {
    label: 'Insights',
    items: [
      { label: 'Compliance', href: '/dashboard/compliance', icon: ShieldAlert },
      { label: 'Gov Reports', href: '/dashboard/gov-reports', icon: FileBarChart },
      { label: 'Audit Log', href: '/dashboard/audit', icon: History },
      { label: 'AI Hub', href: '/dashboard/ai', icon: Sparkles },
    ],
  },
  {
    label: 'Connect',
    items: [
      { label: 'Integrations', href: '/dashboard/integrations', icon: Plug },
      { label: 'Automations', href: '/dashboard/automations', icon: Zap },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

const LS_COLLAPSED = 'nn:sidebar:collapsed';
const LS_SECTION = 'nn:sidebar:section';
const LS_MOBILE_OPEN = 'nn:sidebar:mobileopen';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Sidebar-wide collapse (icon-only mode)
  const [collapsed, setCollapsed] = useState(false);
  // Per-section collapse state
  const [sectionState, setSectionState] = useState<Record<string, boolean>>({});
  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Restore preferences from localStorage ──
  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_COLLAPSED);
      if (c === 'true') setCollapsed(true);
      const s = localStorage.getItem(LS_SECTION);
      if (s) setSectionState(JSON.parse(s));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LS_COLLAPSED, String(collapsed)); } catch {}
  }, [collapsed]);

  useEffect(() => {
    try { localStorage.setItem(LS_SECTION, JSON.stringify(sectionState)); } catch {}
  }, [sectionState]);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const toggleSection = (label: string) =>
    setSectionState(prev => ({ ...prev, [label]: !prev[label] }));

  const width = collapsed ? 'lg:w-[76px]' : 'lg:w-[260px]';

  return (
    <>
      {/* ─── Mobile top bar trigger ──────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-nova-900/90 backdrop-blur-md border-b border-white/[0.06] flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white/70 hover:text-white p-2 -ml-2 rounded-lg hover:bg-white/[0.06] transition-colors"
          aria-label="Open menu"
        >
          <ChevronsLeft className="w-5 h-5 rotate-180" />
        </button>
        <div className="ml-2">
          {/* Mobile top-bar logo (visible when sidebar is closed on mobile) */}
          <Logo width={120} variant="light" />
        </div>
      </div>

      {/* ─── Mobile backdrop ─────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Floating sidebar ────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          ${width}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          transition-all duration-300 ease-out
          p-3 group/aside
          [html[data-sidebar-style=flush]_&]:p-0
        `}
      >
        <div className="relative h-full flex flex-col bg-nova-900/95 backdrop-blur-xl border border-white/[0.06] shadow-dark-card overflow-hidden
                        rounded-2xl
                        [html[data-sidebar-style=flush]_&]:rounded-none
                        [html[data-sidebar-style=flush]_&]:border-y-0
                        [html[data-sidebar-style=flush]_&]:border-l-0">
          {/* Subtle aurora highlight at top */}
          <div className="pointer-events-none absolute -top-32 -left-16 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-16 w-64 h-64 bg-accent-600/10 rounded-full blur-3xl" />

          {/* Header / Logo
              Sized per branding spec: 150px-wide lockup when expanded
              (≈100px tall), 40px square mark when collapsed.
              Header height is auto-driven by py-5 so the logo fits
              without cropping. */}
          <div className="relative py-5 px-4 flex items-center justify-between border-b border-white/[0.06]">
            {collapsed ? (
              <div className="w-full flex justify-center">
                <Logo collapsed width={40} glow />
              </div>
            ) : (
              <Logo width={150} variant="light" glow />
            )}
            {/* Mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-white/60 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav body */}
          <nav className="relative flex-1 overflow-y-auto py-3 px-2.5 space-y-4 nn-scroll">
            {navSections.map(section => {
              const isSectionCollapsed = !!sectionState[section.label];
              return (
                <div key={section.label}>
                  {/* Section label (hidden in collapsed mode) */}
                  {!collapsed && (
                    <button
                      onClick={() => toggleSection(section.label)}
                      className="w-full flex items-center justify-between px-2.5 mb-1.5 group"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30 group-hover:text-white/50 transition-colors">
                        {section.label}
                      </span>
                      <ChevronRight
                        className={`w-3 h-3 text-white/30 transition-transform duration-200 ${
                          isSectionCollapsed ? '' : 'rotate-90'
                        }`}
                      />
                    </button>
                  )}

                  {(!isSectionCollapsed || collapsed) && (
                    <div className="space-y-0.5">
                      {section.items.map(item => {
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={`
                              group relative flex items-center gap-3
                              ${collapsed ? 'justify-center px-0' : 'px-2.5'}
                              py-2 rounded-lg text-sm font-medium
                              transition-all duration-200
                              ${active
                                ? 'text-white bg-gradient-to-r from-primary-500/20 via-primary-500/15 to-transparent'
                                : 'text-white/55 hover:text-white hover:bg-white/[0.04]'}
                            `}
                          >
                            {/* Active glow bar */}
                            {active && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-gradient-to-b from-primary-400 to-accent-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                            )}
                            <item.icon
                              className={`w-[18px] h-[18px] flex-shrink-0 transition-all ${
                                active
                                  ? 'text-primary-300'
                                  : 'text-white/40 group-hover:text-white/80'
                              }`}
                            />
                            {!collapsed && (
                              <>
                                <span className="truncate">{item.label}</span>
                                {item.badge && (
                                  <span className="ml-auto bg-primary-500/20 text-primary-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                    {item.badge}
                                  </span>
                                )}
                              </>
                            )}
                            {/* Tooltip when collapsed */}
                            {collapsed && (
                              <span className="pointer-events-none absolute left-[calc(100%+12px)] whitespace-nowrap text-xs font-medium text-white bg-nova-700 px-2.5 py-1.5 rounded-lg shadow-dark-card border border-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                {item.label}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom — user card + collapse toggle */}
          <div className="relative border-t border-white/[0.06] p-2.5 space-y-1">
            {/* User card */}
            <div
              className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10">
                  {(user?.firstName?.[0] ?? 'U').toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-nova-900" />
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-[10px] text-white/40 capitalize truncate">
                      {user?.role?.replace('_', ' ') ?? 'User'}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="text-white/30 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-md transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Collapse toggle (desktop only) */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`hidden lg:flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-colors text-xs ${
                collapsed ? 'justify-center' : ''
              }`}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span>Collapse</span>
                  <kbd className="ml-auto text-[10px] font-mono bg-white/[0.04] text-white/40 px-1.5 py-0.5 rounded border border-white/[0.06]">
                    ⌘\
                  </kbd>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Custom scrollbar styling for the dark sidebar nav */}
      <style jsx global>{`
        .nn-scroll::-webkit-scrollbar { width: 4px; }
        .nn-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .nn-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
      `}</style>
    </>
  );
}
