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
  Shield,
  ChevronLeft,
  Menu,
  ClipboardCheck,
  Sparkles,
  Archive,
  CreditCard,
  AlertTriangle,
  FileWarning,
  AlertCircle,
  Award,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  History,
  Plane,
  User,
  Gift,
  FileBarChart,
  BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import Logo from '@/components/Logo';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Applicants', href: '/dashboard/applicants', icon: UserPlus },
  { label: 'Trainees', href: '/dashboard/trainees', icon: GraduationCap },
  { label: 'Employees', href: '/dashboard/employees', icon: Users },
  { label: 'Former Employees', href: '/dashboard/former-employees', icon: Archive },
  { label: 'Attendance', href: '/dashboard/attendance', icon: Clock },
  { label: 'Payroll', href: '/dashboard/payroll', icon: DollarSign },
  { label: 'Bonus Runs', href: '/dashboard/bonus', icon: Gift },
  { label: 'Exit Clearance', href: '/dashboard/exit-clearance', icon: ClipboardCheck },
];

const twoOhOneItems = [
  { label: 'Loans', href: '/dashboard/loans', icon: CreditCard },
  { label: 'Disciplinary', href: '/dashboard/disciplinary', icon: Shield },
  { label: 'Notice to Explain', href: '/dashboard/nte', icon: FileWarning },
  { label: 'Incident Reports', href: '/dashboard/incident-reports', icon: AlertTriangle },
  { label: 'Work Certificates', href: '/dashboard/work-certificates', icon: Award },
  { label: 'Documents', href: '/dashboard/documents', icon: FileText },
];

const bottomItems = [
  { label: 'Leave Management', href: '/dashboard/leave', icon: Plane },
  { label: 'Training', href: '/dashboard/training', icon: GraduationCap },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Gov Reports', href: '/dashboard/gov-reports', icon: FileBarChart },
  { label: 'Compliance', href: '/dashboard/compliance', icon: ShieldAlert },
  { label: 'Audit Log', href: '/dashboard/audit', icon: History },
  { label: 'AI Hub', href: '/dashboard/ai', icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [twoOhOneOpen, setTwoOhOneOpen] = useState(
    twoOhOneItems.some(item => pathname.startsWith(item.href))
  );

  const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  const NavLink = ({ item }: { item: typeof navItems[0] }) => (
    <Link
      key={item.href}
      href={item.href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-colors duration-150
        ${isActive(item.href)
          ? 'bg-brand-50 text-brand-700'
          : 'text-gray-600 hover:bg-surface-100 hover:text-gray-900'}
      `}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? 'text-brand-600' : ''}`} />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-surface-200 flex items-center px-4 z-50">
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-600">
          <Menu className="w-6 h-6" />
        </button>
        <div className="ml-3">
          <Logo size={28} textClassName="text-base text-gray-900" taglineClassName="hidden" />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-surface-200 z-40
          transition-all duration-200 flex flex-col
          ${collapsed ? 'w-[72px]' : 'w-64'}
          max-lg:${collapsed ? '-translate-x-full' : 'translate-x-0'}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-surface-200">
          {!collapsed ? (
            <Logo size={36} textClassName="text-base text-gray-900" taglineClassName="text-[10px] text-gray-500" />
          ) : (
            <Logo size={36} showText={false} />
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-surface-100 text-gray-400"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => <NavLink key={item.href} item={item} />)}

          {/* 201 File Section */}
          <div className="pt-2">
            {!collapsed && (
              <button
                onClick={() => setTwoOhOneOpen(!twoOhOneOpen)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
              >
                <span>201 File</span>
                {twoOhOneOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            )}
            {(twoOhOneOpen || collapsed) && (
              <div className="space-y-1 mt-1">
                {twoOhOneItems.map((item) => <NavLink key={item.href} item={item} />)}
              </div>
            )}
          </div>

          {/* Bottom items */}
          <div className="pt-2 border-t border-gray-100">
            {bottomItems.map((item) => <NavLink key={item.href} item={item} />)}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-surface-200 p-3">
          {!collapsed && user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.role.replace('_', ' ')}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}
