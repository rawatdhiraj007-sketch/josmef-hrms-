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
  FileText,
  ClipboardCheck,
  Sparkles,
  Archive,
  CreditCard,
  AlertTriangle,
  FileWarning,
  AlertCircle,
  Award,
  ChevronDown,
  ChevronLeft,
  ShieldAlert,
  History,
  Plane,
  Gift,
  FileBarChart,
  BarChart3,
  Settings,
  HelpCircle,
  Stethoscope,
  Zap,
  Briefcase,
} from 'lucide-react';
import { useState } from 'react';
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

// Grouped nav structure — modern HRMS pattern
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
      { label: 'Integrations', href: '/dashboard/integrations', icon: Zap },
      { label: 'Automations', href: '/dashboard/automations', icon: Sparkles },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  function toggleSection(label: string) {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  }

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white border-r border-surface-200 z-40">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-surface-100">
        <Logo
          size={32}
          textClassName="text-base font-bold text-surface-900"
          taglineClassName="text-2xs text-surface-400 -mt-0.5"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((section) => {
          const isCollapsed = collapsed[section.label];
          const hasActive = section.items.some((it) => isActive(it.href));
          return (
            <div key={section.label}>
              <button
                onClick={() => toggleSection(section.label)}
                className="w-full flex items-center justify-between px-3 mb-1.5 group"
              >
                <span className="text-2xs font-semibold uppercase tracking-wider text-surface-400 group-hover:text-surface-600 transition-colors">
                  {section.label}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-surface-400 transition-transform ${
                    isCollapsed ? '-rotate-90' : ''
                  }`}
                />
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${active ? 'nav-item-active' : ''}`}
                      >
                        <item.icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            active ? 'text-primary-600' : 'text-surface-500'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto badge-info">{item.badge}</span>
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

      {/* User card */}
      <div className="border-t border-surface-100 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {(user?.firstName?.[0] ?? 'U').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-surface-900 truncate">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-2xs text-surface-500 capitalize truncate">
              {user?.role?.replace('_', ' ') ?? 'User'}
            </div>
          </div>
          <button
            onClick={logout}
            className="text-surface-400 hover:text-rose-600 transition-colors p-1.5 rounded-md hover:bg-surface-100"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
