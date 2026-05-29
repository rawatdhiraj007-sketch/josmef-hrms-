'use client';

import { usePathname } from 'next/navigation';
import { Search, Bell, ChevronRight, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

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

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-100">
      <div className="h-16 px-6 flex items-center gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
          {crumbs.map((c, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-surface-300 flex-shrink-0" />}
              <span
                className={`capitalize truncate ${
                  c.isLast
                    ? 'text-surface-900 font-semibold'
                    : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* Search (visual only, can be wired later) */}
        <div className="hidden md:flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-lg px-3 py-1.5 w-64 transition-all hover:border-surface-300 focus-within:border-primary-400 focus-within:bg-white">
          <Search className="w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search employees, payroll..."
            className="bg-transparent text-sm flex-1 outline-none placeholder:text-surface-400"
          />
          <kbd className="hidden lg:inline-flex text-2xs font-mono bg-white text-surface-400 px-1.5 py-0.5 rounded border border-surface-200">⌘K</kbd>
        </div>

        {/* Alerts bell */}
        <button className="relative w-9 h-9 rounded-lg hover:bg-surface-100 flex items-center justify-center text-surface-600 transition-colors">
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
}
