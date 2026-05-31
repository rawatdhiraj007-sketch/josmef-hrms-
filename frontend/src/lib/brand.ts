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
  tagline: 'The Operating System for Modern Workforce Management',
  hero: {
    headline: 'The operating system\nfor modern workforce\nmanagement.',
    body:
      'Unify HR, payroll, compliance, training, attendance, and AI ' +
      'automation in one platform. Built for HR teams, healthcare ' +
      'companies, distributors, and growing enterprises.',
  },
  metaTitle: 'NextNova — The OS for Modern Workforce Management',
  metaDescription:
    'Unify HR, payroll, compliance, training, attendance, and AI in one ' +
    'enterprise platform. Built for healthcare, distribution, and SMEs.',

  /** Dark mode is the default brand aesthetic */
  defaultTheme: 'dark' as 'dark' | 'light',

  /** Switch to legacy heart logo (false = use NextNova nova/diamond mark) */
  useHealthcareLogo: false,

  logo: {
    /** Solid colors used for the nova SVG gradient —
     *  mirrors the official PNG: cyan → electric blue → violet */
    stops: ['#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6'],
    /** Tailwind classes for hero text gradient */
    textGradient: 'from-primary-500 via-primary-600 to-accent-500',
    /** Hex used in CSS shadows / glows (electric blue) */
    glowColor: '#3B82F6',
  },
} as const;
