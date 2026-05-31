'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, ArrowRight, Check, Sparkles } from 'lucide-react';
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
    catch { /* */ }
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

  useEffect(() => {
    if (TESTING_OPEN_MODE && !submitting && !demoLoading) {
      const timer = setTimeout(() => handleDemoLogin('admin'), 400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Splash overlay during auto-login
  if (TESTING_OPEN_MODE && demoLoading && !error) {
    return <SplashLoader message="Signing you in…" variant="dark" />;
  }

  return (
    <div className="min-h-screen flex bg-nova-900 text-nova-100 relative overflow-hidden">
      {/* Global aurora background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-nova-mesh opacity-70 animate-aurora bg-[length:200%_200%]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* ─── Left panel — premium hero ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-14">
        {/* Logo at top */}
        <div className="relative z-10">
          <Logo size={42} variant="light" glow textClassName="text-2xl text-white" />
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-8 max-w-xl animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-white/[0.04] backdrop-blur border border-white/[0.08] rounded-full px-4 py-1.5 text-xs text-white/80">
            <Sparkles className="w-3 h-3 text-primary-400" />
            <span>The next era of workforce intelligence</span>
          </div>
          <h1 className="text-6xl font-bold leading-[1.05] tracking-tight whitespace-pre-line">
            <span className="nova-gradient-text">
              {BRAND.hero.headline}
            </span>
          </h1>
          <p className="text-white/60 text-lg leading-relaxed max-w-lg">
            {BRAND.hero.body}
          </p>

          {/* Feature pills */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              'AI insights',
              'Workflow automations',
              'PRC license tracking',
              'Shift scheduling',
              'Payroll + Bonus runs',
              'Slack / Teams sync',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-5 h-5 rounded-md bg-primary-500/10 border border-primary-500/30 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-300" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10">
          <blockquote className="border-l-2 border-primary-500/60 pl-4 italic text-white/60 text-sm max-w-md">
            "Replaced four legacy tools with one platform. Saved 60 hours of HR
            admin per month."
          </blockquote>
          <p className="text-xs text-white/40 mt-2 pl-5">— Director of HR, Mid-size Hospital</p>
        </div>
      </div>

      {/* ─── Right panel — sign-in card ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Logo size={44} variant="light" glow textClassName="text-xl text-white" />
          </div>

          {/* Card */}
          <div className="dark-card p-8 sm:p-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Welcome back
              </h2>
              <p className="text-nova-300 mt-1 text-sm">
                Sign in to your {BRAND.name} account
              </p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-nova-200 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-nova-900/60 border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-nova-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-nova-200 uppercase tracking-wider">
                    Password
                  </label>
                  <button type="button" className="text-xs text-primary-400 hover:text-primary-300 font-medium">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 pr-11 bg-nova-900/60 border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-nova-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-nova-400 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || demoLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-glow transition-all disabled:opacity-50"
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
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.06]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-nova-800 px-3 text-2xs text-nova-400 uppercase tracking-wider font-semibold">
                    Or try a demo
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={submitting || demoLoading}
                  className="bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] text-white/90 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                >
                  HR Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('employee')}
                  disabled={submitting || demoLoading}
                  className="bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] text-white/90 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                >
                  Employee
                </button>
              </div>
            </div>
          </div>

          {/* Footer below card */}
          <div className="mt-6 flex items-center justify-between text-xs text-nova-400">
            <span>© {new Date().getFullYear()} {BRAND.name}</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Help</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
