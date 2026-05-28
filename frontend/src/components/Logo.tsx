'use client';

import Image from 'next/image';
import { useState } from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textClassName?: string;
  taglineClassName?: string;
}

export default function Logo({
  size = 48,
  showText = true,
  textClassName = '',
  taglineClassName = '',
}: LogoProps) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        {!imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logo.png"
            alt="JOSMEF Logo"
            width={size}
            height={size}
            className="object-contain"
            onError={() => setImgFailed(true)}
          />
        ) : (
          // Inline SVG fallback — gradient ring + heart silhouette + JOSMEF mark
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="josmefGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#josmefGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="240 40"
              transform="rotate(-90 50 50)"
            />
            <path
              d="M50 72 C 30 58, 22 42, 32 32 C 40 25, 48 30, 50 36 C 52 30, 60 25, 68 32 C 78 42, 70 58, 50 72 Z"
              fill="#dc2626"
            />
            <rect x="32" y="46" width="36" height="10" rx="2" fill="#fbbf24" />
            <text
              x="50"
              y="54"
              textAnchor="middle"
              fontSize="7"
              fontWeight="800"
              fill="#fff"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              JOSMEF
            </text>
          </svg>
        )}
      </div>
      {showText && (
        <div className="leading-tight">
          <div className={`font-bold tracking-tight ${textClassName || 'text-xl'}`}>
            JOSMEF
          </div>
          <div className={`text-xs italic ${taglineClassName || 'text-gray-500'}`}>
            God cures, we care
          </div>
        </div>
      )}
    </div>
  );
}
