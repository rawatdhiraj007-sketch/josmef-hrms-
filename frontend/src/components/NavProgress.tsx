'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Linear / Vercel-style top navigation progress bar.
 * Shows a thin gradient bar at the very top of the viewport when the
 * route changes. Auto-completes ~600ms after the new page renders.
 */
export default function NavProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // When pathname/searchparams change, animate progress: 30% → 70% → 100% → hide
    setVisible(true);
    setProgress(30);

    const t1 = setTimeout(() => setProgress(70), 100);
    const t2 = setTimeout(() => setProgress(95), 280);
    const t3 = setTimeout(() => setProgress(100), 480);
    const t4 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 700);

    timer.current = t4;
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, [pathname, searchParams]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 300ms' }}
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-primary-500 to-accent-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
        style={{
          width: `${progress}%`,
          transition: 'width 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </div>
  );
}
