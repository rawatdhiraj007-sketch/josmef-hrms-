/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  BRAND CONFIG — single source of truth                         ║
 * ║                                                                ║
 * ║  Generic SaaS branding for now. When ready to launch for a     ║
 * ║  specific client, change `name` + `tagline` here and set       ║
 * ║  useHealthcareLogo:true if you want the heart logo back.       ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

export const BRAND = {
  name: 'Workforce',
  tagline: '',
  hero: {
    headline: 'Modern HR\nbuilt for\nteams.',
    body:
      'Recruitment, attendance, payroll, leave, compliance, and the full ' +
      'employee lifecycle on one platform.',
  },
  metaTitle: 'Workforce — Modern HR',
  metaDescription: 'Modern HR platform for growing companies.',

  /** Use the healthcare heart logo (true) or generic gradient square (false). */
  useHealthcareLogo: false,

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
