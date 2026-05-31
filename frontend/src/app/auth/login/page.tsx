'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Eye, EyeOff, ArrowRight, ShieldCheck, Lock, Sparkles, Users,
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
    <div className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 py-12 bg-white text-slate-900 overflow-hidden">
      {/* ══════════════════════════════════════════════════════
         Animated background — light, soft, on-brand
         ══════════════════════════════════════════════════════ */}
      <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[640px] rounded-full bg-gradient-to-br from-primary-200/40 via-primary-100/30 to-accent-200/30 blur-[120px] animate-aurora bg-[length:200%_200%]" />
        <div className="absolute top-1/4 -left-32 w-[400px] h-[400px] rounded-full bg-primary-300/20 blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-accent-300/20 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(15_23_42/0.04)_1px,transparent_0)] bg-[size:24px_24px]" />
      </div>

      {/* ══════════════════════════════════════════════════════
         Centered card stack
         ══════════════════════════════════════════════════════ */}
      <div className="w-full max-w-md animate-slide-up">
        {/* Brand line above the card */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Logo size={42} />
          <p className="text-xs text-slate-500 max-w-xs text-center leading-relaxed">
            The operating system for modern workforce management.
          </p>
        </div>

        {/* The login card — glassmorphism + soft shadow */}
        <div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-slate-200/70 shadow-[0_24px_64px_-16px_rgba(15,23,42,0.12)] p-7 sm:p-9">
          {/* Heading */}
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 mt-1.5">
              Sign in to your {BRAND.name} workspace
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-start gap-2"
            >
              <span className="text-rose-500 mt-0.5">●</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-2xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-2xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-2xs text-primary-700 hover:text-primary-900 font-medium transition-colors">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || demoLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_24px_-8px_rgba(59,130,246,0.55)]"
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

          {/* Demo logins divider */}
          <div className="mt-7">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/85 px-3 text-2xs text-slate-400 uppercase tracking-wider font-semibold">
                  Or try a demo
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={submitting || demoLoading}
                className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                HR Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('employee')}
                disabled={submitting || demoLoading}
                className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              >
                Employee
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
           Trust indicators — below the card
           ══════════════════════════════════════════════════════ */}
        <div className="mt-8 flex items-center justify-center gap-2 sm:gap-2.5 text-2xs text-slate-500 flex-wrap">
          <TrustChip icon={Lock}        label="TLS 1.3 encrypted" />
          <TrustChip icon={ShieldCheck} label="SOC-grade controls" />
          <TrustChip icon={Users}       label="Role-based access" />
          <TrustChip icon={Sparkles}    label="AI co-pilot" />
        </div>

        {/* Footer */}
        <div className="mt-7 flex items-center justify-between text-2xs text-slate-400">
          <span>© {new Date().getFullYear()} {BRAND.name}</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Help</a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trust indicator chip ──────────────────────────────────
function TrustChip({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 backdrop-blur border border-slate-200/70 text-slate-600 shadow-soft">
      <Icon className="w-3 h-3 text-primary-600" />
      {label}
    </span>
  );
}
