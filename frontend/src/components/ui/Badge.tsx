'use client';

import { ReactNode } from 'react';
import { statusColors, StatusVariant } from '@/lib/design-tokens';

interface BadgeProps {
  variant?: StatusVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Badge({
  variant = 'neutral',
  size    = 'sm',
  dot,
  icon,
  children,
  className = '',
}: BadgeProps) {
  const c = statusColors[variant];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-md
                  ${c.bg} ${c.text} ring-1 ${c.ring} ${padding} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${c.accent}`} />}
      {icon}
      {children}
    </span>
  );
}
