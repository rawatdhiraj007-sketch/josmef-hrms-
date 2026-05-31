'use client';

import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import Logo from '@/components/Logo';
import {
  Sparkles, Users, ShieldCheck, Award, ArrowRight, Check, Plane, CalendarCheck,
  Stethoscope, Truck, Building2, Cpu, Smartphone, LockKeyhole, Layers, Star,
} from 'lucide-react';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased">
      {/* ════════════════════════════════════════════════════════
         NAVBAR — minimal glass, sticky
         ════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size={28} />
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#platform"  className="hover:text-slate-900 transition-colors">Platform</a>
            <a href="#segments"  className="hover:text-slate-900 transition-colors">For your team</a>
            <a href="#pricing"   className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#contact"   className="hover:text-slate-900 transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-sm text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
            >
              Sign in
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Book a demo <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </nav>
      </header>

      {/* ════════════════════════════════════════════════════════
         HERO — white base, animated soft gradient glow
         ════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Animated background glow */}
        <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-220px] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full bg-gradient-to-br from-primary-200/40 via-primary-100/30 to-accent-200/30 blur-[120px] animate-aurora bg-[length:200%_200%]" />
          <div className="absolute top-32 -left-32 w-[420px] h-[420px] rounded-full bg-primary-300/20 blur-[100px]" />
          <div className="absolute top-48 -right-32 w-[420px] h-[420px] rounded-full bg-accent-300/20 blur-[100px]" />
          {/* Subtle dot grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(15_23_42/0.05)_1px,transparent_0)] bg-[size:24px_24px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200 rounded-full px-3 py-1 text-2xs font-semibold text-slate-700 mb-7 shadow-soft animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              <span className="uppercase tracking-wider">Now in private beta</span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500">AI-assisted workforce ops</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] text-slate-900">
              The operating system
              <br className="hidden sm:block" />
              <span className="nova-gradient-text"> for modern workforce management.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 mt-7 max-w-2xl mx-auto leading-relaxed">
              Unify HR, payroll, compliance, training, attendance, and AI
              automation in one platform. Built for HR teams, healthcare
              companies, distributors, and growing enterprises.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 bg-gradient-to-br from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-[0_8px_28px_-10px_rgba(59,130,246,0.55)] hover:shadow-[0_12px_32px_-8px_rgba(59,130,246,0.6)]"
              >
                Start free trial <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 hover:border-slate-300 hover:bg-white text-slate-900 text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-soft"
              >
                Try interactive demo
              </Link>
            </div>

            {/* Trust micro-row */}
            <div className="flex items-center justify-center gap-5 mt-7 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary-600" /> 14-day free trial</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary-600" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary-600" /> Set up in under a day</span>
            </div>
          </div>

          {/* Glass KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 lg:mt-24 max-w-5xl mx-auto">
            <GlassKpi icon={Layers}      label="Workforce modules" value="24+"          sub="Unified in one platform" />
            <GlassKpi icon={Sparkles}    label="AI assisted"        value="Operations"   sub="Insights, alerts, reports" />
            <GlassKpi icon={Smartphone}  label="Mobile ready"       value="iOS · Android" sub="Employee portal + kiosk" />
            <GlassKpi icon={LockKeyhole} label="Enterprise secure"  value="SOC-grade"    sub="Audit logs · roles" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         SEGMENTS — trust band
         ════════════════════════════════════════════════════════ */}
      <section id="segments" className="py-20 lg:py-24 border-y border-slate-200/60 bg-gradient-to-b from-white via-slate-50/40 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-2xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-10">
            Built for teams across
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Segment icon={Stethoscope} title="Healthcare"   detail="Clinics & hospitals" />
            <Segment icon={Truck}       title="Distribution" detail="Logistics & supply" />
            <Segment icon={Building2}   title="SMEs"         detail="50–500 employees" />
            <Segment icon={Cpu}         title="Enterprises"  detail="500+ workforce" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         PLATFORM PILLARS — 6 glass cards
         ════════════════════════════════════════════════════════ */}
      <section id="platform" className="relative py-24 lg:py-32 bg-white overflow-hidden">
        {/* Soft accent glow */}
        <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-[420px] h-[420px] rounded-full bg-primary-200/30 blur-[120px]" />
          <div className="absolute top-1/2 -translate-y-1/2 -right-32 w-[420px] h-[420px] rounded-full bg-accent-200/30 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16 lg:mb-20">
            <div className="text-2xs uppercase tracking-[0.2em] font-semibold text-primary-700 mb-3">
              Platform
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              One platform, every workforce workflow.
            </h2>
            <p className="text-lg text-slate-600 mt-5 leading-relaxed max-w-2xl">
              From the moment someone applies to the day they retire — every
              touchpoint covered, every record audited, every report ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <Pillar icon={Users}         title="People & records"     body="40+ field employee records, 201 file, license tracking with auto-expiry alerts, former employee archive." />
            <Pillar icon={CalendarCheck} title="Shifts & attendance"  body="24/7 rotating shifts with skill-based assignment, fatigue rules, swap requests, kiosk clock-in mode." />
            <Pillar icon={Award}         title="Payroll & bonuses"    body="Run payroll with PH statutory deductions, 13th-month auto-compute, bonus runs, gov reports (SSS, PhilHealth, BIR)." />
            <Pillar icon={Plane}         title="Leave management"     body="8 PH leave types pre-configured, multi-level approval workflow, balance tracking, calendar view." />
            <Pillar icon={ShieldCheck}   title="Compliance engine"    body="Real-time alerts for expired licenses, overdue NTEs, expiring contracts, stale disciplinary cases." />
            <Pillar icon={Sparkles}      title="AI co-pilot"          body="Smart insights, executive briefings, business health score, natural-language search, alert prioritization." />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         MODULES — clean light grid
         ════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50/40 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-2xs uppercase tracking-[0.2em] font-semibold text-primary-700 mb-3">
              Full platform
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              24+ integrated modules
            </h2>
            <p className="text-base text-slate-600 mt-3 max-w-xl mx-auto">
              No more juggling five different tools for one team.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {MODULES.map(([title, sub]) => (
              <div
                key={title}
                className="bg-white border border-slate-200/80 rounded-xl p-4 hover:border-primary-300 hover:shadow-[0_4px_24px_-8px_rgba(59,130,246,0.18)] transition-all"
              >
                <div className="font-semibold text-sm text-slate-900">{title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         STATS + TESTIMONIAL
         ════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-8">
              <BigStat number="60h"     label="HR admin hours saved per month" />
              <BigStat number="< 1d"    label="Average setup time" />
              <BigStat number="99.9%"   label="Platform uptime target" />
              <BigStat number="< 200ms" label="API response time" />
            </div>

            {/* Testimonial card */}
            <div className="relative">
              <div aria-hidden className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary-100/60 to-accent-100/60 blur-2xl" />
              <div className="relative bg-white border border-slate-200 rounded-2xl p-8 lg:p-10 shadow-card">
                <div className="flex items-center gap-1 mb-5">
                  {[1,2,3,4,5].map((i) => <Star key={i} className="w-4 h-4 fill-accent-500 text-accent-500" />)}
                </div>
                <blockquote className="text-lg lg:text-xl text-slate-900 leading-relaxed font-medium">
                  &ldquo;Replaced four legacy tools with one platform. Saved
                  60 hours of HR admin per month and made compliance painless.&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 pt-6 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-soft">M</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">Maria · Director of HR</div>
                    <div className="text-xs text-slate-500">Mid-size hospital · Manila</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         PRICING
         ════════════════════════════════════════════════════════ */}
      <section id="pricing" className="py-24 lg:py-32 bg-gradient-to-b from-slate-50/40 via-white to-slate-50/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-2xs uppercase tracking-[0.2em] font-semibold text-primary-700 mb-3">
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
              name="Starter" price="₱200" priceUnit="/employee/month"
              forWho="Small teams · 10–50 staff"
              features={[ 'Core HR + 201 File', 'Attendance + Payroll', 'Leave Management', 'License Tracking', 'Gov Reports (PH)', 'Email support' ]}
            />
            <PricingTier
              name="Pro" price="₱500" priceUnit="/employee/month"
              forWho="Growing companies · 50–500 staff" highlighted
              features={[ 'Everything in Starter', 'Shift Scheduling', 'Compliance Engine', 'Slack / Teams integrations', 'Workflow Automations', 'Bonus + 13th-Month Auto', 'Analytics + Custom Reports', 'AI Co-pilot' ]}
            />
            <PricingTier
              name="Enterprise" price="Custom" priceUnit=""
              forWho="Large orgs · 500+ staff"
              features={[ 'Everything in Pro', 'SSO (SAML/OAuth)', '2FA enforcement', 'Custom branding', 'Dedicated success manager', 'SLA + uptime guarantee', 'API access' ]}
            />
          </div>

          <p className="text-center text-sm text-slate-500 mt-10">
            Annual billing saves 15% · Volume discounts at 200+ employees
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         CTA — light glassy with brand glow
         ════════════════════════════════════════════════════════ */}
      <section id="contact" className="relative py-24 lg:py-32 overflow-hidden bg-white">
        <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-br from-primary-100/60 via-accent-100/40 to-transparent blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200 rounded-full px-3 py-1 text-2xs font-semibold text-slate-700 mb-6 shadow-soft">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <span className="uppercase tracking-wider">Ready when you are</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Modernize your workforce in
            <span className="nova-gradient-text"> one platform.</span>
          </h2>
          <p className="text-slate-600 text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
            Book a 20-minute demo. We&apos;ll show you the platform, answer
            your questions, and set up a free 14-day trial — no commitment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
            <a
              href="mailto:support@nextnova.ai?subject=Demo%20request"
              className="inline-flex items-center gap-2 bg-gradient-to-br from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-[0_8px_28px_-10px_rgba(59,130,246,0.55)]"
            >
              Email us <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-900 px-6 py-3 rounded-xl font-semibold text-sm transition-colors shadow-soft"
            >
              Try the demo
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl mx-auto">
            <ContactCell label="Email"  value="support@nextnova.ai" />
            <ContactCell label="Hours"  value="Mon–Fri · 9am–6pm PHT" />
            <ContactCell label="Office" value="Manila, Philippines" />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
         FOOTER
         ════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-200/60 bg-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo size={26} />
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
// Sub-components — glassmorphism + premium polish
// ─────────────────────────────────────────────────────────

function GlassKpi({
  icon: Icon, label, value, sub,
}: { icon: any; label: string; value: string; sub: string }) {
  return (
    <div className="group relative bg-white/70 backdrop-blur-xl border border-slate-200/70 rounded-2xl p-5 shadow-soft hover:shadow-card-hover hover:border-primary-200 hover:-translate-y-0.5 transition-all">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 text-primary-700 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-2xs uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
      </div>
      <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function Segment({
  icon: Icon, title, detail,
}: { icon: any; title: string; detail: string }) {
  return (
    <div className="group bg-white border border-slate-200/70 rounded-xl p-5 text-center hover:border-primary-200 hover:shadow-soft transition-all">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 text-primary-700 mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="text-xs text-slate-500 mt-0.5">{detail}</div>
    </div>
  );
}

function Pillar({
  icon: Icon, title, body,
}: { icon: any; title: string; body: string }) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-xl border border-slate-200/70 rounded-2xl p-6 hover:border-primary-200 hover:shadow-[0_8px_32px_-12px_rgba(59,130,246,0.25)] hover:-translate-y-0.5 transition-all">
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 border border-primary-100 text-primary-700 flex items-center justify-center mb-5">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-slate-900 text-base mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}

function BigStat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl sm:text-5xl font-bold tracking-tight tabular-nums nova-gradient-text">
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
      className={`relative rounded-2xl p-7 transition-all ${
        highlighted
          ? 'bg-white border-2 border-primary-500 shadow-[0_24px_48px_-16px_rgba(59,130,246,0.35)] lg:scale-[1.03] z-10'
          : 'bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-card'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-2xs uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-soft">
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
            ? 'bg-gradient-to-br from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white shadow-sm'
            : 'bg-slate-900 hover:bg-slate-800 text-white'
        }`}
      >
        Get started
      </a>
    </div>
  );
}

function ContactCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/70 backdrop-blur border border-slate-200/60 rounded-xl px-4 py-3 shadow-soft">
      <div className="text-2xs font-semibold uppercase tracking-widest text-slate-500">{label}</div>
      <div className="font-medium mt-1 text-slate-900">{value}</div>
    </div>
  );
}
