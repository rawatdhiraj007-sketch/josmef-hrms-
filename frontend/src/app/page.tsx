'use client';

import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import Logo from '@/components/Logo';
import {
  Sparkles, Users, ShieldCheck, BarChart3, Award, ArrowRight, Check,
  Zap, Plane, CalendarCheck, GraduationCap, Stethoscope, Truck, Building2,
  Cpu, Smartphone, LockKeyhole, Layers,
} from 'lucide-react';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-white light-mode-page text-slate-900">
      {/* ════════════════════════════════════════════════════════
         HERO — Slate-900 surface, teal accents, enterprise feel
         ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white">
        {/* Subtle radial glow + grid background */}
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] rounded-full bg-primary-500/[0.06] blur-[120px]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.08]" />
        </div>

        {/* Navbar */}
        <nav className="relative z-20 border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Logo size={30} variant="light" textClassName="text-base text-white font-semibold tracking-tight" />
            <div className="hidden md:flex items-center gap-7 text-sm font-medium text-white/65">
              <a href="#platform"     className="hover:text-white transition-colors">Platform</a>
              <a href="#segments"     className="hover:text-white transition-colors">For your team</a>
              <a href="#pricing"      className="hover:text-white transition-colors">Pricing</a>
              <a href="#contact"      className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="text-sm text-white/70 hover:text-white px-3 py-2 transition-colors">
                Sign in
              </Link>
              <a
                href="#contact"
                className="bg-white text-slate-900 hover:bg-white/95 text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                Book a demo <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </nav>

        {/* Hero body */}
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-full px-3 py-1 text-2xs font-medium text-white/75 mb-7 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
              Now in private beta · AI-assisted workforce operations
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05]">
              The operating system for
              <br className="hidden sm:block" />
              <span className="nova-gradient-text"> modern workforce management.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg lg:text-xl text-white/65 mt-6 max-w-2xl leading-relaxed">
              Unify HR, payroll, compliance, training, attendance, and AI
              automation in one platform. Built for HR teams, healthcare
              companies, distributors, and growing enterprises.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              <a
                href="#contact"
                className="bg-primary-500 hover:bg-primary-400 text-white text-sm font-semibold px-5 py-3 rounded-lg transition-all inline-flex items-center gap-2 shadow-[0_6px_24px_-8px_rgba(20,184,166,0.5)]"
              >
                Start free trial <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/auth/login"
                className="bg-white/[0.05] backdrop-blur border border-white/[0.10] hover:bg-white/[0.08] text-white text-sm font-semibold px-5 py-3 rounded-lg transition-all inline-flex items-center gap-2"
              >
                Try interactive demo
              </Link>
            </div>

            {/* Trust micro-row */}
            <div className="flex items-center gap-5 mt-7 text-xs text-white/45 flex-wrap">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary-400" /> 14-day free trial</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary-400" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary-400" /> Set up in under a day</span>
            </div>
          </div>

          {/* Enterprise KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-16 lg:mt-20 max-w-5xl">
            <KpiCard icon={Layers}      label="Workforce modules" value="24+"          sub="Unified in one platform" />
            <KpiCard icon={Sparkles}    label="AI assisted"        value="Operations"   sub="Insights, alerts, reports" />
            <KpiCard icon={Smartphone}  label="Mobile ready"       value="iOS · Android" sub="Employee portal + kiosk" />
            <KpiCard icon={LockKeyhole} label="Enterprise secure"  value="SOC-grade"    sub="Audit logs · roles" />
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-white/5 pointer-events-none" />
      </section>

      {/* ════════════════════════════════════════════════════════
         TRUST BAND — Segments served
         ════════════════════════════════════════════════════════ */}
      <section id="segments" className="py-16 lg:py-20 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-2xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-8">
            Trusted by teams across
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <SegmentCard icon={Stethoscope} title="Healthcare"   detail="Clinics & hospitals" />
            <SegmentCard icon={Truck}       title="Distribution" detail="Logistics & supply" />
            <SegmentCard icon={Building2}   title="SMEs"         detail="50–500 employees" />
            <SegmentCard icon={Cpu}         title="Enterprises"  detail="500+ workforce" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         PLATFORM — 6 pillars
         ════════════════════════════════════════════════════════ */}
      <section id="platform" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-14 lg:mb-16">
            <div className="text-2xs uppercase tracking-[0.18em] font-semibold text-primary-700 mb-3">
              Platform
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              One platform, every workforce workflow.
            </h2>
            <p className="text-lg text-slate-600 mt-5 leading-relaxed">
              From the moment someone applies to the day they retire — every
              touchpoint covered, every record audited, every report ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <PillarCard
              icon={Users}
              title="People & records"
              body="40+ field employee records, 201 file, license tracking with auto-expiry alerts, former employee archive."
            />
            <PillarCard
              icon={CalendarCheck}
              title="Shifts & attendance"
              body="24/7 rotating shifts with skill-based assignment, fatigue rules, swap requests, kiosk clock-in mode."
            />
            <PillarCard
              icon={Award}
              title="Payroll & bonuses"
              body="Run payroll with PH statutory deductions, 13th-month auto-compute, bonus runs, gov reports (SSS, PhilHealth, BIR)."
            />
            <PillarCard
              icon={Plane}
              title="Leave management"
              body="8 PH leave types pre-configured, multi-level approval workflow, balance tracking, calendar view."
            />
            <PillarCard
              icon={ShieldCheck}
              title="Compliance engine"
              body="Real-time alerts for expired licenses, overdue NTEs, expiring contracts, stale disciplinary cases."
            />
            <PillarCard
              icon={Sparkles}
              title="AI co-pilot"
              body="Smart insights, executive briefings, business health score, natural-language search, alert prioritization."
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         24+ MODULES — clean grid
         ════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-24 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="text-2xs uppercase tracking-[0.18em] font-semibold text-primary-700 mb-3">
              Full platform
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              24+ integrated modules
            </h2>
            <p className="text-base text-slate-600 mt-3">
              No more juggling five different tools for one team.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {MODULES.map(([title, sub]) => (
              <div key={title} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-primary-300 hover:shadow-card-hover transition-all">
                <div className="font-semibold text-sm text-slate-900">{title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         STATS / SOCIAL PROOF
         ════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <BigStat number="60h"    label="HR admin hours saved per month" />
            <BigStat number="< 1d"   label="Average setup time" />
            <BigStat number="99.9%"  label="Platform uptime target" />
            <BigStat number="< 200ms" label="API response time" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         PRICING
         ════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-20 lg:py-28 bg-slate-50/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 lg:mb-16">
            <div className="text-2xs uppercase tracking-[0.18em] font-semibold text-primary-700 mb-3">
              Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-base text-slate-600 mt-4">
              Pay per active employee. No setup fees. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <PricingTier
              name="Starter"
              price="₱200"
              priceUnit="/employee/month"
              forWho="Small teams · 10–50 staff"
              features={[
                'Core HR + 201 File',
                'Attendance + Payroll',
                'Leave Management',
                'License Tracking',
                'Gov Reports (PH)',
                'Email support',
              ]}
            />
            <PricingTier
              name="Pro"
              price="₱500"
              priceUnit="/employee/month"
              forWho="Growing companies · 50–500 staff"
              highlighted
              features={[
                'Everything in Starter',
                'Shift Scheduling',
                'Compliance Engine',
                'Slack / Teams integrations',
                'Workflow Automations',
                'Bonus + 13th-Month Auto',
                'Analytics + Custom Reports',
                'AI Co-pilot',
              ]}
            />
            <PricingTier
              name="Enterprise"
              price="Custom"
              priceUnit=""
              forWho="Large orgs · 500+ staff"
              features={[
                'Everything in Pro',
                'SSO (SAML/OAuth)',
                '2FA enforcement',
                'Custom branding',
                'Dedicated success manager',
                'SLA + uptime guarantee',
                'API access',
              ]}
            />
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Annual billing saves 15% · Volume discounts at 200+ employees
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         CTA — clean, no garish gradients
         ════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-20 lg:py-28 bg-[#0F172A] text-white relative overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          <div className="absolute top-0 -left-32 w-[480px] h-[480px] bg-primary-500/[0.08] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-32 w-[480px] h-[480px] bg-accent-500/[0.06] rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Ready to modernize your workforce?
          </h2>
          <p className="text-white/70 text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
            Book a 20-minute demo. We&apos;ll show you the platform, answer
            your questions, and set up a free 14-day trial — no commitment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <a
              href="mailto:support@nextnova.ai?subject=Demo%20request"
              className="bg-primary-500 hover:bg-primary-400 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all inline-flex items-center gap-2 shadow-[0_6px_24px_-8px_rgba(20,184,166,0.5)]"
            >
              Email us <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/auth/login"
              className="border border-white/20 hover:bg-white/5 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors inline-flex items-center gap-2"
            >
              Try the demo
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto text-left">
            <ContactCell label="Email"  value="support@nextnova.ai" />
            <ContactCell label="Hours"  value="Mon–Fri · 9am–6pm PHT" />
            <ContactCell label="Office" value="Manila, Philippines" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         FOOTER
         ════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size={28} variant="light" textClassName="text-sm text-white font-semibold" taglineClassName="hidden" />
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────
const MODULES: [string, string][] = [
  ['Applicants',       'ATS pipeline'],
  ['Trainees',         'Onboarding + evaluation'],
  ['Employees',        '40+ fields, 201 file'],
  ['Licenses',         '30+ credentials'],
  ['Shifts',           '24/7 scheduling'],
  ['Attendance',       'Daily + kiosk'],
  ['Payroll',          'PH statutory deductions'],
  ['13th-Month',       'Auto-compute PD 851'],
  ['Bonus Runs',       'Performance, commission'],
  ['Leave',            '8 PH leave types'],
  ['Loans',            'Salary, cash advance'],
  ['Disciplinary',     'NTE, suspension'],
  ['Incident Reports', 'Safety logging'],
  ['Work Certificates','COE generation'],
  ['Exit Clearance',   'Multi-dept + e-sign'],
  ['Training',         'Graphy integration'],
  ['Gov Reports',      'SSS / PhilHealth / BIR'],
  ['Compliance',       'Auto-alert engine'],
  ['Audit Log',        'Every change tracked'],
  ['Analytics',        'Live dashboards'],
  ['Employee Portal',  'Mobile self-service'],
  ['Integrations',     'Slack / Teams / Discord'],
  ['Automations',      'Workflow rules'],
  ['AI Co-pilot',      'Smart insights & briefs'],
];

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub }: {
  icon: any; label: string; value: string; sub: string;
}) {
  return (
    <div className="bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-xl p-4 hover:border-primary-400/40 hover:bg-white/[0.06] transition-all">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary-500/15 border border-primary-400/20 flex items-center justify-center text-primary-300">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-2xs uppercase tracking-wider text-white/50 font-semibold">{label}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">{value}</div>
      <div className="text-xs text-white/55 mt-0.5">{sub}</div>
    </div>
  );
}

function SegmentCard({ icon: Icon, title, detail }: {
  icon: any; title: string; detail: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 text-center hover:border-primary-300 hover:shadow-card transition-all">
      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 mx-auto flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="text-xs text-slate-500 mt-0.5">{detail}</div>
    </div>
  );
}

function PillarCard({ icon: Icon, title, body }: {
  icon: any; title: string; body: string;
}) {
  return (
    <div className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-primary-300 hover:shadow-card-hover transition-all">
      <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-slate-900 text-base mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}

function BigStat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center sm:text-left">
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight tabular-nums">
        {number}
      </div>
      <div className="text-xs sm:text-sm text-slate-500 mt-2 leading-snug">{label}</div>
    </div>
  );
}

function PricingTier({
  name, price, priceUnit, forWho, features, highlighted,
}: {
  name: string;
  price: string;
  priceUnit: string;
  forWho: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative bg-white border rounded-2xl p-7 transition-all ${
        highlighted
          ? 'border-primary-500 shadow-card-hover lg:scale-[1.03] z-10'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-card'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-2xs uppercase tracking-wider font-bold px-3 py-1 rounded-full">
          Most popular
        </div>
      )}
      <div className="text-base font-semibold text-slate-900">{name}</div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-slate-900 tracking-tight">{price}</span>
        <span className="text-sm text-slate-500">{priceUnit}</span>
      </div>
      <p className="text-xs text-slate-500 mt-2">{forWho}</p>
      <ul className="mt-6 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href="#contact"
        className={`block text-center mt-8 w-full text-sm font-semibold px-4 py-2.5 rounded-lg transition-all ${
          highlighted
            ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-sm'
            : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-900'
        }`}
      >
        Get started
      </a>
    </div>
  );
}

function ContactCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xs font-semibold uppercase tracking-widest text-white/50">{label}</div>
      <div className="font-medium mt-1 text-white">{value}</div>
    </div>
  );
}
