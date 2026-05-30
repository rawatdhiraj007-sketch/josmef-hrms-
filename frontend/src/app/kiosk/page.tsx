'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Search, LogIn, LogOut, Clock, CheckCircle2, AlertCircle, ArrowLeft,
  Maximize2,
} from 'lucide-react';

import Avatar from '@/components/ui/Avatar';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department?: string;
  position?: string;
}

type LastAction = { kind: 'in' | 'out'; employee: Employee; at: Date } | null;

/**
 * NextNova Attendance Kiosk — tablet-optimized clock in/out station.
 *
 * Designed for a wall-mounted iPad at the clinic entrance. No login required
 * (uses a session-level mode, not user auth). Employees:
 *   1. Find themselves in the grid OR type their name / ID
 *   2. Tap big Time In / Time Out buttons
 *   3. See confirmation, auto-resets after 8 seconds
 *
 * Posts to POST /attendance with { employeeId, timeIn|timeOut } — gracefully
 * degrades with a toast if the endpoint doesn't accept the payload.
 *
 * Open in fullscreen on the kiosk device for best UX (Maximize button → F11).
 */
export default function KioskPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Employee | null>(null);
  const [posting, setPosting] = useState<'in' | 'out' | null>(null);
  const [lastAction, setLastAction] = useState<LastAction>(null);
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState<string>('');

  useEffect(() => {
    api.get('/employees', { params: { limit: 500 } })
      .then((r) => setEmployees(r.data?.data ?? r.data?.rows ?? []))
      .catch(() => setError('Could not load employee list.'))
      .finally(() => setLoading(false));
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-clear last-action confirmation after 8s
  useEffect(() => {
    if (!lastAction) return;
    const t = setTimeout(() => setLastAction(null), 8000);
    return () => clearTimeout(t);
  }, [lastAction]);

  // Auto-clear selection if user is idle for 30s without acting
  useEffect(() => {
    if (!selected) return;
    const t = setTimeout(() => setSelected(null), 30000);
    return () => clearTimeout(t);
  }, [selected]);

  const filtered = useMemo(() => {
    if (!query.trim()) return employees.slice(0, 30);
    const q = query.toLowerCase();
    return employees.filter((e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.employeeId?.toLowerCase().includes(q) ||
      (e.department || '').toLowerCase().includes(q),
    ).slice(0, 30);
  }, [employees, query]);

  async function punch(kind: 'in' | 'out') {
    if (!selected || posting) return;
    setPosting(kind);
    setError('');
    const nowIso = new Date().toISOString();
    const today = nowIso.slice(0, 10);
    const timeStr = nowIso.slice(11, 19); // HH:MM:SS
    try {
      // Best-effort POST. Backend may expect a different shape — we try the most common.
      await api.post('/attendance', {
        employeeId: selected.id,
        date: today,
        [kind === 'in' ? 'timeIn' : 'timeOut']: timeStr,
        source: 'kiosk',
      });
      setLastAction({ kind, employee: selected, at: new Date() });
      setSelected(null);
      setQuery('');
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
        `Could not record clock ${kind === 'in' ? 'in' : 'out'}. The attendance endpoint may need to be enabled on the backend.`
      );
    } finally {
      setPosting(null);
    }
  }

  function goFullscreen() {
    if (typeof document === 'undefined') return;
    if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  }

  // ── Big confirmation screen ──
  if (lastAction) {
    const isIn = lastAction.kind === 'in';
    return (
      <div className={`fixed inset-0 ${isIn ? 'bg-emerald-600' : 'bg-blue-600'} text-white flex items-center justify-center p-8 z-50 animate-fade-in`}>
        <div className="text-center max-w-xl">
          <div className="w-32 h-32 rounded-full bg-white/15 mx-auto flex items-center justify-center mb-6 animate-pulse-ring">
            <CheckCircle2 className="w-20 h-20" />
          </div>
          <div className="text-2xl font-medium mb-2">Welcome{isIn ? '!' : ', see you tomorrow!'}</div>
          <div className="text-5xl sm:text-6xl font-bold tracking-tight mb-3">
            {lastAction.employee.firstName} {lastAction.employee.lastName}
          </div>
          <div className="text-xl text-white/80 mb-6">{lastAction.employee.employeeId} · {lastAction.employee.position || lastAction.employee.department || ''}</div>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/15 text-2xl font-bold tabular-nums">
            <Clock className="w-6 h-6" />
            Clocked {isIn ? 'IN' : 'OUT'} at {lastAction.at.toLocaleTimeString()}
          </div>
          <button
            onClick={() => setLastAction(null)}
            className="block mx-auto mt-8 text-white/70 underline text-sm hover:text-white"
          >
            Tap to dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-nova-900 to-primary-900 text-white p-6 sm:p-10 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 flex-shrink-0">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="text-white/60 hover:text-white text-xs sm:text-sm flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Exit kiosk
        </button>
        <div className="text-center">
          <div className="text-xs sm:text-sm text-white/60 uppercase tracking-wider font-medium">Attendance Kiosk</div>
          <div className="text-3xl sm:text-5xl font-bold tabular-nums mt-1">{now.toLocaleTimeString()}</div>
          <div className="text-sm text-white/60 mt-0.5">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
        </div>
        <button
          type="button"
          onClick={goFullscreen}
          className="text-white/60 hover:text-white text-xs flex items-center gap-1.5"
          title="Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-100 text-sm flex items-start gap-2 max-w-3xl mx-auto w-full">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main panel */}
      <div className="flex-1 max-w-4xl w-full mx-auto flex flex-col">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your name or employee ID…"
            autoFocus
            className="w-full bg-white/10 backdrop-blur-md text-white text-lg sm:text-xl placeholder:text-white/40 pl-14 pr-5 py-4 rounded-2xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15"
          />
        </div>

        {/* Selected employee + actions */}
        {selected ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-8 sm:p-10 w-full max-w-2xl">
              <div className="flex items-center gap-4 sm:gap-5 mb-8">
                <Avatar name={`${selected.firstName} ${selected.lastName}`} size="xl" className="ring-4 ring-white/30 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-2xl sm:text-3xl font-bold text-white truncate">{selected.firstName} {selected.lastName}</div>
                  <div className="text-sm text-white/70 mt-1">{selected.employeeId} · {selected.position || selected.department || '—'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => punch('in')}
                  disabled={posting !== null}
                  className="
                    flex flex-col items-center justify-center gap-3
                    h-32 sm:h-40 rounded-2xl
                    bg-gradient-to-br from-emerald-500 to-emerald-600
                    hover:from-emerald-400 hover:to-emerald-500
                    active:scale-[0.98]
                    text-white shadow-lg shadow-emerald-900/40
                    transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  <LogIn className="w-10 h-10" />
                  <span className="text-2xl font-bold">{posting === 'in' ? 'Clocking In…' : 'Time In'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => punch('out')}
                  disabled={posting !== null}
                  className="
                    flex flex-col items-center justify-center gap-3
                    h-32 sm:h-40 rounded-2xl
                    bg-gradient-to-br from-blue-500 to-blue-600
                    hover:from-blue-400 hover:to-blue-500
                    active:scale-[0.98]
                    text-white shadow-lg shadow-blue-900/40
                    transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  <LogOut className="w-10 h-10" />
                  <span className="text-2xl font-bold">{posting === 'out' ? 'Clocking Out…' : 'Time Out'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setSelected(null); setError(''); }}
                className="block mx-auto mt-6 text-white/60 hover:text-white text-sm"
              >
                Cancel — not me
              </button>
            </div>
          </div>
        ) : (
          // Employee grid
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center text-white/60 py-12">Loading employees…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-white/60 py-12">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No matches{query ? ` for "${query}"` : ''}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filtered.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setSelected(e)}
                    className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-2xl p-4 text-left transition-all hover:-translate-y-0.5"
                  >
                    <Avatar name={`${e.firstName} ${e.lastName}`} size="md" className="mb-3" />
                    <div className="text-sm font-semibold text-white truncate">{e.firstName} {e.lastName}</div>
                    <div className="text-2xs text-white/60 truncate mt-0.5">{e.employeeId}</div>
                    {(e.position || e.department) && (
                      <div className="text-2xs text-white/40 truncate mt-0.5">{e.position || e.department}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer disclaimer */}
      <footer className="mt-6 text-center text-2xs text-white/40 flex-shrink-0">
        NextNova Kiosk · Frontend demo — backend attendance endpoint must accept POST /attendance for real clock-in to persist.
      </footer>
    </div>
  );
}
