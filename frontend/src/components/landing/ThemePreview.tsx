'use client';

import { Sparkles, Sun, Moon } from 'lucide-react';

interface ThemeShowcase {
  id: string;
  name: string;
  primary: string;       // hex
  accent: string;        // hex
  /** dark or light surface preview */
  scheme: 'dark' | 'light';
}

/**
 * Curated subset of the in-app Theme Studio presets, displayed as
 * static visual cards. NOT functional theme switching — purely a
 * "what your workspace can look like" showcase for marketing.
 *
 * Mirrors the canonical PRESET_THEMES from lib/design-tokens.ts but
 * we keep these inline so this component stays self-contained (no
 * cross-import into design-tokens which could pull in dashboard chunks).
 */
const SHOWCASE: ThemeShowcase[] = [
  { id: 'corp-dark',  name: 'Corporate Dark',   primary: '#6366f1', accent: '#8b5cf6', scheme: 'dark'  },
  { id: 'exec-light', name: 'Executive Light',  primary: '#4f46e5', accent: '#7c3aed', scheme: 'light' },
  { id: 'aurora',     name: 'Aurora AI',        primary: '#7c3aed', accent: '#ec4899', scheme: 'dark'  },
  { id: 'ocean',      name: 'Ocean Blue',       primary: '#2563eb', accent: '#06b6d4', scheme: 'light' },
  { id: 'emerald',    name: 'Emerald Business', primary: '#059669', accent: '#14b8a6', scheme: 'light' },
];

export default function ThemePreview() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {SHOWCASE.map((t) => <ThemeCard key={t.id} theme={t} />)}
    </div>
  );
}

function ThemeCard({ theme }: { theme: ThemeShowcase }) {
  const isDark = theme.scheme === 'dark';
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-primary-300 hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
      {/* Mini app preview surface */}
      <div
        className={`relative h-32 px-3 py-3 ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
        style={{
          backgroundImage: `radial-gradient(at top right, ${theme.accent}22, transparent 60%), radial-gradient(at bottom left, ${theme.primary}22, transparent 60%)`,
        }}
      >
        {/* Mini topbar */}
        <div className={`flex items-center justify-between mb-3 ${isDark ? 'text-white/70' : 'text-slate-500'}`}>
          <div className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
            />
            <span className="text-2xs font-semibold">NextNova</span>
          </div>
          {isDark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
        </div>

        {/* Mini KPI tile + button */}
        <div className={`rounded-md px-2 py-2 mb-2 ${isDark ? 'bg-white/[0.06] border border-white/[0.08]' : 'bg-slate-50 border border-slate-200'}`}>
          <div className={`text-2xs ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Active</div>
          <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'} tabular-nums`}>242</div>
        </div>

        {/* Mini CTA in theme color */}
        <button
          className="w-full text-2xs font-semibold py-1.5 rounded-md text-white shadow-sm"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
          tabIndex={-1}
        >
          Open dashboard
        </button>
      </div>

      {/* Footer with theme name + color swatches */}
      <div className="px-3 py-2.5 border-t border-slate-100 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-900 truncate">{theme.name}</div>
          <div className="text-2xs text-slate-500 capitalize">{theme.scheme} mode</div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-sm" style={{ background: theme.primary }} title="Primary" />
          <span className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-sm -ml-1.5" style={{ background: theme.accent }} title="Accent" />
        </div>
      </div>
    </div>
  );
}

// Suppress unused warning
void Sparkles;
