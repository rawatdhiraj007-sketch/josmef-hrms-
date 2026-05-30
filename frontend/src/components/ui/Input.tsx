'use client';

import { forwardRef, InputHTMLAttributes, ReactNode, useId } from 'react';

interface BaseFieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseFieldProps {
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-10 px-3.5 text-sm',
  lg: 'h-11 px-4 text-sm',
} as const;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label, description, error, required, hint,
    leftIcon, rightIcon, fullWidth = true,
    size = 'md', className = '', id, ...rest
  },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-surface-700 mb-1.5"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      {description && (
        <p className="text-xs text-surface-500 mb-2">{description}</p>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          className={`
            w-full bg-white text-surface-900 placeholder:text-surface-400
            border rounded-lg
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400
            disabled:bg-surface-50 disabled:cursor-not-allowed disabled:text-surface-400
            ${SIZES[size]}
            ${leftIcon ? 'pl-9' : ''}
            ${rightIcon ? 'pr-9' : ''}
            ${error
              ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
              : 'border-surface-200 hover:border-surface-300'}
            ${className}
          `}
          {...rest}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
            {rightIcon}
          </span>
        )}
      </div>

      {(error || hint) && (
        <p
          id={error ? `${inputId}-err` : `${inputId}-hint`}
          className={`text-xs mt-1.5 ${error ? 'text-rose-600' : 'text-surface-500'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
});

export default Input;

// ─── Textarea sibling ──────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, description, error, required, hint, fullWidth = true, className = '', id, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-700 mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {description && <p className="text-xs text-surface-500 mb-2">{description}</p>}
      <textarea
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={!!error}
        className={`
          w-full bg-white text-surface-900 placeholder:text-surface-400
          border rounded-lg px-3.5 py-2.5 text-sm
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400
          disabled:bg-surface-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-400'
            : 'border-surface-200 hover:border-surface-300'}
          ${className}
        `}
        {...rest}
      />
      {(error || hint) && (
        <p className={`text-xs mt-1.5 ${error ? 'text-rose-600' : 'text-surface-500'}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
});
