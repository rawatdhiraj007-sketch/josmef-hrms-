'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Search, Bell, Plus, HelpCircle, LayoutGrid, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useWorkspace } from '@/hooks/useWorkspace';
import { AiCreditsWidget } from '@/components/ai';
import { CheckInWidgetDark } from './CheckInWidget';

/**
 * Zoho People-style topbar:
 *   - Dark navy bar spanning full width above the sidebar
 *   - LEFT: "My Space" / "Organization" tabs with blue underline
 *   - RIGHT: + button · notifications (with badge) · AI credits ·
 *            help · workspace · avatar / apps grid
 *
 * The "My Space / Organization" scope is a frontend-only filter
 * concept that defaults to whatever the current route is about:
 *   - /portal/*           → My Space
 *   - everything else     → Organization
 *
 * Clicking "My Space" navigates to /portal; "Organization" routes
 * back to /dashboard. This matches Zoho's mental model exactly.
 */

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
  settings: 'Settings',
  workspace: 'Workspace',
  profile: 'Profile',
  notifications: 'Notifications',
  appearance: 'Appearance',
  'theme-studio': 'Theme Studio',
  components: 'Components',
};

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { workspace, planDef } = useWorkspace();
  const [alertCount, setAlertCount] = useState(0);
  const [appsOpen, setAppsOpen] = useState(false);

  useEffect(() => {
    api.get('/compliance/alerts')
      .then((r) => setAlertCount(r.data?.summary?.critical ?? 0))
      .catch(() => {});
  }, [pathname]);

  const isMySpace = pathname.startsWith('/portal');

  // Breadcrumb chain (used as a subtle sub-line)
  const crumbs = useMemo(() => {
    return pathname.split('/').filter(Boolean).map((seg) => ({
      label: SEGMENT_LABELS[seg] ?? seg.replace(/-/g, ' '),
    }));
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30">
      {/* ── Dark band — top tabs + actions ── */}
      <div className="bg-[#1a2545] text-white">
        <div className="h-14 px-4 lg:px-6 flex items-center gap-3 max-w-[1600px] mx-auto">
          {/* Left: My Space / Organization tabs */}
          <nav className="flex items-center gap-1 ml-1">
            <ScopeTab
              label="My Space"
              active={isMySpace}
              onClick={() => router.push('/portal')}
            />
            <ScopeTab
              label="Organization"
              active={!isMySpace}
              onClick={() => router.push('/dashboard')}
            />
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Check-in / out with live timer */}
          <CheckInWidgetDark />

          {/* Quick-add */}
          <button
            type="button"
            onClick={() => router.push('/dashboard/employees/new')}
            className="hidden sm:flex w-8 h-8 rounded-md bg-blue-500 hover:bg-blue-400 items-center justify-center text-white shadow-sm transition-colors"
            aria-label="Quick add"
            title="Add new"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="relative w-8 h-8 rounded-md hover:bg-white/[0.08] flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#1a2545]">
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </button>

          {/* AI credits — only on lg+ */}
          <div className="hidden lg:block">
            <AiCreditsWidget variant="badge" className="!bg-white/[0.08] !border-white/[0.12] !text-white" />
          </div>

          {/* Help */}
          <button
            type="button"
            className="hidden sm:flex w-8 h-8 rounded-md hover:bg-white/[0.08] items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="Help"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User avatar */}
          <Link
            href="/dashboard/settings/profile"
            className="flex items-center gap-2"
            aria-label="Profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 ring-2 ring-white/20 text-white text-xs font-bold flex items-center justify-center">
              {(user?.firstName?.[0] ?? 'U').toUpperCase()}
            </div>
          </Link>

          {/* Apps grid (workspace switcher) */}
          <button
            type="button"
            onClick={() => setAppsOpen((s) => !s)}
            className="w-8 h-8 rounded-md hover:bg-white/[0.08] flex items-center justify-center text-white/80 hover:text-white transition-colors"
            aria-label="App switcher"
            title={workspace.companyName + ' · ' + planDef.name}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── White band — page-level breadcrumb ── */}
      <div className="bg-white border-b border-slate-200/70">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-11 flex items-center gap-1.5 text-xs">
          {crumbs.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
              <span
                className={`capitalize truncate ${
                  i === crumbs.length - 1
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-500'
                }`}
              >
                {c.label}
              </span>
            </div>
          ))}

          <div className="flex-1" />

          {/* Subtle search trigger (Cmd+K placeholder) */}
          <button
            type="button"
            className="hidden md:flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
            <kbd className="ml-1 text-[10px] font-mono bg-white text-slate-500 px-1 py-0.5 rounded border border-slate-200">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* Apps switcher popover */}
      {appsOpen && (
        <>
          <div aria-hidden onClick={() => setAppsOpen(false)} className="fixed inset-0 z-[60]" />
          <div className="absolute right-4 top-12 z-[65] w-64 bg-white border border-slate-200 rounded-xl shadow-card-hover p-2">
            <div className="px-2.5 py-1.5 text-2xs font-semibold text-slate-400 uppercase tracking-wider">Switch context</div>
            <button
              onClick={() => { router.push('/dashboard'); setAppsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-slate-100 text-sm text-slate-700"
            >
              <div className="w-7 h-7 rounded-md bg-primary-50 text-primary-700 flex items-center justify-center">🏢</div>
              <div className="text-left">
                <div className="font-medium">Organization</div>
                <div className="text-2xs text-slate-500">Admin / HR view</div>
              </div>
            </button>
            <button
              onClick={() => { router.push('/portal'); setAppsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-slate-100 text-sm text-slate-700"
            >
              <div className="w-7 h-7 rounded-md bg-accent-50 text-accent-700 flex items-center justify-center">👤</div>
              <div className="text-left">
                <div className="font-medium">My Space</div>
                <div className="text-2xs text-slate-500">Employee self-service</div>
              </div>
            </button>
            <button
              onClick={() => { router.push('/kiosk'); setAppsOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-slate-100 text-sm text-slate-700"
            >
              <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">⏰</div>
              <div className="text-left">
                <div className="font-medium">Kiosk</div>
                <div className="text-2xs text-slate-500">Clock in / out</div>
              </div>
            </button>
          </div>
        </>
      )}
    </header>
  );
}

// ─── Scope tab (My Space / Organization) ───
function ScopeTab({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative px-3.5 py-2 text-sm font-semibold transition-colors
        ${active ? 'text-white' : 'text-white/55 hover:text-white/80'}
      `}
    >
      {label}
      {active && (
        <span
          aria-hidden
          className="absolute left-2 right-2 -bottom-0 h-0.5 bg-blue-400 rounded-t-full"
        />
      )}
    </button>
  );
}
