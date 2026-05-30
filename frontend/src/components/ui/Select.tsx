'use client';

import { forwardRef, SelectHTMLAttributes, useId, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  description?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
}

const SIZES = {
  sm: 'h-8 pl-2.5 pr-8 text-xs',
  md: 'h-10 pl-3.5 pr-9 text-sm',
  lg: 'h-11 pl-4 pr-10 text-sm',
} as const;

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label, description, error, hint, required,
    fullWidth = true, size = 'md',
    className = '', id, children, ...rest
  },
  ref,
) {
  const reactId = useId();
  const selectId = id ?? reactId;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-surface-700 mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {description && <p className="text-xs text-surface-500 mb-2">{description}</p>}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`
            w-full appearance-none bg-white text-surface-900
            border rounded-lg cursor-pointer
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400
            disabled:bg-surface-50 disabled:cursor-not-allowed
            ${SIZES[size]}
            ${error
              ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
              : 'border-surface-200 hover:border-surface-300'}
            ${className}
          `}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-surface-400 pointer-events-none`} />
      </div>

      {(error || hint) && (
        <p className={`text-xs mt-1.5 ${error ? 'text-rose-600' : 'text-surface-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

export default Select;
