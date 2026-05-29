'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import SplashLoader from '@/components/SplashLoader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [loading, user, router]);

  if (loading) return <SplashLoader message="Loading workspace…" variant="dark" />;
  if (!user) return null;

  // Light "CRM panel" — force light styling regardless of root dark theme
  return (
    <div className="min-h-screen bg-surface-50 light-mode-page text-surface-900">
      <Sidebar />
      <div className="lg:ml-64">
        <Topbar />
        <main className="px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
