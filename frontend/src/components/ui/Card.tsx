'use client';

import { ReactNode } from 'react';

interface CardProps {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  /** Top accent gradient line (e.g. for KPI/feature cards) */
  accent?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

const VARIANTS = {
  default:  'bg-white border border-surface-200 shadow-card',
  elevated: 'bg-white border border-surface-200 shadow-card-hover',
  outline:  'bg-transparent border border-surface-200',
  ghost:    'bg-surface-50/60 border border-surface-100',
} as const;

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
} as const;

export default function Card({
  variant = 'default',
  padding = 'md',
  hover,
  accent,
  className = '',
  children,
  onClick,
}: CardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl text-left w-full
        ${VARIANTS[variant]} ${PADDING[padding]}
        ${hover ? 'transition-all duration-200 hover:shadow-card-hover hover:border-surface-300 hover:-translate-y-0.5' : ''}
        ${onClick ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/50' : ''}
        ${className}
      `}
    >
      {accent && (
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent" />
      )}
      {children}
    </Tag>
  );
}

// ─── Compound parts ────────────────────────────────────────
interface CardHeaderProps {
  icon?: any;
  iconGradient?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function CardHeader({ icon: Icon, iconGradient, title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-black/[0.06]"
            style={{ background: iconGradient ?? 'linear-gradient(135deg, #4f46e5, #8b5cf6)' }}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
        )}
        <div>
          <h3 className="font-semibold text-surface-900">{title}</h3>
          {subtitle && <p className="text-xs text-surface-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mt-4 pt-4 border-t border-surface-100 ${className}`}>{children}</div>
  );
}
