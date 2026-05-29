'use client';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
  taglineClassName?: string;
}

/**
 * Simple, modern JOSMEF logo:
 *   • Soft rose-to-violet gradient circle
 *   • Clean white heart in the center
 *   • Optional wordmark + tagline beside it
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
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 40 40" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="josmefHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          {/* Circle background */}
          <circle cx="20" cy="20" r="20" fill="url(#josmefHeartGrad)" />
          {/* Heart icon (centered) */}
          <path
            d="M20 28.5c-.4 0-.8-.15-1.1-.45L11.6 21c-2.3-2.3-2.3-6.1 0-8.4 2.2-2.2 5.8-2.3 8.1-.2.1.1.2.2.3.3.1-.1.2-.2.3-.3 2.3-2.1 5.9-2 8.1.2 2.3 2.3 2.3 6.1 0 8.4l-7.3 7.05c-.3.3-.7.45-1.1.45z"
            fill="white"
            opacity="0.98"
          />
        </svg>
      </div>
      {showText && (
        <div className="leading-tight">
          <div className={`font-bold tracking-tight ${textClassName || 'text-base text-surface-900'}`}>
            JOSMEF
          </div>
          {taglineClassName !== 'hidden' && (
            <div className={`text-2xs ${taglineClassName || 'text-surface-400 -mt-0.5'}`}>
              God cures, we care
            </div>
          )}
        </div>
      )}
    </div>
  );
}
