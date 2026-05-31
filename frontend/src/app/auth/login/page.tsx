'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Eye, EyeOff, ArrowRight, Layers, Smartphone, Sparkles, BarChart3,
} from 'lucide-react';
import Logo from '@/components/Logo';
import SplashLoader from '@/components/SplashLoader';
import { BRAND } from '@/lib/brand';

// ⚠️ SECURITY: this flag controls automatic admin login on page visit.
// MUST stay false in production / shared deployments. If you re-enable
// it for local development, NEVER ship that commit.
//
// Optional override via env: set NEXT_PUBLIC_TESTING_OPEN_MODE=true at
// build time to enable auto-login (e.g. for ephemeral preview builds).
const TESTING_OPEN_MODE =
  process.env.NEXT_PUBLIC_TESTING_OPEN_MODE === 'true';

export default function LoginPage() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try { await login({ email, password }); }
    catch { /* error surfaced via useAuth.error */ }
    finally { setSubmitting(false); }
  }

  async function handleDemoLogin(role: 'admin' | 'employee') {
    setDemoLoading(true);
    try {
      const creds = role === 'admin'
        ? { email: 'admin@josmef.com', password: 'Admin@2025' }
        : { email: 'demo.employee@josmef.com', password: 'Demo@2025' };
      await login(creds);
    } catch { /* */ }
    finally { setDemoLoading(false); }
  }

  // Optional auto-login for ephemeral preview builds (off by default in prod)
  useEffect(() => {
    if (TESTING_OPEN_MODE && !submitting && !demoLoading) {
      const timer = setTimeout(() => handleDemoLogin('admin'), 400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (TESTING_OPEN_MODE && demoLoading && !error) {
    return <SplashLoader message="Signing you in…" variant="dark" />;
  }

  return (
    <div className="min-h-screen flex bg-[#0F172A] text-white relative overflow-hidden">
      {/* Soft brand background */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[720px] h-[720px] rounded-full bg-primary-500/[0.08] blur-[140px]" />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-accent-500/[0.06] blur-[140px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.06]" />
      </div>

      {/* ════════════════════════════════════════════════════════
         LEFT PANEL — enterprise brand + stats
         ════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 xl:p-16">
        {/* Logo */}
        <div className="relative z-10">
          <Logo size={36} variant="light" textClassName="text-xl text-white font-semibold tracking-tight" />
        </div>

        {/* Hero */}
        <div className="relative z-10 max-w-xl animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-full px-3 py-1 text-2xs font-medium text-white/75 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            Workforce intelligence platform
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-[1.08] tracking-tight">
            <span className="block text-white/95">{BRAND.name}</span>
            <span className="block mt-3 nova-gradient-text">
              The operating system for modern workforce management.
            </span>
          </h1>

          <p className="text-white/65 text-base xl:text-lg leading-relaxed mt-6 max-w-lg">
            Unify workforce operations, compliance, payroll, and AI
            intelligence in one platform. Built for HR teams, healthcare
            companies, distributors, and growing enterprises.
          </p>

          {/* Premium stat cards */}
          <div className="grid grid-cols-2 gap-3 mt-10">
            <LoginStat icon={Layers}      title="24+ Modules"       sub="Unified platform" />
            <LoginStat icon={Smartphone}  title="Mobile Friendly"   sub="iOS · Android" />
            <LoginStat icon={Sparkles}    title="AI Assisted"       sub="Smart operations" />
            <LoginStat icon={BarChart3}   title="Real-Time Reports" sub="Live dashboards" />
          </div>
        </div>

        {/* Foot quote */}
        <div className="relative z-10">
          <blockquote className="border-l-2 border-primary-500/60 pl-4 text-white/65 text-sm max-w-md leading-relaxed">
            &ldquo;Replaced four legacy tools with one platform. Saved 60
            hours of HR admin per month.&rdquo;
          </blockquote>
          <p className="text-2xs text-white/40 mt-2 pl-5">— Director of HR, Mid-size Hospital</p>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
         RIGHT PANEL — sign-in card
         ════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8 flex items-center justify-between">
            <Logo size={36} variant="light" textClassName="text-lg text-white font-semibold tracking-tight" />
          </div>

          {/* Card — glass + soft border */}
          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] p-7 sm:p-9">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-white/55 mt-1 text-sm">
                Sign in to your {BRAND.name} workspace
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-200 text-sm"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-2xs font-semibold text-white/70 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/60 transition-all"
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-2xs font-semibold text-white/70 uppercase tracking-wider">
                    Password
                  </label>
                  <button type="button" className="text-2xs text-primary-300 hover:text-primary-200 font-medium">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-11 bg-white/[0.04] border border-white/[0.10] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500/60 transition-all"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || demoLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_6px_20px_-6px_rgba(20,184,166,0.55)]"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Demo logins */}
            <div className="mt-7">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.06]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#11192c] px-3 text-2xs text-white/40 uppercase tracking-wider font-semibold">
                    Or try a demo
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={submitting || demoLoading}
                  className="bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] hover:border-white/[0.15] text-white/90 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  HR Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('employee')}
                  disabled={submitting || demoLoading}
                  className="bg-white/[0.04] border border-white/[0.10] hover:bg-white/[0.08] hover:border-white/[0.15] text-white/90 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                  Employee
                </button>
              </div>
            </div>
          </div>

          {/* Footer below card */}
          <div className="mt-6 flex items-center justify-between text-2xs text-white/40">
            <span>© {new Date().getFullYear()} {BRAND.name}</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white/80 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/80 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/80 transition-colors">Help</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────
function LoginStat({
  icon: Icon, title, sub,
}: { icon: any; title: string; sub: string }) {
  return (
    <div className="bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-xl p-4 hover:bg-white/[0.06] hover:border-primary-400/30 transition-all">
      <div className="w-8 h-8 rounded-lg bg-primary-500/15 border border-primary-400/20 flex items-center justify-center text-primary-300 mb-2.5">
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-sm font-semibold text-white tracking-tight">{title}</div>
      <div className="text-2xs text-white/50 mt-0.5">{sub}</div>
    </div>
  );
}
