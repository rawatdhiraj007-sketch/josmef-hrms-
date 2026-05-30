'use client';

import { ReactNode, useState, KeyboardEvent } from 'react';

interface Tab {
  value: string;
  label: string;
  icon?: any;
  count?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'line' | 'pill' | 'enclosed';
  children?: (activeValue: string) => ReactNode;
  className?: string;
}

export default function Tabs({
  tabs, defaultValue, value, onChange,
  variant = 'line', children, className = '',
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? tabs[0]?.value);
  const active = value ?? internalValue;

  function selectTab(v: string) {
    if (value === undefined) setInternalValue(v);
    onChange?.(v);
  }

  function onKey(e: KeyboardEvent, idx: number) {
    if (e.key === 'ArrowRight') selectTab(tabs[(idx + 1) % tabs.length].value);
    if (e.key === 'ArrowLeft')  selectTab(tabs[(idx - 1 + tabs.length) % tabs.length].value);
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        className={
          variant === 'pill'
            ? 'inline-flex p-1 bg-surface-100 border border-surface-200 rounded-xl gap-0.5'
            : variant === 'enclosed'
              ? 'flex gap-0 border-b border-surface-200'
              : 'flex gap-1 border-b border-surface-200'
        }
      >
        {tabs.map((tab, i) => {
          const isActive = tab.value === active;
          const base =
            'inline-flex items-center gap-2 font-medium transition-all duration-150 ' +
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/40';
          const styles =
            variant === 'pill'
              ? `px-3 py-1.5 rounded-lg text-xs ${
                  isActive
                    ? 'bg-white text-surface-900 shadow-soft'
                    : 'text-surface-500 hover:text-surface-900'}`
              : variant === 'enclosed'
                ? `px-4 py-2.5 text-sm border-t border-x border-transparent rounded-t-lg -mb-px ${
                    isActive
                      ? 'bg-white text-surface-900 border-surface-200'
                      : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'}`
                : `px-3 py-2.5 text-sm border-b-2 -mb-px ${
                    isActive
                      ? 'border-primary-600 text-primary-700'
                      : 'border-transparent text-surface-500 hover:text-surface-900'}`;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => selectTab(tab.value)}
              onKeyDown={(e) => onKey(e, i)}
              className={`${base} ${styles} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              {tab.label}
              {tab.count !== undefined && (
                <span className="bg-surface-100 text-surface-600 text-2xs font-semibold px-1.5 py-0.5 rounded">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {children && (
        <div role="tabpanel" className="mt-4 animate-tab-in" key={active}>
          {children(active)}
        </div>
      )}
    </div>
  );
}
