'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import SplashLoader from '@/components/SplashLoader';

const LS_COLLAPSED = 'nn:sidebar:collapsed';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Mirror the sidebar's collapse state so we can adjust main-content margin
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [loading, user, router]);

  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_COLLAPSED);
      if (c === 'true') setSidebarCollapsed(true);
    } catch { /* ignore */ }
    // Watch storage changes (sidebar toggle in another tab or same tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_COLLAPSED) setSidebarCollapsed(e.newValue === 'true');
    };
    window.addEventListener('storage', onStorage);
    // Poll for same-tab changes (cheap, runs only when this layout is mounted)
    const interval = setInterval(() => {
      try {
        const cur = localStorage.getItem(LS_COLLAPSED) === 'true';
        setSidebarCollapsed(prev => (prev !== cur ? cur : prev));
      } catch {}
    }, 500);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  if (loading) return <SplashLoader message="Loading workspace…" variant="dark" />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface-50 light-mode-page text-surface-900">
      <Sidebar />
      <div
        className={`transition-all duration-300 ease-out ${
          sidebarCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'
        } pt-14 lg:pt-0`}
      >
        <Topbar />
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
