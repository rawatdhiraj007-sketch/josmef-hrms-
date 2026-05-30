'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

interface DropdownProps {
  trigger: ReactNode;
  align?: 'left' | 'right';
  children: ReactNode;
}

/**
 * Click-to-open dropdown with click-outside dismiss, Esc-to-close,
 * and arrow-key navigation between menu items.
 */
export default function Dropdown({ trigger, align = 'right', children }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Click outside closes
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };

    // Esc + arrow key navigation
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (!menu.current) return;
      const items = Array.from(
        menu.current.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'),
      );
      if (items.length === 0) return;
      const focused = document.activeElement as HTMLElement;
      const idx     = items.indexOf(focused as HTMLButtonElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(idx + 1) % items.length].focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(idx - 1 + items.length) % items.length].focus();
      }
      if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
      if (e.key === 'End')  { e.preventDefault(); items[items.length - 1]?.focus(); }
    };

    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown',   onKey);

    // Focus first item on open
    requestAnimationFrame(() => {
      const first = menu.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)');
      first?.focus();
    });

    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown',   onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div
          ref={menu}
          className={`absolute z-30 mt-1.5 min-w-[200px] bg-white border border-surface-200 rounded-xl shadow-card-hover py-1
                      animate-scale-in origin-top-right
                      ${align === 'right' ? 'right-0' : 'left-0 origin-top-left'}`}
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
                  focus:outline-none focus-visible:bg-surface-100
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${variant === 'danger'
                    ? 'text-rose-600 hover:bg-rose-50 focus-visible:bg-rose-50'
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
