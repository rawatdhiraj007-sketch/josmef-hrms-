'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Palette, User, Bell, Plug, Building2,
  Settings as SettingsIcon, Sparkles, Boxes,
} from 'lucide-react';

const sections = [
  {
    label: 'Personal',
    items: [
      { href: '/dashboard/settings',            label: 'General',     icon: SettingsIcon },
      { href: '/dashboard/settings/appearance', label: 'Appearance',  icon: Palette },
      { href: '/dashboard/settings/profile',    label: 'Profile',     icon: User },
      { href: '/dashboard/settings/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'Design System',
    items: [
      { href: '/dashboard/settings/theme-studio', label: 'Theme Studio', icon: Sparkles },
      { href: '/dashboard/settings/components',   label: 'Components',   icon: Boxes },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { href: '/dashboard/settings/workspace', label: 'Branding & Plan', icon: Building2 },
      { href: '/dashboard/integrations',       label: 'Integrations',    icon: Plug },
    ],
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6 animate-fade-in">
      {/* ── Sidebar nav ── */}
      <aside className="lg:sticky lg:top-20 lg:self-start space-y-5">
        <div>
          <h1 className="text-xl font-bold text-surface-900 tracking-tight px-2">Settings</h1>
          <p className="text-xs text-surface-500 mt-0.5 px-2">Manage your workspace</p>
        </div>

        {sections.map(section => (
          <div key={section.label}>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-surface-400 px-3 mb-1.5">
              {section.label}
            </div>
            <nav className="space-y-0.5">
              {section.items.map(item => {
                const active = pathname === item.href ||
                  (item.href !== '/dashboard/settings' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href}>
                    <span className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                      ${active
                        ? 'bg-gradient-to-r from-primary-50 via-primary-50/50 to-transparent text-primary-700'
                        : 'text-surface-600 hover:bg-surface-100/70 hover:text-surface-900'}`}
                    >
                      <item.icon className={`w-4 h-4 ${active ? 'text-primary-600' : 'text-surface-400'}`} />
                      <span className="flex-1">{item.label}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </aside>

      {/* ── Main content ── */}
      <main className="min-w-0">{children}</main>
    </div>
  );
}
