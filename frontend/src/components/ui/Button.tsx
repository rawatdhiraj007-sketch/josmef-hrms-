'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 ' +
    'text-white shadow-soft hover:shadow-glow ' +
    'focus-visible:ring-primary-400/50 active:scale-[0.98]',
  secondary:
    'bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 hover:border-surface-300 hover:shadow-soft ' +
    'focus-visible:ring-primary-300/50 active:scale-[0.98]',
  ghost:
    'bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900 ' +
    'focus-visible:ring-surface-300 active:scale-[0.97]',
  outline:
    'bg-transparent text-primary-700 border border-primary-300 hover:bg-primary-50 hover:border-primary-400 ' +
    'focus-visible:ring-primary-400/50 active:scale-[0.98]',
  danger:
    'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-soft hover:shadow-[0_0_24px_rgba(244,63,94,0.35)] ' +
    'focus-visible:ring-rose-400/50 active:scale-[0.98]',
  success:
    'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-soft hover:shadow-[0_0_24px_rgba(16,185,129,0.35)] ' +
    'focus-visible:ring-emerald-400/50 active:scale-[0.98]',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-sm rounded-lg gap-2',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size    = 'md',
    loading,
    leftIcon,
    rightIcon,
    fullWidth,
    children,
    className = '',
    disabled,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        font-semibold whitespace-nowrap
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none
        touch-manipulation
        ${SIZES[size]} ${VARIANTS[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

export default Button;
