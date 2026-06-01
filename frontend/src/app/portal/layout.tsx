'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';
import SplashLoader from '@/components/SplashLoader';
import {
  Home, Plane, DollarSign, Clock, User, LogOut, GraduationCap,
} from 'lucide-react';

import Avatar from '@/components/ui/Avatar';
import Dropdown, { DropdownItem, DropdownDivider, DropdownLabel } from '@/components/ui/Dropdown';
import CheckInWidget from '@/components/layout/CheckInWidget';
import BottomNav from '@/components/portal/BottomNav';

// All nav items — used by both desktop top-tabs and mobile bottom-nav
const navItems = [
  { href: '/portal',            label: 'Home',       icon: Home },
  { href: '/portal/leave',      label: 'Leaves',     icon: Plane },
  { href: '/portal/payslips',   label: 'Payslips',   icon: DollarSign },
  { href: '/portal/attendance', label: 'Attendance', icon: Clock },
  { href: '/portal/training',   label: 'Training',   icon: GraduationCap },
  { href: '/portal/profile',    label: 'Profile',    icon: User },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (loading || !user) return <SplashLoader message="Loading your portal…" variant="dark" />;

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-primary-50/30 light-mode-page text-surface-900">
      {/* ─── Top header ─── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/portal" className="flex items-center gap-2">
            <Logo width={140} />
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Online check-in / check-out with live timer */}
          <CheckInWidget />

          {/* User menu */}
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-surface-100 transition-colors">
                <Avatar name={fullName} size="sm" />
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-surface-900 leading-tight">{fullName}</div>
                  <div className="text-2xs text-surface-500">Employee Portal</div>
                </div>
              </button>
            }
          >
            <DropdownLabel>Signed in as</DropdownLabel>
            <div className="px-3 pb-2">
              <div className="text-sm font-medium text-surface-900">{fullName}</div>
              {(user as any).email && (
                <div className="text-xs text-surface-500 truncate">{(user as any).email}</div>
              )}
            </div>
            <DropdownDivider />
            <DropdownItem icon={User} onClick={() => router.push('/portal/profile')}>
              My Profile
            </DropdownItem>
            <DropdownItem icon={DollarSign} onClick={() => router.push('/portal/payslips')}>
              Payslips
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={LogOut} variant="danger" onClick={() => logout()}>
              Sign out
            </DropdownItem>
          </Dropdown>
        </div>

        {/* Desktop nav tabs */}
        <nav className="hidden md:block max-w-6xl mx-auto px-4">
          <ul className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/portal' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                      border-b-2 -mb-px whitespace-nowrap
                      transition-colors
                      ${active
                        ? 'border-primary-600 text-primary-700'
                        : 'border-transparent text-surface-500 hover:text-surface-900'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* ─── Page content ─── */}
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 pb-[88px] md:pb-12">
        {children}
      </main>

      {/* ─── Bottom nav (mobile only) ─── */}
      <BottomNav items={navItems.slice(0, 5)} />
    </div>
  );
}
