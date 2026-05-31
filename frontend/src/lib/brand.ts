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
    /** Solid colors used for the nova SVG gradient — slate → teal → amber */
    stops: ['#0F172A', '#0F766E', '#14B8A6', '#F59E0B'],
    /** Tailwind classes for hero text gradient */
    textGradient: 'from-primary-300 via-primary-400 to-accent-400',
    /** Hex used in CSS shadows / glows (teal) */
    glowColor: '#14B8A6',
  },
} as const;
