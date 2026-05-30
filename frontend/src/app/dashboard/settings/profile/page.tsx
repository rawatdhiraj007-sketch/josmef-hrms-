'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useWorkspace } from '@/hooks/useWorkspace';
import {
  User, AtSign, Building2, Shield, LogOut, Info,
} from 'lucide-react';

import { Button, Badge, Card } from '@/components/ui';
import { InfoRow } from '@/components/detail';
import Avatar from '@/components/ui/Avatar';
import { ROLE_META } from '@/lib/roles';

export default function ProfileSettingsPage() {
  const { user, logout } = useAuth();
  const { role } = useRole();
  const { workspace, planDef } = useWorkspace();

  if (!user) {
    return (
      <div className="text-center py-20 text-surface-400 text-sm">Loading…</div>
    );
  }

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const roleMeta = ROLE_META[role];

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-surface-500 mt-1">
          Your account info, workspace context, and active role
        </p>
      </div>

      {/* Hero card */}
      <Card padding="none" className="overflow-hidden">
        <div className="h-20 sm:h-24 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600" />
        <div className="px-5 sm:px-6 pb-5 -mt-10 sm:-mt-12 flex flex-col sm:flex-row sm:items-end gap-4">
          <Avatar name={fullName} size="xl" className="ring-4 ring-white shadow-lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-bold text-surface-900 tracking-tight">{fullName || 'Unnamed user'}</h2>
              <Badge variant={roleMeta.tone} dot>{roleMeta.label}</Badge>
            </div>
            <p className="text-sm text-surface-600 flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-surface-400" />
              <span>{(user as any).email || '—'}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Info notice */}
      <div className="px-4 py-3 rounded-xl bg-primary-50/60 border border-primary-200/60 text-primary-900 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-600" />
        <div>
          This is your read-only account profile. To update name or email, contact a workspace admin or HR. To change your role for this demo, visit <a href="/dashboard/settings/workspace" className="font-semibold underline">Workspace settings</a>.
        </div>
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-600" /> Account
          </h3>
          <div className="space-y-3">
            <InfoRow icon={User}    label="First name" value={user.firstName} />
            <InfoRow                label="Last name"  value={user.lastName} />
            <InfoRow icon={AtSign}  label="Email"      value={(user as any).email} />
            <InfoRow                label="User ID"    value={(user as any).id} mono />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-600" /> Workspace
          </h3>
          <div className="space-y-3">
            <InfoRow icon={Building2} label="Company" value={workspace.companyName} />
            <InfoRow                  label="Plan"    value={`${planDef.name} · ${planDef.priceUsd === 0 && planDef.id !== 'enterprise' ? 'Free' : planDef.id === 'enterprise' ? 'Contact us' : `$${planDef.priceUsd}/mo`}`} />
            <InfoRow                  label="Employee limit" value={planDef.employeeLimit < 0 ? 'Unlimited' : String(planDef.employeeLimit)} />
            <InfoRow                  label="AI requests / month" value={planDef.aiCreditsPerMonth < 0 ? 'Unlimited' : planDef.aiCreditsPerMonth.toLocaleString()} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-600" /> Active role
          </h3>
          <div className="flex items-center gap-3">
            <Badge variant={roleMeta.tone} size="md" dot>{roleMeta.label}</Badge>
            <p className="text-sm text-surface-600">{roleMeta.description}</p>
          </div>
          <p className="text-2xs text-surface-400 mt-3 italic">
            Cosmetic only — server-side authorization is required for real security.
          </p>
        </Card>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2 border-t border-surface-100">
        <p className="text-2xs text-surface-400">
          Last sign-in tracking will appear here when audit logging is enabled.
        </p>
        <Button
          variant="ghost" size="sm"
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
          onClick={() => logout()}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
