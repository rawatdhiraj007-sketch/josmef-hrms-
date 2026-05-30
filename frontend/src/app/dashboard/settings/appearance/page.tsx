'use client';

import {
  Palette, Sun, Moon, Monitor, Sparkles,
  PanelLeft, Rows3, Rows2, Zap, Check, RotateCcw,
} from 'lucide-react';
import {
  useTheme, ACCENT_PALETTES,
  type ColorScheme, type Accent, type SidebarStyle, type Density,
} from '@/hooks/useTheme';
import Switch from '@/components/settings/Switch';
import SettingRow, { SettingsGroup } from '@/components/settings/SettingRow';

export default function AppearanceSettingsPage() {
  const { prefs, set, reset } = useTheme();

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary-600" /> Appearance
          </h2>
          <p className="text-sm text-surface-500 mt-1">
            Customize how NextNova looks for you. Changes save automatically.
          </p>
        </div>
        <button
          onClick={reset}
          className="text-xs text-surface-500 hover:text-surface-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-surface-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to defaults
        </button>
      </header>

      {/* ── Theme group ── */}
      <SettingsGroup
        title="Theme"
        description="Switch between light and dark, or follow your system preference."
        icon={Sun}
      >
        <SettingRow
          isFirst
          label="Color scheme"
          description="Choose how NextNova adapts to your environment."
          icon={Moon}
          control={
            <ThemePicker
              value={prefs.colorScheme}
              onChange={(v) => set('colorScheme', v)}
            />
          }
        />
      </SettingsGroup>

      {/* ── Accent color ── */}
      <SettingsGroup
        title="Accent color"
        description="The brand color used for buttons, links, charts, and highlights."
        icon={Sparkles}
      >
        <SettingRow
          isFirst
          label="Pick your accent"
          description="Each color tints buttons, focus rings, charts, and selected items across the app."
          icon={Palette}
          control={null}
          preview={
            <AccentPicker
              value={prefs.accent}
              onChange={(v) => set('accent', v)}
            />
          }
        />
      </SettingsGroup>

      {/* ── Layout ── */}
      <SettingsGroup
        title="Layout"
        description="Adjust how dense the interface feels."
        icon={PanelLeft}
      >
        <SettingRow
          isFirst
          label="Sidebar style"
          description="Floating panel (default) or flush against the edge."
          icon={PanelLeft}
          control={
            <SidebarPicker
              value={prefs.sidebarStyle}
              onChange={(v) => set('sidebarStyle', v)}
            />
          }
        />
        <SettingRow
          label="Table density"
          description="Compact mode shows more rows at once; comfortable adds breathing room."
          icon={Rows3}
          control={
            <DensityPicker
              value={prefs.density}
              onChange={(v) => set('density', v)}
            />
          }
        />
      </SettingsGroup>

      {/* ── Motion ── */}
      <SettingsGroup
        title="Motion"
        description="Animations make the interface feel smooth. Reduce them for performance or accessibility."
        icon={Zap}
      >
        <SettingRow
          isFirst
          label="Animations"
          description="Disable transitions, fades, and hover lifts."
          icon={Zap}
          control={
            <Switch
              checked={prefs.animations === 'on'}
              onChange={(checked) => set('animations', checked ? 'on' : 'reduced')}
              ariaLabel="Toggle animations"
            />
          }
        />
      </SettingsGroup>

      {/* ── Footer ── */}
      <div className="text-xs text-surface-400 px-1 flex items-center gap-1.5">
        <Check className="w-3 h-3" />
        All preferences are saved locally on this device.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Pickers
// ─────────────────────────────────────────────────────────

function ThemePicker({ value, onChange }: { value: ColorScheme; onChange: (v: ColorScheme) => void }) {
  const opts: { value: ColorScheme; label: string; icon: any }[] = [
    { value: 'light',  label: 'Light',  icon: Sun },
    { value: 'dark',   label: 'Dark',   icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];
  return (
    <div className="inline-flex p-1 bg-surface-100 border border-surface-200 rounded-xl">
      {opts.map(o => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${active
                ? 'bg-white text-surface-900 shadow-soft'
                : 'text-surface-500 hover:text-surface-900'}`}
          >
            <o.icon className="w-3.5 h-3.5" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function AccentPicker({ value, onChange }: { value: Accent; onChange: (v: Accent) => void }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-md">
      {(Object.entries(ACCENT_PALETTES) as [Accent, typeof ACCENT_PALETTES.indigo][]).map(
        ([key, p]) => {
          const active = value === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-label={p.name}
              className={`group relative rounded-xl border-2 transition-all
                ${active
                  ? 'border-surface-900 shadow-card-hover'
                  : 'border-surface-200 hover:border-surface-300'}`}
            >
              <div
                className="aspect-square rounded-[0.625rem] m-0.5"
                style={{
                  background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                  boxShadow: active ? `0 0 16px ${p.preview}55` : undefined,
                }}
              />
              {active && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border-2 border-surface-900 rounded-full flex items-center justify-center shadow-soft">
                  <Check className="w-2.5 h-2.5 text-surface-900" strokeWidth={3} />
                </div>
              )}
              <div className="text-2xs font-semibold text-surface-700 py-1.5 capitalize">
                {p.name}
              </div>
            </button>
          );
        }
      )}
    </div>
  );
}

function SidebarPicker({ value, onChange }: { value: SidebarStyle; onChange: (v: SidebarStyle) => void }) {
  return (
    <div className="inline-flex p-1 bg-surface-100 border border-surface-200 rounded-xl">
      {(['floating', 'flush'] as SidebarStyle[]).map(o => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all
              ${active ? 'bg-white text-surface-900 shadow-soft' : 'text-surface-500 hover:text-surface-900'}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

function DensityPicker({ value, onChange }: { value: Density; onChange: (v: Density) => void }) {
  const opts: { value: Density; label: string; icon: any }[] = [
    { value: 'compact',     label: 'Compact',     icon: Rows3 },
    { value: 'comfortable', label: 'Comfortable', icon: Rows2 },
  ];
  return (
    <div className="inline-flex p-1 bg-surface-100 border border-surface-200 rounded-xl">
      {opts.map(o => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${active ? 'bg-white text-surface-900 shadow-soft' : 'text-surface-500 hover:text-surface-900'}`}
          >
            <o.icon className="w-3.5 h-3.5" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
