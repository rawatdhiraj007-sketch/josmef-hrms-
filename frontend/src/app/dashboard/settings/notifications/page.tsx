'use client';

import { useEffect, useState } from 'react';
import {
  Bell, Mail, MessageSquare, ShieldAlert, Plane, DollarSign,
  Sparkles, Calendar, Info, Save,
} from 'lucide-react';

import { Button, Card, Badge, useToast } from '@/components/ui';

interface ChannelPrefs {
  email: boolean;
  inApp: boolean;
}

interface NotificationPrefs {
  leaveApprovals:    ChannelPrefs;
  leaveDecided:      ChannelPrefs;
  licenseExpiring:   ChannelPrefs;
  payrollReleased:   ChannelPrefs;
  shiftAssigned:     ChannelPrefs;
  aiAlerts:          ChannelPrefs;
  weeklyDigest:      ChannelPrefs;
}

const DEFAULTS: NotificationPrefs = {
  leaveApprovals:  { email: true,  inApp: true },
  leaveDecided:    { email: true,  inApp: true },
  licenseExpiring: { email: true,  inApp: true },
  payrollReleased: { email: false, inApp: true },
  shiftAssigned:   { email: false, inApp: true },
  aiAlerts:        { email: false, inApp: true },
  weeklyDigest:    { email: true,  inApp: false },
};

const LS_KEY = 'nn:notifications:prefs';

const CATEGORIES: { key: keyof NotificationPrefs; icon: any; label: string; description: string }[] = [
  { key: 'leaveApprovals',  icon: Plane,        label: 'Leave requests need approval', description: 'When an employee files a leave request that needs your approval.' },
  { key: 'leaveDecided',    icon: Plane,        label: 'My leave request decided',     description: 'When HR approves or rejects your leave request.' },
  { key: 'licenseExpiring', icon: ShieldAlert,  label: 'License expiring soon',        description: 'When a professional license is within 30 days of expiry.' },
  { key: 'payrollReleased', icon: DollarSign,   label: 'Payroll released',             description: 'When a new payslip is available to view.' },
  { key: 'shiftAssigned',   icon: Calendar,     label: 'Shift assigned',               description: 'When a new shift is added to your schedule.' },
  { key: 'aiAlerts',        icon: Sparkles,     label: 'AI alerts',                    description: 'Critical insights flagged by NextNova AI (compliance, leave backlog, etc).' },
  { key: 'weeklyDigest',    icon: Mail,         label: 'Weekly digest',                description: 'Summary of activity every Monday morning.' },
];

export default function NotificationsSettingsPage() {
  const toast = useToast();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULTS);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPrefs({ ...DEFAULTS, ...parsed });
      }
    } catch { /* */ }
  }, []);

  function toggle(category: keyof NotificationPrefs, channel: keyof ChannelPrefs) {
    setPrefs((p) => ({ ...p, [category]: { ...p[category], [channel]: !p[category][channel] } }));
    setDirty(true);
  }

  function save() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(prefs));
      setDirty(false);
      toast.success('Preferences saved', 'Delivery wiring pending — see note below.');
    } catch {
      toast.error('Could not save preferences');
    }
  }

  function resetDefaults() {
    setPrefs(DEFAULTS);
    setDirty(true);
  }

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-surface-500 mt-1">
            Pick when and how you want to be notified
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={resetDefaults}>Reset defaults</Button>
          <Button variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />} onClick={save} disabled={!dirty}>
            Save preferences
          </Button>
        </div>
      </div>

      {/* Demo notice */}
      <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
        <div>
          <strong>Preferences-only:</strong> these settings persist to this browser, but actual email / push delivery requires the notifications service to be wired on the backend. The AI Command Center shows in-app alerts today.
        </div>
      </div>

      {/* Channel header */}
      <Card padding="none">
        <div className="grid grid-cols-[1fr_80px_80px] gap-3 px-4 sm:px-5 py-3 border-b border-surface-100 text-2xs font-bold text-surface-500 uppercase tracking-wider">
          <div>Category</div>
          <div className="text-center flex items-center justify-center gap-1">
            <Mail className="w-3 h-3" /> Email
          </div>
          <div className="text-center flex items-center justify-center gap-1">
            <Bell className="w-3 h-3" /> In-app
          </div>
        </div>
        <ul className="divide-y divide-surface-100">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const p = prefs[c.key];
            return (
              <li key={c.key} className="grid grid-cols-[1fr_80px_80px] gap-3 px-4 sm:px-5 py-3 items-center hover:bg-surface-50/60 transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-surface-900">{c.label}</div>
                    <div className="text-2xs text-surface-500 mt-0.5">{c.description}</div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Switch checked={p.email} onChange={() => toggle(c.key, 'email')} ariaLabel={`Email — ${c.label}`} />
                </div>
                <div className="flex justify-center">
                  <Switch checked={p.inApp} onChange={() => toggle(c.key, 'inApp')} ariaLabel={`In-app — ${c.label}`} />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Quiet hours (placeholder for future) */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-surface-200 to-surface-100 text-surface-600 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-surface-900">Quiet hours</div>
              <div className="text-2xs text-surface-500 mt-0.5">Suppress non-critical notifications outside working hours.</div>
            </div>
          </div>
          <Badge variant="neutral" size="sm">Soon</Badge>
        </div>
      </Card>
    </div>
  );
}

function Switch({
  checked, onChange, ariaLabel,
}: { checked: boolean; onChange: () => void; ariaLabel?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`
        relative inline-flex h-5 w-9 rounded-full transition-colors flex-shrink-0
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/40
        ${checked ? 'bg-gradient-to-r from-primary-500 to-accent-500' : 'bg-surface-200'}
      `}
    >
      <span
        aria-hidden
        className={`
          absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm
          transition-transform
          ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}
        `}
      />
    </button>
  );
}
