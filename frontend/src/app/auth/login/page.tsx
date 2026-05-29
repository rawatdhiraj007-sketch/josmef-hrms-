'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Eye, EyeOff, ArrowRight, Check, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';
import { BRAND } from '@/lib/brand';

// ⚠️ TESTING MODE: when true, page auto-logs you in as admin on load.
const TESTING_OPEN_MODE = true;

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
    try {
      await login({ email, password });
    } catch { /* */ } finally { setSubmitting(false); }
  }

  async function handleDemoLogin(role: 'admin' | 'employee') {
    setDemoLoading(true);
    try {
      const creds = role === 'admin'
        ? { email: 'admin@josmef.com', password: 'Admin@2025' }
        : { email: 'demo.employee@josmef.com', password: 'Demo@2025' };
      await login(creds);
    } catch { /* */ } finally { setDemoLoading(false); }
  }

  useEffect(() => {
    if (TESTING_OPEN_MODE && !submitting && !demoLoading) {
      const timer = setTimeout(() => handleDemoLogin('admin'), 400);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Loading overlay during auto-login
  if (TESTING_OPEN_MODE && demoLoading && !error) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <Logo size={56} textClassName="text-xl text-surface-900" taglineClassName="hidden" />
          </div>
          <div className="flex items-center justify-center gap-3 text-primary-600">
            <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <span className="font-medium text-sm">Signing you in…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* ─── Left panel — premium dark hero ─── */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden bg-surface-900 text-white flex-col justify-between p-12">
        {/* Animated gradient blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-32 w-[480px] h-[480px] bg-primary-600/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 -right-32 w-[480px] h-[480px] bg-accent-600/30 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        </div>

        {/* Top — logo */}
        <div className="relative z-10">
          <Logo
            size={40}
            textClassName="text-2xl text-white"
            taglineClassName="hidden"
          />
        </div>

        {/* Middle — hero copy */}
        <div className="relative z-10 space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur border border-white/10 rounded-full px-3 py-1 text-xs text-white/80">
            <Sparkles className="w-3 h-3" />
            <span>New: AI-powered insights</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight whitespace-pre-line">
            {BRAND.hero.headline}
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            {BRAND.hero.body}
          </p>

          {/* Feature checks */}
          <div className="grid grid-cols-2 gap-3 pt-6">
            {[
              'License tracking',
              'Shift scheduling',
              'Payroll + bonus runs',
              'Compliance alerts',
              'Employee portal',
              'Slack / Teams sync',
            ].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/80">
                <Check className="w-4 h-4 text-primary-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — testimonial */}
        <div className="relative z-10">
          <blockquote className="border-l-2 border-primary-500 pl-4 italic text-white/70 text-sm max-w-md">
            "Cut our HR admin time by 60% and never missed another license
            renewal."
          </blockquote>
          <p className="text-xs text-white/50 mt-2 pl-5">— Head of HR, Mid-size Hospital</p>
        </div>
      </div>

      {/* ─── Right panel — sign-in form ─── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Logo size={44} textClassName="text-xl text-surface-900" taglineClassName="hidden" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-surface-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-surface-500 mt-2 text-sm">
              Sign in to your {BRAND.name} account
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-surface-700">
                  Password
                </label>
                <button type="button" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-11 bg-white border border-surface-200 rounded-xl text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || demoLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-soft focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 disabled:opacity-50"
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
                <div className="w-full border-t border-surface-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-2xs text-surface-400 uppercase tracking-wider font-semibold">
                  Or try a demo
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={submitting || demoLoading}
                className="border border-surface-200 hover:border-primary-300 hover:bg-primary-50/40 text-surface-700 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                {demoLoading ? '…' : 'HR Admin'}
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('employee')}
                disabled={submitting || demoLoading}
                className="border border-surface-200 hover:border-primary-300 hover:bg-primary-50/40 text-surface-700 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              >
                {demoLoading ? '…' : 'Employee'}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-surface-100 flex items-center justify-between text-xs text-surface-400">
            <span>© {new Date().getFullYear()} {BRAND.name}</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-surface-600">Privacy</a>
              <a href="#" className="hover:text-surface-600">Terms</a>
              <a href="#" className="hover:text-surface-600">Help</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
