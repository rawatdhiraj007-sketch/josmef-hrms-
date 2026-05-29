/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  BRAND CONFIG — single source of truth for product name & look ║
 * ║                                                                ║
 * ║  To rename the entire product:                                 ║
 * ║    1. Change `name` below                                      ║
 * ║    2. Save the file                                            ║
 * ║    3. That's it. Sidebar, login, layout title, apply page,     ║
 * ║       portal, favicon alt-text — everything updates.           ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

export const BRAND = {
  /** Product name. */
  name: 'JOSMEF',

  /** Tagline shown under the wordmark in some contexts. Leave '' to hide. */
  tagline: 'God cures, we care',

  /** Short blurb for the login left-panel hero. */
  hero: {
    headline: 'Caring for those\nwho care for\nothers.',
    body:
      'Recruitment, attendance, payroll, compliance, and the full ' +
      'employee lifecycle — built for healthcare teams.',
  },

  /** Meta description for SEO + browser tab. */
  metaTitle: 'JOSMEF HRMS — God Cures, We Care',
  metaDescription:
    'Enterprise HR Management System for healthcare teams. ' +
    'PRC license tracking, shift scheduling, payroll, compliance.',

  /** Use the healthcare heart logo (true) or generic gradient square (false). */
  useHealthcareLogo: true,

  /** Gradient colors for the square-with-letter logo (only used if useHealthcareLogo: false). */
  logo: {
    fromColor: 'from-primary-500',
    viaColor: 'via-pink-500',
    toColor: 'to-violet-500',
    stops: ['#f43f5e', '#ec4899', '#a855f7'],
    get letter() {
      return BRAND.name.charAt(0).toUpperCase();
    },
  },
} as const;
