'use client';

import Link from 'next/link';
import { Palette, Settings as SettingsIcon, ArrowRight } from 'lucide-react';

export default function SettingsHomePage() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-surface-900 tracking-tight">General</h2>
        <p className="text-sm text-surface-500 mt-1">
          Manage your account preferences and workspace settings.
        </p>
      </header>

      <Link
        href="/dashboard/settings/appearance"
        className="block rounded-2xl border border-surface-200 bg-white p-6 hover:border-primary-300 hover:shadow-card-hover transition-all group"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-surface-900">Appearance</h3>
            <p className="text-sm text-surface-500 mt-0.5">
              Theme, accent color, sidebar style, density, animations.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-surface-300 group-hover:text-surface-700 group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>

      <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50/40 p-6 text-center">
        <SettingsIcon className="w-8 h-8 text-surface-300 mx-auto mb-2" />
        <p className="text-sm text-surface-500">
          More settings panels coming soon — Profile, Notifications, Security, Integrations.
        </p>
      </div>
    </div>
  );
}
