'use client';

import { useEffect, useState } from 'react';
import {
  Building2, Palette, Image as ImageIcon, Sparkles, ShieldAlert,
  Check, RotateCcw, Save, Layers, User, Info,
} from 'lucide-react';

import { Button, Card, Input, Badge, useToast } from '@/components/ui';
import { FormSection, FormGrid } from '@/components/form';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useRole } from '@/hooks/useRole';
import { PLANS, type WorkspaceConfig, type SidebarStyleChoice, type PlanTier } from '@/lib/workspace';
import { ROLE_META, ROLE_ORDER, type Role } from '@/lib/roles';
import { AiCreditsWidget } from '@/components/ai';

export default function WorkspaceSettingsPage() {
  const { workspace, update, reset, plan, planDef, setPlan } = useWorkspace();
  const { role, setRole } = useRole();
  const toast = useToast();

  // Local editing copy
  const [draft, setDraft] = useState<WorkspaceConfig>(workspace);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(workspace);
    setDirty(false);
  }, [workspace]);

  function set<K extends keyof WorkspaceConfig>(k: K, v: WorkspaceConfig[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  }

  function handleSave() {
    update(draft);
    setDirty(false);
    toast.success('Workspace updated', 'New branding is live across the app.');
  }

  function handleReset() {
    if (!window.confirm('Reset workspace branding to NextNova defaults?')) return;
    reset();
    toast.info('Workspace reset to defaults');
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      toast.error('Logo too large', 'Please use an image under 200 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set('logoUrl', String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
              <Building2 className="w-4 h-4 text-white" />
            </span>
            Workspace
          </h1>
          <p className="text-sm text-surface-500 mt-1 ml-11">
            Customize your company branding, plan, and (demo) team roles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleReset}>
            Reset
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Save className="w-3.5 h-3.5" />} onClick={handleSave} disabled={!dirty}>
            Save changes
          </Button>
        </div>
      </div>

      {/* ── Demo notice ── */}
      <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
        <div>
          <strong>Frontend-only demo:</strong> branding and theme persist to this browser only. Plans, roles, and AI credits are cosmetic — server-side multi-tenancy, billing, and authorization aren't wired yet.
        </div>
      </div>

      {/* ── Branding ── */}
      <FormSection title="Branding" description="Company identity that appears across the app" icon={Building2}>
        <FormGrid cols={2}>
          <Input
            label="Company name"
            value={draft.companyName}
            onChange={(e) => set('companyName', e.target.value)}
            placeholder="e.g. ABC Medical"
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Logo</label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft overflow-hidden flex-shrink-0">
                {draft.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-white" />
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <input
                  type="file" accept="image/*" className="sr-only"
                  onChange={handleLogoUpload}
                />
                <span className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-surface-200 hover:border-surface-300 rounded-lg text-xs font-medium text-surface-700 transition-colors">
                  <ImageIcon className="w-3.5 h-3.5" /> Upload image
                </span>
              </label>
              {draft.logoUrl && (
                <button
                  type="button" onClick={() => set('logoUrl', '')}
                  className="text-2xs text-rose-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-2xs text-surface-500 mt-1.5">PNG, JPG, or SVG up to 200 KB. Stored locally as data URI.</p>
          </div>
        </FormGrid>
      </FormSection>

      {/* ── Colors ── */}
      <FormSection title="Theme colors" description="Drives the entire app palette via CSS variables" icon={Palette}>
        <FormGrid cols={2}>
          <ColorField
            label="Primary color"
            description="Buttons, links, focus rings, sidebar active state"
            value={draft.primaryHex}
            onChange={(v) => set('primaryHex', v)}
          />
          <ColorField
            label="Accent color"
            description="Gradients, highlights, badges"
            value={draft.accentHex}
            onChange={(v) => set('accentHex', v)}
          />
        </FormGrid>
        <p className="text-2xs text-surface-500 mt-3">
          Need more presets and corner/density tweaks? Use the full <a href="/dashboard/settings/theme-studio" className="text-primary-700 hover:underline font-medium">Theme Studio</a>.
        </p>
      </FormSection>

      {/* ── Layout ── */}
      <FormSection title="Layout" description="App-wide UI density and chrome" icon={Layers}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SidebarChoice
            value="floating"
            active={draft.sidebarStyle === 'floating'}
            onClick={() => set('sidebarStyle', 'floating')}
          />
          <SidebarChoice
            value="flush"
            active={draft.sidebarStyle === 'flush'}
            onClick={() => set('sidebarStyle', 'flush')}
          />
        </div>
      </FormSection>

      {/* ── Plan ── */}
      <section>
        <h2 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PLANS.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              current={plan === p.id}
              onPick={() => {
                setPlan(p.id as PlanTier);
                toast.success(`Switched to ${p.name}`, 'Display-only — billing pending.');
              }}
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <AiCreditsWidget variant="card" />
          <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-card">
            <div className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">Employee limit</div>
            <div className="text-2xl font-bold text-surface-900 mt-1 tabular-nums">
              {planDef.employeeLimit < 0 ? '∞' : planDef.employeeLimit}
              <span className="text-sm text-surface-400 font-normal ml-1">on {planDef.name}</span>
            </div>
            <p className="text-2xs text-surface-400 mt-3 italic">Limits are display-only until server enforcement is enabled.</p>
          </div>
        </div>
      </section>

      {/* ── Role switcher ── */}
      <FormSection
        title="Role"
        description="Switch active role to preview UI for different user types"
        icon={User}
        trailing={<Badge variant="warning" size="sm">Demo</Badge>}
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ROLE_ORDER.slice().reverse().map((r) => {
            const meta = ROLE_META[r as Role];
            const active = role === r;
            return (
              <button
                key={r} type="button"
                onClick={() => { setRole(r as Role); toast.info(`Now viewing as ${meta.label}`); }}
                className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                  active
                    ? 'bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-primary-300 ring-2 ring-primary-200'
                    : 'bg-white border-surface-200 hover:border-primary-200'
                }`}
              >
                <div className="text-sm font-semibold text-surface-900 flex items-center gap-1.5">
                  {meta.label}
                  {active && <Check className="w-3.5 h-3.5 text-primary-600" />}
                </div>
                <div className="text-2xs text-surface-500 mt-0.5 line-clamp-2">{meta.description}</div>
              </button>
            );
          })}
        </div>
        <p className="text-2xs text-surface-500 mt-3 flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
          Cosmetic only — hides UI elements but does NOT block API access. Server-side authorization is required for real security.
        </p>
      </FormSection>
    </div>
  );
}

// ─── Color field with native picker + hex input + swatch ───
function ColorField({
  label, description, value, onChange,
}: {
  label: string; description?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>
      {description && <p className="text-2xs text-surface-500 mb-2">{description}</p>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-11 h-11 rounded-lg border border-surface-200 cursor-pointer flex-shrink-0 bg-transparent"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#6366f1"
          className="flex-1 bg-white text-surface-900 border border-surface-200 hover:border-surface-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 rounded-lg h-11 px-3.5 text-sm font-mono outline-none transition-all"
        />
      </div>
    </div>
  );
}

// ─── Sidebar style picker ───
function SidebarChoice({
  value, active, onClick,
}: { value: SidebarStyleChoice; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left p-3 rounded-2xl border transition-all overflow-hidden ${
        active
          ? 'border-primary-300 ring-2 ring-primary-200 bg-gradient-to-br from-primary-500/5 to-accent-500/5'
          : 'border-surface-200 bg-white hover:border-primary-200'
      }`}
    >
      <div className="text-sm font-semibold text-surface-900 capitalize">{value} sidebar</div>
      <div className="text-2xs text-surface-500 mt-0.5">
        {value === 'floating' ? 'Detached panel with shadow — modern.' : 'Edge-to-edge — denser, more screen real estate.'}
      </div>
      {/* Visual hint */}
      <div className="mt-3 h-12 flex items-stretch gap-1">
        <div className={`${value === 'floating' ? 'rounded-lg shadow-card ml-1' : 'rounded-r-lg'} w-6 bg-gradient-to-b from-primary-500 to-accent-600`} />
        <div className="flex-1 bg-surface-50 rounded-lg" />
      </div>
      {active && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-soft">
          <Check className="w-3 h-3" />
        </span>
      )}
    </button>
  );
}

// ─── Plan card ───
function PlanCard({
  plan, current, onPick,
}: { plan: typeof PLANS[number]; current: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`relative text-left p-4 rounded-2xl border transition-all overflow-hidden ${
        current
          ? 'border-primary-300 ring-2 ring-primary-200 bg-gradient-to-br from-primary-500/5 to-accent-500/5 shadow-card-hover'
          : 'border-surface-200 bg-white hover:border-primary-200 hover:shadow-card-hover'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-base font-bold text-surface-900">{plan.name}</div>
          <div className="text-2xs text-surface-500">
            {plan.priceUsd === 0 && plan.id !== 'enterprise' ? 'Free' :
             plan.id === 'enterprise' ? 'Contact us' :
             `$${plan.priceUsd}/mo`}
          </div>
        </div>
        {current && <Badge variant="brand" size="sm" dot>Current</Badge>}
      </div>
      <ul className="space-y-1.5 mt-3">
        {plan.highlights.map((h) => (
          <li key={h} className="text-2xs text-surface-700 flex items-start gap-1.5">
            <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
