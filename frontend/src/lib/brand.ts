/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  NEXTNOVA — Brand config (single source of truth)              ║
 * ║                                                                ║
 * ║  Premium AI SaaS aesthetic.                                    ║
 * ║  Dark-mode-first. Electric blue → deep purple gradient.        ║
 * ║  Quality bar: Linear, Stripe, Vercel, OpenAI.                  ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

export const BRAND = {
  name: 'NextNova',
  tagline: '',
  hero: {
    headline: 'The next era of\nworkforce\nintelligence.',
    body:
      'NextNova is the AI-native HR platform powering modern teams. ' +
      'Run recruitment, payroll, compliance, and shifts on one ' +
      'unified system — built for scale.',
  },
  metaTitle: 'NextNova — AI-Native Workforce Platform',
  metaDescription:
    'NextNova is the next-generation HR & workforce platform. ' +
    'AI insights, automation, compliance, and modern UX in one SaaS.',

  /** Dark mode is the default brand aesthetic */
  defaultTheme: 'dark' as 'dark' | 'light',

  /** Switch to legacy heart logo (false = use NextNova nova/diamond mark) */
  useHealthcareLogo: false,

  logo: {
    /** Solid colors used for the nova SVG gradient */
    stops: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'],
    /** Tailwind classes for hero text gradient */
    textGradient: 'from-blue-400 via-indigo-400 to-violet-400',
    /** Hex used in CSS shadows / glows */
    glowColor: '#6366f1',
  },
} as const;
