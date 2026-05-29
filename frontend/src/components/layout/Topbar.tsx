'use client';

import { usePathname } from 'next/navigation';
import {
  Search, Bell, ChevronRight, Command, Moon,
  HelpCircle, Settings,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

// Map URL segments to friendly labels
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  applicants: 'Applicants',
  trainees: 'Trainees',
  employees: 'Employees',
  'former-employees': 'Former Employees',
  attendance: 'Attendance',
  payroll: 'Payroll',
  bonus: 'Bonus Runs',
  leave: 'Leave Management',
  training: 'Training',
  audit: 'Audit Log',
  analytics: 'Analytics',
  compliance: 'Compliance',
  'gov-reports': 'Government Reports',
  'exit-clearance': 'Exit Clearance',
  loans: 'Loans',
  disciplinary: 'Disciplinary',
  nte: 'NTE',
  'incident-reports': 'Incident Reports',
  'work-certificates': 'Work Certificates',
  ai: 'AI Hub',
  new: 'New',
  edit: 'Edit',
  '201': '201 File',
  licenses: 'Licenses',
  jobs: 'Jobs',
  shifts: 'Shifts',
  integrations: 'Integrations',
  automations: 'Automations',
};

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    api.get('/compliance/alerts')
      .then(r => setAlertCount(r.data?.summary?.critical ?? 0))
      .catch(() => {});
  }, [pathname]);

  // Build breadcrumb from URL
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] ?? seg.replace(/-/g, ' '),
    isLast: i === segments.length - 1,
  }));

  // Detect platform for the Cmd hint
  const [isMac, setIsMac] = useState(true);
  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setIsMac(/Mac/i.test(navigator.platform));
    }
  }, []);

  return (
    <header
      className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-surface-200/60
                 lg:pl-0 pl-14 transition-all duration-300"
    >
      <div className="h-14 px-4 lg:px-6 flex items-center gap-3 max-w-[1600px] mx-auto">
        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-sm min-w-0 flex-shrink">
          {crumbs.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-surface-300 flex-shrink-0" />
              )}
              <span
                className={`capitalize truncate ${
                  c.isLast
                    ? 'text-surface-900 font-semibold'
                    : 'text-surface-500 hover:text-surface-700 transition-colors'
                }`}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Search (Cmd+K style) ── */}
        <button
          className="hidden md:flex items-center gap-2.5 bg-surface-50 hover:bg-white border border-surface-200 hover:border-surface-300 rounded-lg px-3 py-1.5 w-72 group transition-all"
          aria-label="Search"
        >
          <Search className="w-3.5 h-3.5 text-surface-400 group-hover:text-surface-600 transition-colors" />
          <span className="text-sm text-surface-500 group-hover:text-surface-700 flex-1 text-left transition-colors">
            Search anything…
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono font-medium bg-white text-surface-500 px-1.5 py-0.5 rounded border border-surface-200">
            <Command className="w-3 h-3" />K
          </kbd>
        </button>

        {/* ── Mobile search button ── */}
        <button
          className="md:hidden w-9 h-9 rounded-lg hover:bg-surface-100 flex items-center justify-center text-surface-600 transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* ── Help (placeholder) ── */}
        <button
          className="hidden sm:flex w-9 h-9 rounded-lg hover:bg-surface-100 items-center justify-center text-surface-500 hover:text-surface-900 transition-colors"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* ── Theme toggle (placeholder for future dark mode) ── */}
        <button
          className="hidden sm:flex w-9 h-9 rounded-lg hover:bg-surface-100 items-center justify-center text-surface-500 hover:text-surface-900 transition-colors"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* ── Notifications ── */}
        <button
          className="relative w-9 h-9 rounded-lg hover:bg-surface-100 flex items-center justify-center text-surface-500 hover:text-surface-900 transition-colors"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-2 right-2 flex items-center justify-center">
              <span className="absolute w-3 h-3 bg-rose-500 rounded-full animate-ping opacity-60" />
              <span className="relative w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </span>
          )}
        </button>

        {/* ── Separator ── */}
        <div className="hidden sm:block w-px h-6 bg-surface-200 mx-1" />

        {/* ── User avatar / menu ── */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group"
          aria-label="User menu"
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-soft group-hover:shadow-glow transition-all">
              {(user?.firstName?.[0] ?? 'U').toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white" />
          </div>
          <div className="hidden xl:block text-left min-w-0">
            <div className="text-xs font-semibold text-surface-900 truncate leading-tight">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-[10px] text-surface-500 capitalize truncate">
              {user?.role?.replace('_', ' ') ?? 'User'}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
