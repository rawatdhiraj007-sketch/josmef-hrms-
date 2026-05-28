'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/Logo';
import { LayoutDashboard, Plane, DollarSign, Clock, User, LogOut, GraduationCap } from 'lucide-react';

const navItems = [
  { href: '/portal', label: 'Overview', icon: LayoutDashboard },
  { href: '/portal/leave', label: 'My Leaves', icon: Plane },
  { href: '/portal/training', label: 'Trainings', icon: GraduationCap },
  { href: '/portal/payslips', label: 'Payslips', icon: DollarSign },
  { href: '/portal/attendance', label: 'Attendance', icon: Clock },
  { href: '/portal/profile', label: 'Profile', icon: User },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Top header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size={36} textClassName="text-base text-gray-900" taglineClassName="text-[10px] text-gray-500" />
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
              <div className="text-xs text-gray-500">Employee Portal</div>
            </div>
            <button onClick={logout} className="text-gray-500 hover:text-rose-600" title="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Nav tabs */}
        <nav className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/portal' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap ${
                  active ? 'border-rose-600 text-rose-700' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
