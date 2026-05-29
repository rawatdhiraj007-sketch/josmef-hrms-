/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  BRAND CONFIG — single source of truth for product name & look ║
 * ║                                                                ║
 * ║  To rename the entire product:                                 ║
 * ║    1. Change `name` below                                      ║
 * ║    2. Save the file                                            ║
 * ║    3. That's it. Sidebar, login, layout title, apply page,     ║
 * ║       portal, favicon alt-text — everything updates.           ║
 * ║                                                                ║
 * ║  The logo automatically renders the first letter of `name`     ║
 * ║  inside a gradient square.                                     ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

export const BRAND = {
  /** Product name. Single word recommended. Used everywhere. */
  name: 'Workforce',

  /** Tagline shown under the wordmark in some contexts. Leave '' to hide. */
  tagline: 'Modern HR for healthcare teams',

  /** Short blurb for the login left-panel hero. */
  hero: {
    headline: 'Run your healthcare\nworkforce with\nconfidence.',
    body:
      'Credentialing, scheduling, payroll, compliance, and the full ' +
      'employee lifecycle — built for healthcare teams.',
  },

  /** Meta description for SEO + browser tab. */
  metaTitle: 'Workforce — HR for healthcare teams',
  metaDescription:
    'Modern HR platform for healthcare. PRC license tracking, ' +
    'shift scheduling, payroll, compliance, and more.',

  /** Gradient colors for the square-with-letter logo. */
  logo: {
    /** Tailwind gradient classes for the logo square. */
    fromColor: 'from-primary-500',
    viaColor: 'via-pink-500',
    toColor: 'to-violet-500',
    /** SVG gradient stops (used in the inline-SVG fallback). */
    stops: ['#f43f5e', '#ec4899', '#a855f7'],
    /** First letter shown inside the square. Auto-derived from name. */
    get letter() {
      return BRAND.name.charAt(0).toUpperCase();
    },
  },
} as const;
