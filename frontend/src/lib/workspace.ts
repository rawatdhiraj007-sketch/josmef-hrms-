/**
 * NextNova Workspace — frontend-only company branding config.
 *
 * Stored in localStorage. Applied via applyWorkspaceBranding() which
 * delegates color application to the existing color-utils layer
 * (so it integrates with Theme Studio's CSS-var pipeline).
 *
 * NOT multi-tenant. NOT plan-enforced. Anyone can edit. Backend
 * companies/tenants/subscriptions are NOT implemented and would
 * require server work.
 */

import { applyColorPalette, resetColorPalette } from './color-utils';

export type SidebarStyleChoice = 'floating' | 'flush';

export interface WorkspaceConfig {
  /** Display name shown in topbar + browser title */
  companyName: string;
  /** Optional logo URL (data: URI or https). Empty string = use default. */
  logoUrl: string;
  /** Hex color — drives the primary-* palette */
  primaryHex: string;
  /** Hex color — drives the accent-* palette */
  accentHex: string;
  /** Sidebar layout choice */
  sidebarStyle: SidebarStyleChoice;
  /** When this config was last saved */
  updatedAt?: string;
}

export const DEFAULT_WORKSPACE: WorkspaceConfig = {
  companyName: 'NextNova',
  logoUrl: '',
  primaryHex: '#6366f1',  // electric indigo (matches default Tailwind)
  accentHex:  '#8b5cf6',  // deep violet
  sidebarStyle: 'floating',
};

const LS_KEY = 'nn:workspace';

/** Read the saved workspace config or return defaults. */
export function loadWorkspace(): WorkspaceConfig {
  if (typeof window === 'undefined') return DEFAULT_WORKSPACE;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_WORKSPACE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_WORKSPACE, ...parsed };
  } catch { return DEFAULT_WORKSPACE; }
}

/** Persist + apply the branding to the live document. */
export function saveWorkspace(cfg: WorkspaceConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const next = { ...cfg, updatedAt: new Date().toISOString() };
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    applyWorkspaceBranding(next);
  } catch { /* localStorage quota or disabled */ }
}

/**
 * Apply just the visual branding (colors, sidebar style) to the DOM.
 * Colors go through the existing CSS-var pipeline so Tailwind classes
 * like bg-primary-600 / from-accent-500 re-paint live.
 */
export function applyWorkspaceBranding(cfg: WorkspaceConfig): void {
  if (typeof document === 'undefined') return;
  applyColorPalette(cfg.primaryHex, cfg.accentHex);
  document.documentElement.setAttribute('data-sidebar-style', cfg.sidebarStyle);
}

/** Revert to defaults — strips branding + clears localStorage. */
export function resetWorkspace(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(LS_KEY); } catch { /* */ }
  resetColorPalette();
  document.documentElement.setAttribute('data-sidebar-style', DEFAULT_WORKSPACE.sidebarStyle);
}

// ─── Plan metadata (display-only, NOT enforced) ───
export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface PlanDef {
  id: PlanTier;
  name: string;
  employeeLimit: number;  // -1 = unlimited
  aiCreditsPerMonth: number; // -1 = unlimited
  priceUsd: number; // 0 = free
  highlights: string[];
}

export const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    employeeLimit: 10,
    aiCreditsPerMonth: 100,
    priceUsd: 0,
    highlights: ['Up to 10 employees', '100 AI requests / month', 'Community support'],
  },
  {
    id: 'starter',
    name: 'Starter',
    employeeLimit: 50,
    aiCreditsPerMonth: 2000,
    priceUsd: 29,
    highlights: ['Up to 50 employees', '2,000 AI requests / month', 'Email support'],
  },
  {
    id: 'professional',
    name: 'Professional',
    employeeLimit: 250,
    aiCreditsPerMonth: 10000,
    priceUsd: 99,
    highlights: ['Up to 250 employees', '10,000 AI requests / month', 'Priority support', 'Custom branding'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    employeeLimit: -1,
    aiCreditsPerMonth: -1,
    priceUsd: 0, // "Contact us"
    highlights: ['Unlimited employees', 'Unlimited AI', 'Dedicated success manager', 'SSO + audit logs'],
  },
];

export function getPlan(id: PlanTier): PlanDef {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

/** Read the current plan id from localStorage. Default: free. */
export function loadPlan(): PlanTier {
  if (typeof window === 'undefined') return 'free';
  try {
    const raw = localStorage.getItem('nn:plan');
    if (raw === 'starter' || raw === 'professional' || raw === 'enterprise' || raw === 'free') return raw;
  } catch { /* */ }
  return 'free';
}

/** Save the current plan id (display-only). */
export function savePlan(id: PlanTier): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem('nn:plan', id); } catch { /* */ }
}
