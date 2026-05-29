'use client';

import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import Logo from '@/components/Logo';
import {
  Sparkles, Users, Clock, ShieldCheck, BarChart3, Award,
  ArrowRight, Check, Zap, Briefcase, Globe2, Database,
  FileBarChart, Plane, CalendarCheck, GraduationCap,
} from 'lucide-react';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-white light-mode-page">
      {/* ───────── DARK HERO (Linear/Vercel style) ───────── */}
      <section className="relative overflow-hidden bg-nova-900 text-white">
        {/* Aurora mesh background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-nova-mesh opacity-80 animate-aurora bg-[length:200%_200%]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        </div>

        {/* Dark navbar */}
        <nav className="relative z-20 border-b border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Logo size={32} variant="light" glow textClassName="text-lg text-white" />
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
              <a href="#features"     className="hover:text-white transition-colors">Features</a>
              <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
              <a href="#pricing"      className="hover:text-white transition-colors">Pricing</a>
              <a href="#contact"      className="hover:text-white transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm text-white/70 hover:text-white px-3 py-2 transition-colors">
                Sign in
              </Link>
              <a
                href="#contact"
                className="bg-white text-surface-900 hover:bg-white/90 text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                Book a demo <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </nav>

        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-full px-4 py-1.5 text-xs font-medium text-white/80 mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-primary-300" />
            New: AI-powered insights + workflow automation
            <span className="bg-primary-500 text-white text-2xs px-1.5 py-0.5 rounded font-semibold">LIVE</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-5xl mx-auto leading-[1.05]">
            The next era of{' '}
            <span className="nova-gradient-text">
              workforce intelligence
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 mt-7 max-w-2xl mx-auto leading-relaxed">
            {BRAND.name} is the AI-native HR platform powering modern teams.
            Run recruitment, payroll, compliance, and shifts on one unified
            system — built for scale.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <a
              href="#contact"
              className="bg-gradient-to-r from-primary-500 via-primary-600 to-accent-600 hover:shadow-glow text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2"
            >
              Start free trial <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/auth/login"
              className="bg-white/[0.04] backdrop-blur border border-white/[0.10] hover:bg-white/[0.08] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all inline-flex items-center gap-2"
            >
              Try interactive demo
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-xs text-white/50 flex-wrap">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary-400" /> 14-day free trial</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary-400" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-primary-400" /> Set up in 1 day</span>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            <DarkStat number="27" label="HR Modules" />
            <DarkStat number="30+" label="License Types" />
            <DarkStat number="6" label="Integrations" />
            <DarkStat number="<200ms" label="API Response" />
          </div>
        </div>
      </section>

      {/* ───────── Feature highlights ───────── */}
      <section id="features" className="py-24 bg-surface-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-2xs uppercase tracking-widest font-semibold text-primary-600 mb-3">
              Everything you need
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-surface-900 tracking-tight">
              One platform, every HR workflow
            </h2>
            <p className="text-lg text-surface-600 mt-4 max-w-2xl mx-auto">
              From the moment someone applies to the day they retire — every
              touchpoint covered, every record audited.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Users}
              title="People & Records"
              accent="primary"
              body="40+ field employee records, 201 file, license tracking with auto-expiry alerts, former employee archive."
            />
            <FeatureCard
              icon={CalendarCheck}
              title="Shifts & Attendance"
              accent="violet"
              body="24/7 rotating shifts with skill-based assignment, fatigue rules, swap requests, GPS clock-in ready."
            />
            <FeatureCard
              icon={Award}
              title="Payroll & Bonus"
              accent="emerald"
              body="Run payroll with PH statutory deductions, 13th-month auto-compute, bonus runs, gov reports (SSS, PhilHealth, BIR)."
            />
            <FeatureCard
              icon={Plane}
              title="Leave Management"
              accent="indigo"
              body="8 PH leave types pre-configured, multi-level approval workflow, balance tracking, calendar view."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Compliance Engine"
              accent="amber"
              body="Real-time alerts for expired licenses, overdue NTEs, expiring contracts, stale disciplinary cases."
            />
            <FeatureCard
              icon={Zap}
              title="Automations"
              accent="pink"
              body="Slack/Teams/Discord notifications, workflow rules, custom webhooks, event-driven actions."
            />
          </div>
        </div>
      </section>

      {/* ───────── Integrations ───────── */}
      <section id="integrations" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-2xs uppercase tracking-widest font-semibold text-primary-600 mb-3">
              Integrations
            </div>
            <h2 className="text-4xl font-bold text-surface-900 tracking-tight">
              Works with the tools you use
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            {[
              'Slack', 'Microsoft Teams', 'Discord',
              'Webhooks', 'Email (SMTP)', 'Graphy LMS',
            ].map(name => (
              <div
                key={name}
                className="px-5 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm font-medium text-surface-700 hover:border-primary-300 hover:bg-white hover:shadow-soft transition-all"
              >
                {name}
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-surface-500 mt-6">
            Plus signed outbound webhooks for custom integrations.
          </p>
        </div>
      </section>

      {/* ───────── All modules grid ───────── */}
      <section className="py-24 bg-surface-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-2xs uppercase tracking-widest font-semibold text-primary-600 mb-3">
              Full platform
            </div>
            <h2 className="text-4xl font-bold text-surface-900 tracking-tight">
              27 integrated modules
            </h2>
            <p className="text-lg text-surface-600 mt-4">
              No more juggling five different tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              ['Applicants', 'ATS pipeline'],
              ['Trainees', 'Onboarding + eval'],
              ['Employees', '40+ fields, 201 file'],
              ['Licenses', '30+ credentials'],
              ['Shifts', '24/7 scheduling'],
              ['Attendance', 'Daily tracking'],
              ['Payroll', 'PH statutory deductions'],
              ['13th-Month', 'Auto-compute PD 851'],
              ['Bonus Runs', 'Performance, commission'],
              ['Leave', '8 PH leave types'],
              ['Loans', 'Salary, cash advance'],
              ['Disciplinary', 'NTE, suspension'],
              ['Incident Reports', 'Safety logging'],
              ['Work Certificates', 'COE generation'],
              ['Exit Clearance', 'Multi-dept + e-sign'],
              ['Training', 'Graphy integration'],
              ['Gov Reports', 'SSS/PhilHealth/BIR'],
              ['Compliance', 'Auto-alert engine'],
              ['Audit Log', 'Every change tracked'],
              ['Analytics', '6 chart visualizations'],
              ['Employee Portal', 'Self-service'],
              ['Integrations', 'Slack / Teams / Discord'],
              ['Automations', 'Workflow rules'],
              ['Jobs', 'Public openings + apply'],
            ].map(([title, sub]) => (
              <div key={title} className="card p-4 hover:border-primary-300 hover:shadow-soft transition-all">
                <div className="font-semibold text-sm text-surface-900">{title}</div>
                <div className="text-xs text-surface-500 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Pricing ───────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-2xs uppercase tracking-widest font-semibold text-primary-600 mb-3">
              Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-surface-900 tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-surface-600 mt-4">
              Pay per active employee. No setup fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingTier
              name="Starter"
              price="₱200"
              priceUnit="/employee/month"
              forWho="Small teams, 10–50 staff"
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
              forWho="Growing companies, 50–500 staff"
              features={[
                'Everything in Starter',
                'Shift Scheduling',
                'Compliance Engine',
                'Slack / Teams integrations',
                'Workflow Automations',
                'Bonus Runs + 13th-Month',
                'Analytics + Custom Reports',
                'Priority support',
              ]}
              highlighted
            />
            <PricingTier
              name="Enterprise"
              price="Custom"
              priceUnit=""
              forWho="Large orgs, 500+ staff"
              features={[
                'Everything in Pro',
                'SSO (SAML/OAuth)',
                '2FA enforcement',
                'Custom branding',
                'Dedicated CSM',
                'SLA + uptime guarantee',
                'API access',
              ]}
            />
          </div>

          <p className="text-center text-sm text-surface-500 mt-8">
            Annual billing saves 15% · Volume discounts at 200+ employees
          </p>
        </div>
      </section>

      {/* ───────── Trust / regions ───────── */}
      <section className="py-20 bg-surface-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-surface-500 mb-8">
            Built for Philippines, ready for Asia & EU
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <RegionPill flag="🇵🇭" name="Philippines" active />
            <RegionPill flag="🇬🇧" name="UK" />
            <RegionPill flag="🇸🇬" name="Singapore" />
            <RegionPill flag="🇪🇺" name="EU" />
          </div>
        </div>
      </section>

      {/* ───────── CTA / contact ───────── */}
      <section id="contact" className="py-24 bg-gradient-to-br from-surface-900 via-primary-950 to-surface-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-32 w-[480px] h-[480px] bg-primary-600/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-32 w-[480px] h-[480px] bg-accent-600/30 rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ready to modernize your HR?
          </h2>
          <p className="text-white/70 text-lg mt-4 max-w-2xl mx-auto">
            Book a 20-minute demo. We'll show you the platform, answer your
            questions, and set up a free 14-day trial.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <a
              href="mailto:hello@example.com?subject=Demo%20request"
              className="bg-white text-surface-900 hover:bg-surface-100 px-6 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
            >
              Email us <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/auth/login"
              className="border-2 border-white/20 hover:bg-white/5 text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
            >
              Try the demo
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto text-left">
            <div>
              <div className="text-2xs font-semibold uppercase tracking-widest text-white/50">Email</div>
              <div className="font-medium mt-1">hello@example.com</div>
            </div>
            <div>
              <div className="text-2xs font-semibold uppercase tracking-widest text-white/50">Phone</div>
              <div className="font-medium mt-1">+63 …</div>
            </div>
            <div>
              <div className="text-2xs font-semibold uppercase tracking-widest text-white/50">Office</div>
              <div className="font-medium mt-1">Manila, Philippines</div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-surface-900 text-surface-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size={32} textClassName="text-base text-white" taglineClassName="hidden" />
            <p className="text-xs">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-surface-900 tracking-tight">{number}</div>
      <div className="text-2xs font-semibold uppercase tracking-wider text-surface-500 mt-1">{label}</div>
    </div>
  );
}

function DarkStat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold tracking-tight nova-gradient-text">{number}</div>
      <div className="text-2xs font-semibold uppercase tracking-wider text-white/40 mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon: Icon, title, body, accent,
}: {
  icon: any;
  title: string;
  body: string;
  accent: 'primary' | 'violet' | 'amber' | 'emerald' | 'indigo' | 'pink';
}) {
  const colors = {
    primary: 'from-primary-100 to-primary-50 text-primary-600',
    violet:  'from-violet-100 to-violet-50 text-violet-600',
    amber:   'from-amber-100 to-amber-50 text-amber-600',
    emerald: 'from-emerald-100 to-emerald-50 text-emerald-600',
    indigo:  'from-indigo-100 to-indigo-50 text-indigo-600',
    pink:    'from-pink-100 to-pink-50 text-pink-600',
  };
  return (
    <div className="card p-6 hover:shadow-card-hover transition-all hover:-translate-y-0.5">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[accent]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-surface-900 text-lg mb-2">{title}</h3>
      <p className="text-sm text-surface-600 leading-relaxed">{body}</p>
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
    <div className={`card p-8 relative ${highlighted ? 'ring-2 ring-primary-500 shadow-card-hover scale-[1.02]' : ''}`}>
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-2xs uppercase tracking-wider font-bold px-3 py-1 rounded-full">
          Most popular
        </div>
      )}
      <div className="font-semibold text-surface-900">{name}</div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-surface-900 tracking-tight">{price}</span>
        <span className="text-sm text-surface-500">{priceUnit}</span>
      </div>
      <p className="text-xs text-surface-500 mt-2">{forWho}</p>
      <ul className="mt-6 space-y-3">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-surface-700">
            <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <a
        href="#contact"
        className={`block text-center mt-8 w-full text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${
          highlighted
            ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-soft'
            : 'bg-white border border-surface-200 hover:border-surface-300 text-surface-900'
        }`}
      >
        Get started
      </a>
    </div>
  );
}

function RegionPill({ flag, name, active }: { flag: string; name: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'text-surface-700' : 'text-surface-400'}`}>
      <span className="text-2xl">{flag}</span>
      <span className="font-medium">{name}</span>
      {!active && <span className="text-xs text-surface-400 ml-1">(coming soon)</span>}
    </div>
  );
}
