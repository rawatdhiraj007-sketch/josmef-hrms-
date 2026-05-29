'use client';

import { BRAND } from '@/lib/brand';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
  taglineClassName?: string;
  /** Add an ambient glow behind the mark (good for dark backgrounds). */
  glow?: boolean;
  /** Force light text (for dark backgrounds). */
  variant?: 'light' | 'dark' | 'auto';
}

/**
 * NextNova logo — a stylized 4-point nova/diamond with glow.
 *
 * The mark is a sharp diamond with a brighter inner highlight + radial sparkle.
 * Inspired by Linear's mark, Vercel's triangle, and ChatGPT's gradient orb.
 * Edit colors in BRAND.logo.stops (lib/brand.ts).
 */
export default function Logo({
  size = 32,
  showText = true,
  textClassName = '',
  taglineClassName = '',
  glow = false,
  variant = 'auto',
}: LogoProps) {
  const [c0, c1, c2, c3] = BRAND.logo.stops;
  const textClass =
    textClassName ||
    (variant === 'light'
      ? 'text-base text-white'
      : variant === 'dark'
        ? 'text-base text-surface-900'
        : 'text-base text-surface-900 dark:text-white');

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className="relative shrink-0"
        style={{
          width: size,
          height: size,
          filter: glow ? `drop-shadow(0 0 14px ${BRAND.logo.glowColor}55)` : undefined,
        }}
      >
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Main diamond gradient */}
            <linearGradient id="nnDiamond" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor={c0} />
              <stop offset="40%"  stopColor={c1} />
              <stop offset="70%"  stopColor={c2} />
              <stop offset="100%" stopColor={c3} />
            </linearGradient>
            {/* Inner highlight */}
            <radialGradient id="nnSheen" cx="35%" cy="30%" r="50%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            {/* Edge glow halo */}
            <radialGradient id="nnHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={c1} stopOpacity="0.35" />
              <stop offset="100%" stopColor={c2} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Soft ambient halo */}
          <circle cx="20" cy="20" r="20" fill="url(#nnHalo)" />

          {/* Main 4-point nova / diamond */}
          <path
            d="M20 3 L37 20 L20 37 L3 20 Z"
            fill="url(#nnDiamond)"
          />

          {/* Inner inset shape — creates depth */}
          <path
            d="M20 9.5 L30.5 20 L20 30.5 L9.5 20 Z"
            fill="url(#nnDiamond)"
            opacity="0.55"
          />

          {/* Specular highlight */}
          <path
            d="M20 3 L37 20 L20 37 L3 20 Z"
            fill="url(#nnSheen)"
          />

          {/* Inner sparkle line */}
          <path
            d="M20 6 L20 34 M6 20 L34 20"
            stroke="#ffffff"
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.45"
          />

          {/* Center bright dot */}
          <circle cx="20" cy="20" r="1.8" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>

      {showText && (
        <div className="leading-tight">
          <div className={`font-bold tracking-tight ${textClass}`}>
            {BRAND.name}
          </div>
          {taglineClassName !== 'hidden' && BRAND.tagline && (
            <div
              className={`text-2xs ${
                taglineClassName ||
                (variant === 'light'
                  ? 'text-white/50'
                  : 'text-surface-400 -mt-0.5')
              }`}
            >
              {BRAND.tagline}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
