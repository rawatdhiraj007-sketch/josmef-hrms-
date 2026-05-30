'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  align?: 'left' | 'right';
  children: ReactNode;
}

/**
 * Lightweight click-to-open dropdown. No focus trap (keep simple).
 * Use <DropdownItem> for menu items.
 */
export default function Dropdown({ trigger, align = 'right', children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-30 mt-1.5 min-w-[200px] bg-white border border-surface-200 rounded-xl shadow-card-hover py-1
                      animate-slide-up
                      ${align === 'right' ? 'right-0' : 'left-0'}`}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  icon?: any;
  onClick?: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  children: ReactNode;
}

export function DropdownItem({ icon: Icon, onClick, variant = 'default', disabled, children }: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${variant === 'danger'
                    ? 'text-rose-600 hover:bg-rose-50'
                    : 'text-surface-700 hover:bg-surface-50 hover:text-surface-900'}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span className="flex-1">{children}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 h-px bg-surface-100" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <div className="px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-surface-400">
      {children}
    </div>
  );
}
