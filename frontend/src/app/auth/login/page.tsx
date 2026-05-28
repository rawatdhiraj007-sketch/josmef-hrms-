'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/Logo';

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
    } catch {
      // error handled by context
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDemoLogin(role: 'admin' | 'employee') {
    setDemoLoading(true);
    try {
      const creds = role === 'admin'
        ? { email: 'admin@josmef.com', password: 'Admin@2025' }
        : { email: 'demo.employee@josmef.com', password: 'Demo@2025' };
      await login(creds);
    } catch {
      // error shown by context
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-rose-900 via-pink-800 to-violet-900 text-white flex-col justify-between p-12">
        <div>
          <Logo
            size={64}
            textClassName="text-3xl text-white"
            taglineClassName="text-pink-200"
          />
          <p className="text-pink-200/80 text-sm mt-3 ml-[76px] -mt-1">
            Human Resource Management System
          </p>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Caring for those<br />
            who care for<br />
            <span className="bg-gradient-to-r from-amber-300 to-pink-300 bg-clip-text text-transparent">
              others.
            </span>
          </h1>
          <p className="text-pink-100/90 text-lg leading-relaxed max-w-md">
            Recruitment, attendance, payroll, compliance, and the full
            employee lifecycle — built for healthcare teams.
          </p>
        </div>

        <p className="text-pink-200/60 text-xs">
          © {new Date().getFullYear()} JOSMEF. All rights reserved.
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Logo size={48} textClassName="text-xl text-gray-900" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to your HRMS account</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@josmef.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || demoLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* ── Quick-access demo logins (for testing — remove before launch) ── */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wider">
                  Testing Mode
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={submitting || demoLoading}
                className="border-2 border-rose-600 text-rose-700 hover:bg-rose-50 font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {demoLoading ? '...' : '🔑 HR Admin'}
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('employee')}
                disabled={submitting || demoLoading}
                className="border-2 border-violet-600 text-violet-700 hover:bg-violet-50 font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {demoLoading ? '...' : '👤 Employee'}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              One-click access for testing. Remove these buttons before going live.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}
