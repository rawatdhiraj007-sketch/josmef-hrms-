'use client';

import { ReactNode } from 'react';

interface SettingRowProps {
  label: string;
  description?: string;
  icon?: any;
  /** Right-side control (Switch, dropdown, swatches, etc.) */
  control: ReactNode;
  /** Optional preview content shown below the row */
  preview?: ReactNode;
  /** First/last in group → adjust borders */
  isFirst?: boolean;
  isLast?: boolean;
}

/**
 * A single setting row used inside a SettingsGroup.
 * Layout: icon + label/description on the left, control on the right.
 */
export default function SettingRow({
  label, description, icon: Icon, control, preview, isFirst, isLast,
}: SettingRowProps) {
  return (
    <div
      className={`flex items-start gap-4 px-5 py-4 transition-colors
                  ${!isFirst ? 'border-t border-surface-100' : ''}`}
    >
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-surface-50 to-surface-100 border border-surface-200/70 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-surface-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-surface-900">{label}</div>
        {description && (
          <p className="text-xs text-surface-500 mt-0.5 leading-relaxed">{description}</p>
        )}
        {preview && <div className="mt-3">{preview}</div>}
      </div>
      <div className="flex-shrink-0 pt-0.5">{control}</div>
    </div>
  );
}

interface SettingsGroupProps {
  title: string;
  description?: string;
  icon?: any;
  children: ReactNode;
}

/**
 * Group of related settings (a "card" with a header).
 */
export function SettingsGroup({ title, description, icon: Icon, children }: SettingsGroupProps) {
  return (
    <section className="rounded-2xl border border-surface-200 bg-white shadow-card overflow-hidden">
      <header className="px-5 py-4 border-b border-surface-200 bg-surface-50/40">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
              <Icon className="w-3.5 h-3.5 text-white" />
            </div>
          )}
          <h2 className="text-sm font-semibold text-surface-900">{title}</h2>
        </div>
        {description && (
          <p className="text-xs text-surface-500 mt-1.5 ml-10">{description}</p>
        )}
      </header>
      <div className="divide-y divide-surface-100/0">{children}</div>
    </section>
  );
}
