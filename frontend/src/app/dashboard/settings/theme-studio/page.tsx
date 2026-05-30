'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Sparkles, Save, Undo2, Eye, Palette, Sun, Moon,
  CornerUpLeft, Rows3, Rows2, Zap, ChevronRight, Check,
  Layers, X,
} from 'lucide-react';
import { PRESET_THEMES, type CustomTheme } from '@/lib/design-tokens';
import { useTheme } from '@/hooks/useTheme';
import { applyColorPalette, resetColorPalette, mapDensityForUseTheme } from '@/lib/color-utils';
import {
  Button, Input, Select, Card, CardHeader, CardBody,
  Badge, Avatar, Tabs, useToast,
} from '@/components/ui';

const LS_DRAFTS = 'nn:theme:drafts';
const LS_APPLIED = 'nn:theme:applied';

export default function ThemeStudioPage() {
  const { set: setThemePref, reset: resetGlobalTheme } = useTheme();
  const toast = useToast();

  // ── Working draft (the live editing state) ──
  const [draft, setDraft] = useState<CustomTheme>(PRESET_THEMES[0]);
  // ── Committed state (the actually-applied theme) ──
  const [applied, setApplied] = useState<CustomTheme>(PRESET_THEMES[0]);
  // ── User's saved presets ──
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>([]);
  // ── New preset name input ──
  const [newName, setNewName] = useState('');

  // ── Load applied + saved on mount AND re-apply colors ──
  useEffect(() => {
    try {
      const a = localStorage.getItem(LS_APPLIED);
      if (a) {
        const parsed = JSON.parse(a) as CustomTheme;
        setApplied(parsed);
        setDraft(parsed);
        // Re-apply colors on every load (in case localStorage survived a refresh)
        applyColorPalette(parsed.primaryHex, parsed.accentHex);
      }
      const d = localStorage.getItem(LS_DRAFTS);
      if (d) setSavedThemes(JSON.parse(d));
    } catch { /* */ }
  }, []);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(applied),
    [draft, applied],
  );

  // ── Live preview styles (scoped to preview panel only) ──
  const previewStyle = useMemo(() => {
    const p = hexToRgb(draft.primaryHex);
    const a = hexToRgb(draft.accentHex);
    const radiusMap = {
      sharp:   '0.25rem',
      default: '0.5rem',
      round:   '0.75rem',
      pillow:  '1rem',
    };
    return {
      '--preview-primary':   `${p?.r ?? 99} ${p?.g ?? 102} ${p?.b ?? 241}`,
      '--preview-accent':    `${a?.r ?? 139} ${a?.g ?? 92} ${a?.b ?? 246}`,
      '--preview-radius':    radiusMap[draft.cornerStyle],
      '--preview-bg':        draft.scheme === 'dark' ? '#0b0f1f' : '#fafafa',
      '--preview-text':      draft.scheme === 'dark' ? '#dee3f5' : '#18181b',
      '--preview-surface':   draft.scheme === 'dark' ? '#161b2c' : '#ffffff',
      '--preview-border':    draft.scheme === 'dark' ? 'rgba(255,255,255,0.06)' : '#e4e4e7',
    } as React.CSSProperties;
  }, [draft]);

  // ── Actions ──
  function loadPreset(p: CustomTheme) {
    setDraft({ ...p });
    toast.info(`Loaded preset: ${p.name}`);
  }

  function applyDraft() {
    setApplied(draft);
    try { localStorage.setItem(LS_APPLIED, JSON.stringify(draft)); } catch {}

    // 1. Generate full color shade scales + write CSS vars (this changes
    //    all .bg-accent / .text-accent / etc. across the whole app).
    applyColorPalette(draft.primaryHex, draft.accentHex);

    // 2. Sync with useTheme for the prefs it tracks
    setThemePref('colorScheme', draft.scheme);
    setThemePref('density',     mapDensityForUseTheme(draft.density));
    setThemePref('animations',
      draft.motionLevel === 'minimal' ? 'reduced' : 'on');

    toast.success('Theme applied', 'New colors live across the entire app.');
  }

  function cancelDraft() {
    setDraft(applied);
    toast.info('Reverted to applied theme');
  }

  function resetEverything() {
    if (!confirm('Reset everything — remove saved presets and revert to default Nova Indigo?')) return;
    setSavedThemes([]);
    setDraft(PRESET_THEMES[0]);
    setApplied(PRESET_THEMES[0]);
    try {
      localStorage.removeItem(LS_DRAFTS);
      localStorage.removeItem(LS_APPLIED);
    } catch {}
    resetColorPalette();   // strip inline color CSS vars from <html>
    resetGlobalTheme();    // reset useTheme prefs
    toast.warning('Reset complete', 'All custom themes removed.');
  }

  function saveAsPreset() {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error('Name required', 'Give your preset a name first.');
      return;
    }
    const newPreset: CustomTheme = {
      ...draft,
      name: trimmed,
      createdAt: new Date().toISOString(),
    };
    const next = [...savedThemes, newPreset];
    setSavedThemes(next);
    try { localStorage.setItem(LS_DRAFTS, JSON.stringify(next)); } catch {}
    setNewName('');
    toast.success(`Saved "${trimmed}"`, 'Now available in your presets.');
  }

  function deletePreset(name: string) {
    const next = savedThemes.filter(t => t.name !== name);
    setSavedThemes(next);
    try { localStorage.setItem(LS_DRAFTS, JSON.stringify(next)); } catch {}
    toast.info(`Deleted "${name}"`);
  }

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-600" /> Theme Studio
          </h2>
          <p className="text-sm text-surface-500 mt-1">
            Design your own theme. Changes preview live — apply when you're happy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Badge variant="warning" dot>Unsaved changes</Badge>
          )}
          <Button variant="ghost" size="sm" leftIcon={<Undo2 className="w-3.5 h-3.5" />} onClick={cancelDraft} disabled={!isDirty}>
            Cancel
          </Button>
          <Button size="sm" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={applyDraft} disabled={!isDirty}>
            Apply theme
          </Button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5">
        {/* ─── LEFT: Editor controls ─── */}
        <div className="space-y-5">
          {/* Presets */}
          <Card padding="none">
            <CardHeader
              icon={Layers}
              title="Presets"
              subtitle="Start from a built-in or your saved themes."
            />
            <div className="px-5 pb-5 space-y-2">
              <div>
                <div className="text-2xs font-semibold uppercase tracking-wider text-surface-400 mb-2">Built-in</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_THEMES.map(p => (
                    <PresetCard
                      key={p.name}
                      preset={p}
                      active={JSON.stringify(p) === JSON.stringify({ ...draft, createdAt: undefined })}
                      onLoad={() => loadPreset(p)}
                    />
                  ))}
                </div>
              </div>
              {savedThemes.length > 0 && (
                <div className="pt-3 mt-3 border-t border-surface-100">
                  <div className="text-2xs font-semibold uppercase tracking-wider text-surface-400 mb-2">Your presets</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {savedThemes.map(p => (
                      <PresetCard
                        key={p.name}
                        preset={p}
                        onLoad={() => loadPreset(p)}
                        onDelete={() => deletePreset(p.name)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Color editor */}
          <Card padding="none">
            <CardHeader
              icon={Palette}
              title="Colors"
              subtitle="Primary and accent define the palette across the app."
            />
            <div className="px-5 pb-5 space-y-4">
              <ColorRow
                label="Primary"
                value={draft.primaryHex}
                onChange={(v) => setDraft(d => ({ ...d, primaryHex: v }))}
              />
              <ColorRow
                label="Accent"
                value={draft.accentHex}
                onChange={(v) => setDraft(d => ({ ...d, accentHex: v }))}
              />
            </div>
          </Card>

          {/* Surface scheme */}
          <Card padding="none">
            <CardHeader
              icon={Sun}
              title="Surface"
              subtitle="Light, dark, or follow the user's system preference."
            />
            <div className="px-5 pb-5">
              <SegmentedControl
                value={draft.scheme}
                onChange={(v) => setDraft(d => ({ ...d, scheme: v as any }))}
                options={[
                  { value: 'light',  label: 'Light',  icon: Sun },
                  { value: 'dark',   label: 'Dark',   icon: Moon },
                  { value: 'system', label: 'System', icon: Eye },
                ]}
              />
            </div>
          </Card>

          {/* Corners */}
          <Card padding="none">
            <CardHeader
              icon={CornerUpLeft}
              title="Corner style"
              subtitle="Border radius scale for all rounded surfaces."
            />
            <div className="px-5 pb-5">
              <SegmentedControl
                value={draft.cornerStyle}
                onChange={(v) => setDraft(d => ({ ...d, cornerStyle: v as any }))}
                options={[
                  { value: 'sharp',   label: 'Sharp' },
                  { value: 'default', label: 'Default' },
                  { value: 'round',   label: 'Round' },
                  { value: 'pillow',  label: 'Pillow' },
                ]}
              />
            </div>
          </Card>

          {/* Density */}
          <Card padding="none">
            <CardHeader
              icon={Rows3}
              title="Density"
              subtitle="Controls vertical breathing room across the UI."
            />
            <div className="px-5 pb-5">
              <SegmentedControl
                value={draft.density}
                onChange={(v) => setDraft(d => ({ ...d, density: v as any }))}
                options={[
                  { value: 'compact',     label: 'Compact',     icon: Rows3 },
                  { value: 'comfortable', label: 'Comfortable', icon: Rows2 },
                  { value: 'cozy',        label: 'Cozy' },
                ]}
              />
            </div>
          </Card>

          {/* Motion */}
          <Card padding="none">
            <CardHeader
              icon={Zap}
              title="Motion"
              subtitle="How animated transitions feel."
            />
            <div className="px-5 pb-5">
              <SegmentedControl
                value={draft.motionLevel}
                onChange={(v) => setDraft(d => ({ ...d, motionLevel: v as any }))}
                options={[
                  { value: 'minimal',    label: 'Minimal' },
                  { value: 'standard',   label: 'Standard' },
                  { value: 'expressive', label: 'Expressive' },
                ]}
              />
            </div>
          </Card>

          {/* Save as preset */}
          <Card padding="none">
            <CardHeader
              icon={Save}
              title="Save as preset"
              subtitle="Save this configuration to reuse later."
            />
            <div className="px-5 pb-5 flex gap-2">
              <Input
                placeholder="e.g. My brand theme"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                fullWidth
              />
              <Button onClick={saveAsPreset} leftIcon={<Save className="w-3.5 h-3.5" />}>
                Save
              </Button>
            </div>
          </Card>

          <button
            onClick={resetEverything}
            className="text-xs text-rose-500 hover:text-rose-700 px-2 py-1"
          >
            Reset everything to defaults
          </button>
        </div>

        {/* ─── RIGHT: Live preview ─── */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card padding="none">
            <CardHeader
              icon={Eye}
              title="Live preview"
              subtitle={`Previewing "${draft.name}" — does not affect the rest of the app until applied.`}
            />
            <div className="px-5 pb-5">
              <ThemePreview style={previewStyle} draft={draft} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

function PresetCard({
  preset, active, onLoad, onDelete,
}: {
  preset: CustomTheme;
  active?: boolean;
  onLoad: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className={`group relative rounded-lg border-2 transition-all
      ${active ? 'border-surface-900 shadow-card-hover' : 'border-surface-200 hover:border-surface-300'}`}>
      <button onClick={onLoad} className="w-full text-left p-2">
        <div
          className="h-10 rounded-md mb-1.5"
          style={{ background: `linear-gradient(135deg, ${preset.primaryHex}, ${preset.accentHex})` }}
        />
        <div className="text-xs font-semibold text-surface-700 truncate">{preset.name}</div>
        <div className="text-2xs text-surface-400 truncate capitalize">
          {preset.scheme} · {preset.cornerStyle}
        </div>
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-1 right-1 w-5 h-5 rounded bg-white/80 backdrop-blur text-surface-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
          aria-label="Delete preset"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

function ColorRow({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-surface-600 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <div
            className="w-10 h-10 rounded-lg border border-surface-200 shadow-soft cursor-pointer"
            style={{ background: value }}
          />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono uppercase"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function SegmentedControl({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; icon?: any }[];
}) {
  return (
    <div className="inline-flex p-0.5 bg-surface-100 border border-surface-200 rounded-lg w-full">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
            ${value === o.value
              ? 'bg-white text-surface-900 shadow-soft'
              : 'text-surface-500 hover:text-surface-900'}`}
        >
          {o.icon && <o.icon className="w-3.5 h-3.5" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ThemePreview({ style, draft }: { style: React.CSSProperties; draft: CustomTheme }) {
  const primaryRgb = `rgb(var(--preview-primary))`;
  const accentRgb  = `rgb(var(--preview-accent))`;
  return (
    <div
      style={style}
      className="rounded-2xl overflow-hidden border"
    >
      <div
        className="p-6 space-y-4"
        style={{
          background: 'var(--preview-bg)',
          color: 'var(--preview-text)',
          borderRadius: 'var(--preview-radius)',
        }}
      >
        {/* Preview header */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--preview-border)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 flex items-center justify-center text-white font-bold"
              style={{
                background: `linear-gradient(135deg, ${draft.primaryHex}, ${draft.accentHex})`,
                borderRadius: 'var(--preview-radius)',
              }}
            >
              N
            </div>
            <span className="font-semibold">NextNova</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs opacity-70">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10b981' }} />
            Online
          </div>
        </div>

        {/* Preview KPI card */}
        <div
          className="p-4 border"
          style={{
            background: 'var(--preview-surface)',
            borderColor: 'var(--preview-border)',
            borderRadius: 'var(--preview-radius)',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-60 uppercase tracking-wider font-semibold">Total Revenue</div>
              <div className="text-3xl font-bold tabular-nums mt-1">₱2.4M</div>
              <div className="text-xs mt-1" style={{ color: primaryRgb }}>↑ 12.5% vs last month</div>
            </div>
            <div
              className="w-10 h-10 flex items-center justify-center text-white"
              style={{
                background: `linear-gradient(135deg, ${draft.primaryHex}, ${draft.accentHex})`,
                borderRadius: 'var(--preview-radius)',
              }}
            >
              ✦
            </div>
          </div>
        </div>

        {/* Preview buttons */}
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-white text-sm font-semibold shadow-soft"
            style={{
              background: `linear-gradient(135deg, ${draft.primaryHex}, ${draft.accentHex})`,
              borderRadius: 'var(--preview-radius)',
            }}
          >
            Primary
          </button>
          <button
            className="px-4 py-2 text-sm font-medium border"
            style={{
              background: 'var(--preview-surface)',
              color: 'var(--preview-text)',
              borderColor: 'var(--preview-border)',
              borderRadius: 'var(--preview-radius)',
            }}
          >
            Secondary
          </button>
          <button
            className="px-3 py-2 text-sm font-medium border opacity-80"
            style={{
              background: 'transparent',
              color: primaryRgb,
              borderColor: 'var(--preview-border)',
              borderRadius: 'var(--preview-radius)',
            }}
          >
            Outline
          </button>
        </div>

        {/* Preview badge row */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-2xs font-semibold px-2 py-0.5"
            style={{ background: `${draft.primaryHex}20`, color: primaryRgb, borderRadius: 'var(--preview-radius)' }}>
            Primary
          </span>
          <span className="text-2xs font-semibold px-2 py-0.5"
            style={{ background: `${draft.accentHex}20`, color: accentRgb, borderRadius: 'var(--preview-radius)' }}>
            Accent
          </span>
          <span className="text-2xs font-semibold px-2 py-0.5"
            style={{ background: '#10b98120', color: '#059669', borderRadius: 'var(--preview-radius)' }}>
            Success
          </span>
          <span className="text-2xs font-semibold px-2 py-0.5"
            style={{ background: '#f59e0b20', color: '#d97706', borderRadius: 'var(--preview-radius)' }}>
            Warning
          </span>
        </div>

        {/* Preview input */}
        <input
          type="text"
          placeholder="Sample input field…"
          defaultValue="Hello, world"
          className="w-full px-3 py-2 text-sm border outline-none"
          style={{
            background: 'var(--preview-surface)',
            color: 'var(--preview-text)',
            borderColor: 'var(--preview-border)',
            borderRadius: 'var(--preview-radius)',
          }}
        />

        {/* Preview list row */}
        <div className="space-y-1">
          {[
            { name: 'Maria Cruz', role: 'RN · Active' },
            { name: 'Juan Reyes', role: 'MD · On leave' },
          ].map(p => (
            <div
              key={p.name}
              className="flex items-center gap-3 p-2"
              style={{
                background: 'var(--preview-surface)',
                borderRadius: 'var(--preview-radius)',
              }}
            >
              <div
                className="w-7 h-7 flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: `linear-gradient(135deg, ${draft.primaryHex}, ${draft.accentHex})`,
                  borderRadius: 'var(--preview-radius)',
                }}
              >
                {p.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs opacity-60">{p.role}</div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}
