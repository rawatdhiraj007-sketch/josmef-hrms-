'use client';

import Logo from '@/components/Logo';

interface SplashLoaderProps {
  message?: string;
  variant?: 'dark' | 'light';
}

/**
 * Full-screen splash/loader with the NextNova nova-mesh background
 * and an animated pulsing logo. Use this anywhere the app needs
 * to indicate "we're loading something premium".
 */
export default function SplashLoader({
  message = 'Loading…',
  variant = 'dark',
}: SplashLoaderProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${
        isDark ? 'bg-nova-900' : 'bg-surface-50'
      }`}
    >
      {/* Aurora mesh backdrop (dark only) */}
      {isDark && (
        <>
          <div className="absolute inset-0 bg-nova-mesh opacity-80 animate-aurora bg-[length:200%_200%]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        </>
      )}

      {/* Centered logo with pulsing glow */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          {/* Pulsing glow ring */}
          <div className="absolute inset-0 -m-4 rounded-full bg-primary-500/30 blur-2xl animate-pulse" />
          <div className="relative animate-pulse-ring rounded-2xl">
            <Logo size={64} showText={false} glow variant={isDark ? 'light' : 'dark'} />
          </div>
        </div>

        {/* Wordmark */}
        <div className="mt-6">
          <Logo
            size={0}
            showText
            variant={isDark ? 'light' : 'dark'}
            textClassName={`text-2xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-surface-900'
            }`}
          />
        </div>

        {/* Status message */}
        <p
          className={`mt-5 text-sm font-medium ${
            isDark ? 'text-nova-300' : 'text-surface-500'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            {message}
          </span>
        </p>
      </div>
    </div>
  );
}
