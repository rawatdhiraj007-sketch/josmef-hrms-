'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────
export type ColorScheme  = 'light' | 'dark' | 'system';
export type Accent       = 'indigo' | 'blue' | 'violet' | 'rose' | 'emerald' | 'amber';
export type SidebarStyle = 'floating' | 'flush';
export type Density      = 'comfortable' | 'compact';
export type Animations   = 'on' | 'reduced';

export interface ThemePrefs {
  colorScheme:  ColorScheme;
  accent:       Accent;
  sidebarStyle: SidebarStyle;
  density:      Density;
  animations:   Animations;
}

const DEFAULTS: ThemePrefs = {
  colorScheme:  'light',     // app pages default to light; auth/marketing stay dark
  accent:       'indigo',
  sidebarStyle: 'floating',
  density:      'comfortable',
  animations:   'on',
};

const STORAGE_KEY = 'nn:theme';

// ─── Context ──────────────────────────────────────────────
interface ThemeContextType {
  prefs: ThemePrefs;
  set:   <K extends keyof ThemePrefs>(key: K, value: ThemePrefs[K]) => void;
  reset: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<ThemePrefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  // ── Load from localStorage on mount (client only) ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPrefs({ ...DEFAULTS, ...parsed });
      }
    } catch { /* noop */ }
    setHydrated(true);
  }, []);

  // ── Apply prefs to <html> as data attributes ──
  useEffect(() => {
    if (!hydrated) return;
    const html = document.documentElement;
    // Effective color scheme (resolve "system")
    const effective =
      prefs.colorScheme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : prefs.colorScheme;

    html.setAttribute('data-theme',         effective);
    html.setAttribute('data-accent',        prefs.accent);
    html.setAttribute('data-sidebar-style', prefs.sidebarStyle);
    html.setAttribute('data-density',       prefs.density);
    html.setAttribute('data-animations',    prefs.animations);

    // Also toggle the "dark" Tailwind class (we have darkMode: 'class')
    if (effective === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
  }, [prefs, hydrated]);

  // ── Watch system color scheme when user picked "system" ──
  useEffect(() => {
    if (prefs.colorScheme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const isDark = mq.matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [prefs.colorScheme]);

  const set = useCallback(<K extends keyof ThemePrefs>(key: K, value: ThemePrefs[K]) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setPrefs(DEFAULTS);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS)); } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ prefs, set, reset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback — components should still render even if not wrapped
    return { prefs: DEFAULTS, set: () => {}, reset: () => {} };
  }
  return ctx;
}

// ─── Accent palette data (used by settings UI for swatches) ──
export const ACCENT_PALETTES: Record<Accent, { name: string; from: string; to: string; preview: string }> = {
  indigo:  { name: 'Indigo',  from: '#6366f1', to: '#a855f7', preview: '#4f46e5' },
  blue:    { name: 'Blue',    from: '#3b82f6', to: '#06b6d4', preview: '#2563eb' },
  violet:  { name: 'Violet',  from: '#8b5cf6', to: '#ec4899', preview: '#7c3aed' },
  rose:    { name: 'Rose',    from: '#f43f5e', to: '#ec4899', preview: '#e11d48' },
  emerald: { name: 'Emerald', from: '#10b981', to: '#14b8a6', preview: '#059669' },
  amber:   { name: 'Amber',   from: '#f59e0b', to: '#f97316', preview: '#d97706' },
};
