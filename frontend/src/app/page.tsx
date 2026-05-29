'use client';

import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import Logo from '@/components/Logo';
import {
  Stethoscope, Award, ShieldCheck, FileBarChart, Plane, CalendarCheck,
  ArrowRight, Check,
} from 'lucide-react';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-white">
      {/* ───────── Navbar ───────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size={32} textClassName="text-lg text-surface-900" taglineClassName="hidden" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-surface-600">
            <a href="#features" className="hover:text-surface-900">Features</a>
            <a href="#healthcare" className="hover:text-surface-900">For Healthcare</a>
            <a href="#pricing" className="hover:text-surface-900">Pricing</a>
            <a href="#contact" className="hover:text-surface-900">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
            <a href="#contact" className="btn-primary text-sm">Book a demo</a>
          </div>
        </div>
      </nav>

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-200 rounded-full blur-3xl opacity-40" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 border border-rose-200 rounded-full px-4 py-1.5 text-xs font-medium text-rose-700 mb-8">
            <Stethoscope className="w-3.5 h-3.5" />
            Built for healthcare teams
            <span className="bg-rose-600 text-white text-2xs px-1.5 py-0.5 rounded">NEW</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-surface-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Modern HR for <br className="md:hidden" />
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
              healthcare teams
            </span>
          </h1>

          <p className="text-lg text-surface-600 mt-6 max-w-2xl mx-auto leading-relaxed">
            Track PRC licenses with auto-expiry alerts. Manage 24/7 shifts.
            Run payroll, leave, and compliance — all on one platform built for
            clinics, hospitals, and home-care agencies.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <a href="#contact" className="btn-primary text-base px-6 py-3">
              Book a 20-min demo <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/auth/login" className="btn-secondary text-base px-6 py-3">
              Try interactive demo
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-xs text-surface-500 flex-wrap">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> 14-day free trial</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Set up in 1 day</span>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            <Stat number="25+" label="HR Modules" />
            <Stat number="30+" label="License Types" />
            <Stat number="100%" label="PH Labor Compliant" />
            <Stat number="<200ms" label="API Response" />
          </div>
        </div>
      </section>

      {/* ───────── Why Healthcare ───────── */}
      <section id="healthcare" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-2xs uppercase tracking-widest font-semibold text-rose-600 mb-3">
              Healthcare-specific
            </div>
            <h2 className="text-4xl font-bold text-surface-900 tracking-tight">
              Built for the work you actually do
            </h2>
            <p className="text-lg text-surface-600 mt-4 max-w-2xl mx-auto">
              Generic HR systems don't understand PRC renewals, shift differentials,
              or CPD tracking. We do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Stethoscope}
              title="PRC License Tracking"
              accent="rose"
              body="Track 30+ credentials: PRC RN/MD/PT, UK NMC/GMC, BLS/ACLS, NBI clearance. Auto-alerts 90/30/7 days before expiry."
            />
            <FeatureCard
              icon={CalendarCheck}
              title="24/7 Shift Scheduling"
              accent="violet"
              body="Rotating shifts, on-call, skill-based assignment. Block scheduling when staff is fatigued or under-credentialed."
              badge="Coming soon"
            />
            <FeatureCard
              icon={Award}
              title="CPD Units Tracking"
              accent="amber"
              body="Auto-fill required units per license type. Progress bars per employee. Alert when CPD is behind for renewal."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Compliance Engine"
              accent="emerald"
              body="Real-time alerts for expired licenses, overdue NTEs, expiring contracts, unresolved disciplinary cases."
            />
            <FeatureCard
              icon={FileBarChart}
              title="Gov Reports (PH)"
              accent="blue"
              body="One-click SSS R-3, PhilHealth RF-1, Pag-IBIG MCRF, BIR 2316, BIR Alphalist. Excel/CSV export ready."
            />
            <FeatureCard
              icon={Plane}
              title="Leave Management"
              accent="pink"
              body="8 PH leave types pre-configured (VL/SL/ML/PL/BL/Solo Parent/VAWC/Unpaid). Balance tracking + approval workflow."
            />
          </div>
        </div>
      </section>

      {/* ───────── Features grid ───────── */}
      <section id="features" className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-2xs uppercase tracking-widest font-semibold text-rose-600 mb-3">
              Full HR platform
            </div>
            <h2 className="text-4xl font-bold text-surface-900 tracking-tight">
              Everything from hire to retire
            </h2>
            <p className="text-lg text-surface-600 mt-4 max-w-2xl mx-auto">
              25 integrated modules — no more juggling 5 different tools.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              ['Applicants', 'ATS pipeline'],
              ['Trainees', 'Onboarding + evaluation'],
              ['Employees', '40+ fields, 201 file'],
              ['Licenses', '30+ credentials'],
              ['Attendance', 'Daily time tracking'],
              ['Payroll', 'PH statutory deductions'],
              ['13th-Month', 'Auto-compute per PD 851'],
              ['Bonus Runs', 'Performance, commission'],
              ['Leave', '8 PH leave types'],
              ['Loans', 'Salary, emergency, advance'],
              ['Disciplinary', 'NTE, suspension, termination'],
              ['Incident Reports', 'Safety event logging'],
              ['Work Certificates', 'COE generation'],
              ['Exit Clearance', 'Multi-dept + e-sign'],
              ['Training', 'Graphy integration'],
              ['Gov Reports', 'SSS/PhilHealth/Pag-IBIG/BIR'],
              ['Compliance', 'Auto-alert engine'],
              ['Audit Log', 'Every change tracked'],
              ['Analytics', '6 chart visualizations'],
              ['Employee Portal', 'Self-service'],
            ].map(([title, sub]) => (
              <div key={title} className="card p-4">
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
            <div className="text-2xs uppercase tracking-widest font-semibold text-rose-600 mb-3">
              Pricing
            </div>
            <h2 className="text-4xl font-bold text-surface-900 tracking-tight">
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
              forWho="Small clinics, dental, 10-50 staff"
              features={[
                'Core HR + 201 File',
                'Attendance + Payroll',
                'Leave Management',
                'PRC License Tracking',
                'Gov Reports (PH)',
                'Email support',
              ]}
            />
            <PricingTier
              name="Pro"
              price="₱500"
              priceUnit="/employee/month"
              forWho="Hospitals, multi-location clinics, 50-500 staff"
              features={[
                'Everything in Starter',
                'Shift Scheduling',
                'Compliance Engine',
                'Audit Log',
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
              forWho="Hospital systems, 500+ staff"
              features={[
                'Everything in Pro',
                'SSO (SAML/OAuth)',
                '2FA enforcement',
                'Custom branding',
                'Dedicated support',
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
      <section className="py-20 bg-gradient-to-br from-surface-50 to-white">
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
      <section id="contact" className="py-24 bg-gradient-to-br from-rose-900 via-pink-900 to-violet-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ready to modernize your healthcare HR?
          </h2>
          <p className="text-pink-100/90 text-lg mt-4 max-w-2xl mx-auto">
            Book a 20-minute demo. We'll show you the platform, answer your questions,
            and set up a free 14-day trial.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
            <a
              href="mailto:hello@example.com?subject=Demo%20request"
              className="bg-white text-rose-700 px-6 py-3 rounded-lg font-semibold hover:bg-pink-50 transition-colors inline-flex items-center gap-2"
            >
              Email us <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/auth/login"
              className="border-2 border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-2"
            >
              Try the demo first
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto text-left">
            <div>
              <div className="text-2xs font-semibold uppercase tracking-widest text-pink-200">Email</div>
              <div className="font-medium mt-1">hello@example.com</div>
            </div>
            <div>
              <div className="text-2xs font-semibold uppercase tracking-widest text-pink-200">Phone</div>
              <div className="font-medium mt-1">+63 (placeholder)</div>
            </div>
            <div>
              <div className="text-2xs font-semibold uppercase tracking-widest text-pink-200">Office</div>
              <div className="font-medium mt-1">Manila, Philippines</div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-surface-900 text-surface-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size={32} textClassName="text-base text-white" taglineClassName="text-2xs text-surface-500 -mt-0.5" />
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
      <div className="text-3xl font-bold text-surface-900 tracking-tight">{number}</div>
      <div className="text-2xs font-semibold uppercase tracking-wider text-surface-500 mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon: Icon, title, body, accent, badge,
}: {
  icon: any;
  title: string;
  body: string;
  accent: 'rose' | 'violet' | 'amber' | 'emerald' | 'blue' | 'pink';
  badge?: string;
}) {
  const colors = {
    rose: 'from-rose-100 to-rose-50 text-rose-600',
    violet: 'from-violet-100 to-violet-50 text-violet-600',
    amber: 'from-amber-100 to-amber-50 text-amber-600',
    emerald: 'from-emerald-100 to-emerald-50 text-emerald-600',
    blue: 'from-blue-100 to-blue-50 text-blue-600',
    pink: 'from-pink-100 to-pink-50 text-pink-600',
  };
  return (
    <div className="card p-6 hover:shadow-card-hover transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[accent]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {badge && <span className="badge-warning">{badge}</span>}
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
    <div className={`card p-8 relative ${highlighted ? 'ring-2 ring-primary-500 shadow-card-hover' : ''}`}>
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
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      <a href="#contact" className={`block text-center mt-8 ${highlighted ? 'btn-primary' : 'btn-secondary'} w-full`}>
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
