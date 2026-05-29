'use client';

import { BRAND } from '@/lib/brand';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
  taglineClassName?: string;
}

/**
 * Modern generic SaaS logo:
 *   • Gradient square (rose → pink → violet)
 *   • First letter of brand name in white, bold
 *   • Optional wordmark + tagline beside it
 *
 * To change the letter / colors / name → edit src/lib/brand.ts
 */
export default function Logo({
  size = 32,
  showText = true,
  textClassName = '',
  taglineClassName = '',
}: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`relative shrink-0 rounded-lg bg-gradient-to-br ${BRAND.logo.fromColor} ${BRAND.logo.viaColor} ${BRAND.logo.toColor} flex items-center justify-center shadow-soft`}
        style={{ width: size, height: size }}
      >
        <span
          className="font-bold text-white tracking-tight"
          style={{ fontSize: size * 0.5, lineHeight: 1 }}
        >
          {BRAND.logo.letter}
        </span>
      </div>
      {showText && (
        <div className="leading-tight">
          <div className={`font-bold tracking-tight ${textClassName || 'text-base text-surface-900'}`}>
            {BRAND.name}
          </div>
          {taglineClassName !== 'hidden' && BRAND.tagline && (
            <div className={`text-2xs ${taglineClassName || 'text-surface-400 -mt-0.5'}`}>
              {BRAND.tagline}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
