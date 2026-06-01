'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import SplashLoader from '@/components/SplashLoader';
import { AiProvider } from '@/hooks/useAi';
import { AiAssistant, AiErrorBoundary } from '@/components/ai';

/**
 * Dashboard shell — Zoho People-inspired layout.
 *
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  [#1a2545 dark navy topbar]                                  │
 *   │  My Space  Organization    + 🔔 ✨ ⚙ 👤 ⊞                     │
 *   ├────┬─────────────────────────────────────────────────────────┤
 *   │ N  │  [white breadcrumb band]                                │
 *   │    ├─────────────────────────────────────────────────────────┤
 *   │ 🏠 │                                                         │
 *   │ 👥 │                                                         │
 *   │ ⏰ │             main content                                │
 *   │ ✈ │                                                         │
 *   │ ⋯  │                                                         │
 *   └────┴─────────────────────────────────────────────────────────┘
 *
 * Sidebar is a fixed 78px vertical icon column on desktop, slide-in
 * drawer on mobile. Topbar spans full width (above sidebar) with two
 * bands: dark navy (tabs + actions) and white (breadcrumb).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [loading, user, router]);

  if (loading) return <SplashLoader message="Loading workspace…" variant="dark" />;
  if (!user) return null;

  return (
    <AiErrorBoundary>
      <AiProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <Sidebar />
          {/* Content wrapper — sits to the right of the fixed sidebar,
              below the mobile topbar. */}
          <div className="lg:ml-[78px] pt-14 lg:pt-0">
            <Topbar />
            <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
              {children}
            </main>
          </div>
          {/* NextNova AI — floating assistant on every dashboard page */}
          <AiAssistant />
        </div>
      </AiProvider>
    </AiErrorBoundary>
  );
}
