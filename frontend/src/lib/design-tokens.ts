/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  NEXTNOVA DESIGN TOKENS                                        ║
 * ║                                                                ║
 * ║  Single source of truth for the visual language.               ║
 * ║  All primitive components reference these tokens.              ║
 * ║                                                                ║
 * ║  When you change a token here, every component using it        ║
 * ║  updates automatically.                                        ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

// ─── Spacing scale (Tailwind-compatible) ────────────────────
export const spacing = {
  '0':  '0',
  '1':  '0.25rem',  // 4px
  '2':  '0.5rem',   // 8px
  '3':  '0.75rem',  // 12px
  '4':  '1rem',     // 16px
  '5':  '1.25rem',  // 20px
  '6':  '1.5rem',   // 24px
  '8':  '2rem',     // 32px
  '10': '2.5rem',   // 40px
  '12': '3rem',     // 48px
} as const;

// ─── Border radius scale ────────────────────────────────────
export const radius = {
  none:    '0',
  sm:      '0.25rem',  // 4px  — chips, small badges
  md:      '0.375rem', // 6px  — small buttons
  lg:      '0.5rem',   // 8px  — inputs
  xl:      '0.75rem',  // 12px — buttons, cards
  '2xl':   '1rem',     // 16px — large cards
  '3xl':   '1.25rem',  // 20px — hero cards
  full:    '9999px',   // pills, avatars
} as const;

// ─── Typography scale ───────────────────────────────────────
export const fontSize = {
  '2xs': '0.6875rem',  // 11px — labels, kbd
  xs:    '0.75rem',    // 12px — captions
  sm:    '0.875rem',   // 14px — body
  base:  '1rem',       // 16px — body
  lg:    '1.125rem',   // 18px — emphasis
  xl:    '1.25rem',    // 20px — small headings
  '2xl': '1.5rem',     // 24px — page titles
  '3xl': '1.875rem',   // 30px — section heros
  '4xl': '2.25rem',    // 36px — hero
  '5xl': '3rem',       // 48px — landing hero
} as const;

export const fontWeight = {
  normal:    400,
  medium:    500,
  semibold:  600,
  bold:      700,
  extrabold: 800,
} as const;

// ─── Shadows ────────────────────────────────────────────────
export const shadow = {
  none:       'none',
  soft:       '0 2px 8px 0 rgb(0 0 0 / 0.04)',
  card:       '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
  cardHover:  '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 2px 4px 0 rgb(0 0 0 / 0.04)',
  modal:      '0 20px 50px -10px rgb(0 0 0 / 0.25), 0 8px 20px -8px rgb(0 0 0 / 0.10)',
  glow:       '0 0 32px rgba(99,102,241,0.18)',
  glowLg:     '0 0 64px rgba(99,102,241,0.25)',
} as const;

// ─── Motion ─────────────────────────────────────────────────
export const motion = {
  duration: {
    fast:   '150ms',
    base:   '200ms',
    slow:   '300ms',
    slower: '400ms',
  },
  easing: {
    standard: 'cubic-bezier(0.22, 1, 0.36, 1)',  // ease-out-quart (Linear / Vercel)
    spring:   'cubic-bezier(0.34, 1.56, 0.64, 1)', // springy
    in:       'cubic-bezier(0.4, 0, 1, 1)',
    out:      'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;

// ─── z-index scale (avoid conflicts) ────────────────────────
export const z = {
  base:        0,
  dropdown:    20,
  sticky:      30,
  banner:      40,
  modalOverlay: 50,
  modal:       60,
  popover:     70,
  toast:       100,
  tooltip:     110,
} as const;

// ─── Component-level variants ───────────────────────────────
/**
 * Standard size variants used by Button, Input, Select, Badge, etc.
 * Keeps everything proportional.
 */
export const sizeVariants = {
  xs: { padX: 'px-2',   padY: 'py-1',    text: 'text-xs',  icon: 'w-3 h-3',   minH: 'min-h-[24px]' },
  sm: { padX: 'px-2.5', padY: 'py-1.5',  text: 'text-xs',  icon: 'w-3.5 h-3.5', minH: 'min-h-[32px]' },
  md: { padX: 'px-3.5', padY: 'py-2',    text: 'text-sm',  icon: 'w-4 h-4',   minH: 'min-h-[36px]' },
  lg: { padX: 'px-4',   padY: 'py-2.5',  text: 'text-sm',  icon: 'w-4 h-4',   minH: 'min-h-[40px]' },
  xl: { padX: 'px-5',   padY: 'py-3',    text: 'text-base', icon: 'w-5 h-5',  minH: 'min-h-[44px]' },
} as const;

export type Size = keyof typeof sizeVariants;

/**
 * Status colors used across Badge, Alert, Toast, status indicators.
 */
export const statusColors = {
  success: { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', accent: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200',   accent: 'bg-amber-500'   },
  danger:  { bg: 'bg-rose-50',    text: 'text-rose-700',    ring: 'ring-rose-200',    accent: 'bg-rose-500'    },
  info:    { bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-200',    accent: 'bg-blue-500'    },
  neutral: { bg: 'bg-surface-100', text: 'text-surface-700', ring: 'ring-surface-200', accent: 'bg-surface-500' },
  brand:   { bg: 'bg-primary-50', text: 'text-primary-700', ring: 'ring-primary-200', accent: 'bg-primary-500' },
} as const;

export type StatusVariant = keyof typeof statusColors;

// ─── Theme variables that the Theme Studio can manipulate ───
export interface CustomTheme {
  name: string;
  /** Primary action color (single hex; lighter/darker derived) */
  primaryHex:  string;
  /** Secondary / accent color */
  accentHex:   string;
  /** Surface background scheme */
  scheme:      'light' | 'dark' | 'system';
  /** Border radius scale ('sharp', 'round', 'pillow') */
  cornerStyle: 'sharp' | 'default' | 'round' | 'pillow';
  /** Density */
  density:     'compact' | 'comfortable' | 'cozy';
  /** Animation amount */
  motionLevel: 'minimal' | 'standard' | 'expressive';
  /** When this preset was created */
  createdAt?:  string;
}

export const PRESET_THEMES: CustomTheme[] = [
  {
    name: 'Corporate Dark',
    primaryHex: '#6366f1', accentHex: '#8b5cf6',
    scheme: 'dark', cornerStyle: 'default', density: 'comfortable', motionLevel: 'standard',
  },
  {
    name: 'Executive Light',
    primaryHex: '#4f46e5', accentHex: '#7c3aed',
    scheme: 'light', cornerStyle: 'default', density: 'comfortable', motionLevel: 'standard',
  },
  {
    name: 'Aurora AI',
    primaryHex: '#7c3aed', accentHex: '#ec4899',
    scheme: 'dark', cornerStyle: 'round', density: 'comfortable', motionLevel: 'expressive',
  },
  {
    name: 'Ocean Blue',
    primaryHex: '#2563eb', accentHex: '#06b6d4',
    scheme: 'light', cornerStyle: 'default', density: 'comfortable', motionLevel: 'standard',
  },
  {
    name: 'Emerald Business',
    primaryHex: '#059669', accentHex: '#14b8a6',
    scheme: 'light', cornerStyle: 'default', density: 'comfortable', motionLevel: 'standard',
  },
  {
    name: 'Glass Premium',
    primaryHex: '#0ea5e9', accentHex: '#a855f7',
    scheme: 'light', cornerStyle: 'round', density: 'comfortable', motionLevel: 'expressive',
  },
];
