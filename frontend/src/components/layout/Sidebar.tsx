'use client';

/**
 * Vertical icon-column sidebar inspired by Zoho People's layout.
 *
 * Visual model:
 *   - Dark navy column, ~80px wide
 *   - Logo mark at the very top (square)
 *   - Stack of icon-with-label-below items
 *   - Active item has a left blue indicator + soft tint
 *   - Mobile (< lg) collapses into a slide-in drawer
 *
 * Curated to the most-used 10 destinations. Everything else lives
 * under "More" which expands into a popover with the full nav.
 *
 * Preserves: localStorage collapsed state key (no longer used for
 * width switching since the column is always narrow, but kept for
 * topbar offset compatibility).
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home, Users, Clock, CalendarCheck, DollarSign, GraduationCap,
  ShieldAlert, BarChart3, Sparkles, MoreHorizontal, X,
  UserPlus, Briefcase, Plane, Gift, ClipboardCheck, CreditCard,
  AlertTriangle, FileWarning, AlertCircle, Award, FileBarChart,
  History, Plug, Zap, Settings, Stethoscope, Archive,
} from 'lucide-react';
import Logo from '@/components/Logo';

const LS_COLLAPSED = 'nn:sidebar:collapsed';

// Primary nav — always visible in the column.
const PRIMARY = [
  { label: 'Home',       href: '/dashboard',            icon: Home },
  { label: 'Employees',  href: '/dashboard/employees',  icon: Users },
  { label: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { label: 'Leave',      href: '/dashboard/leave',      icon: Plane },
  { label: 'Payroll',    href: '/dashboard/payroll',    icon: DollarSign },
  { label: 'Shifts',     href: '/dashboard/shifts',     icon: CalendarCheck },
  { label: 'Training',   href: '/dashboard/training',   icon: GraduationCap },
  { label: 'Compliance', href: '/dashboard/compliance', icon: ShieldAlert },
  { label: 'AI',         href: '/dashboard/ai',         icon: Sparkles },
  { label: 'Analytics',  href: '/dashboard/analytics',  icon: BarChart3 },
];

// Everything else surfaces under the "More" popover.
const MORE_GROUPS: { title: string; items: { label: string; href: string; icon: any }[] }[] = [
  {
    title: 'Recruitment',
    items: [
      { label: 'Jobs',         href: '/dashboard/jobs',         icon: Briefcase },
      { label: 'Applicants',   href: '/dashboard/applicants',   icon: UserPlus },
      { label: 'Trainees',     href: '/dashboard/trainees',     icon: GraduationCap },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Licenses',         href: '/dashboard/licenses',          icon: Stethoscope },
      { label: 'Former Employees', href: '/dashboard/former-employees',  icon: Archive },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Bonus Runs',     href: '/dashboard/bonus',           icon: Gift },
      { label: 'Exit Clearance', href: '/dashboard/exit-clearance',  icon: ClipboardCheck },
      { label: 'Kiosk Mode',     href: '/kiosk',                     icon: Clock },
    ],
  },
  {
    title: '201 File',
    items: [
      { label: 'Loans',             href: '/dashboard/loans',             icon: CreditCard },
      { label: 'Disciplinary',      href: '/dashboard/disciplinary',      icon: AlertTriangle },
      { label: 'NTE',               href: '/dashboard/nte',               icon: FileWarning },
      { label: 'Incident Reports',  href: '/dashboard/incident-reports',  icon: AlertCircle },
      { label: 'Work Certificates', href: '/dashboard/work-certificates', icon: Award },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Gov Reports', href: '/dashboard/gov-reports', icon: FileBarChart },
      { label: 'Audit Log',   href: '/dashboard/audit',       icon: History },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Integrations', href: '/dashboard/integrations',  icon: Plug },
      { label: 'Automations',  href: '/dashboard/automations',   icon: Zap },
      { label: 'Settings',     href: '/dashboard/settings',      icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Keep legacy key wired to topbar offset (collapsed = always true now).
  useEffect(() => {
    try { localStorage.setItem(LS_COLLAPSED, 'true'); } catch { /* */ }
  }, []);

  // Close drawers on Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setMoreOpen(false); setMobileOpen(false); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      {/* ── Mobile top-bar (only visible < lg) ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[#1a2545] flex items-center px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-white/80 hover:text-white p-2 -ml-2 rounded-lg hover:bg-white/[0.06] transition-colors"
          aria-label="Open menu"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
        <div className="ml-2">
          <Logo width={120} variant="light" />
        </div>
      </div>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar column ── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-[78px]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          transition-transform duration-300 ease-out
          bg-[#1a2545]
          flex flex-col
        `}
      >
        {/* Logo / mark at top */}
        <div className="h-14 flex items-center justify-center border-b border-white/[0.06]">
          <Link href="/dashboard" aria-label="NextNova home">
            <Logo collapsed width={36} />
          </Link>
        </div>

        {/* Mobile close (visible only when drawer open on mobile) */}
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden absolute top-3 right-3 w-7 h-7 rounded-md hover:bg-white/[0.08] text-white/60 hover:text-white flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Primary icon column */}
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-0.5 px-1.5">
            {PRIMARY.map((item) => (
              <li key={item.href}>
                <IconItem
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(item.href)}
                  onClick={() => setMobileOpen(false)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* More button */}
        <div className="border-t border-white/[0.06] px-1.5 py-2">
          <button
            type="button"
            onClick={() => setMoreOpen((s) => !s)}
            className={`
              w-full flex flex-col items-center gap-1 py-2 rounded-lg
              text-2xs font-medium transition-colors
              ${moreOpen ? 'bg-white/[0.08] text-white' : 'text-white/55 hover:text-white hover:bg-white/[0.04]'}
            `}
            aria-expanded={moreOpen}
            aria-label="More navigation"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span>More</span>
          </button>
        </div>
      </aside>

      {/* ── "More" popover ── */}
      {moreOpen && (
        <>
          <div
            aria-hidden
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-[55] bg-black/30 backdrop-blur-sm animate-fade-in"
          />
          <div
            role="dialog"
            aria-label="All navigation"
            className="fixed z-[60] left-[78px] bottom-3 ml-2 w-[560px] max-w-[calc(100vw-100px)] max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-[0_24px_56px_-12px_rgba(0,0,0,0.25)] border border-slate-200 p-5 animate-slide-up"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">All navigation</h2>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-500 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {MORE_GROUPS.map((group) => (
                <div key={group.title}>
                  <div className="text-2xs font-semibold uppercase tracking-[0.12em] text-slate-400 px-2 mb-1.5">
                    {group.title}
                  </div>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors ${
                            isActive(item.href)
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <item.icon className="w-4 h-4 text-slate-400" />
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── Icon item ───────────────────────────────────────────────
function IconItem({
  href, label, icon: Icon, active, onClick,
}: {
  href: string; label: string; icon: any; active: boolean; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`
        relative flex flex-col items-center gap-1 py-2 rounded-lg
        text-2xs font-medium transition-colors
        ${active
          ? 'bg-white/[0.08] text-white'
          : 'text-white/55 hover:text-white hover:bg-white/[0.04]'}
      `}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-400 rounded-r-full"
        />
      )}
      <Icon className="w-5 h-5" />
      <span className="leading-tight text-center">{label}</span>
    </Link>
  );
}
