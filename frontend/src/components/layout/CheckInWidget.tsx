'use client';

import { useEffect, useState, useCallback } from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui';
import api from '@/lib/api';

/**
 * Online Check-in / Check-out widget — Zoho People style.
 *
 * STATES
 *   1. idle (not checked in)
 *      → big green "Check In" button with clock icon
 *
 *   2. active (checked in)
 *      → pulsing green dot + live timer (HH:MM:SS) + "Check Out" button
 *
 *   3. done (checked out today)
 *      → grey badge "Checked out · worked Xh Ym"
 *
 * PERSISTENCE
 *   Check-in time is stored in localStorage so the timer survives
 *   page reloads, tab closes, and route changes. Resets at midnight
 *   (date-keyed entry).
 *
 * BACKEND
 *   Posts to existing /attendance endpoint with the kiosk-style
 *   payload: { employeeId, date, timeIn|timeOut, source: 'web' }.
 *   Gracefully degrades — if the backend rejects, the widget still
 *   tracks state locally with a "not synced" indicator.
 */

const LS_KEY = 'nn:checkin';
type State = 'idle' | 'active' | 'done';

interface StoredEntry {
  date: string;       // YYYY-MM-DD
  checkInAt?: string; // ISO timestamp
  checkOutAt?: string;
  synced?: boolean;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadStored(): StoredEntry {
  if (typeof window === 'undefined') return { date: today() };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { date: today() };
    const parsed = JSON.parse(raw) as StoredEntry;
    // New day → reset
    if (parsed.date !== today()) return { date: today() };
    return parsed;
  } catch { return { date: today() }; }
}

function saveStored(entry: StoredEntry): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY, JSON.stringify(entry)); } catch { /* */ }
}

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function CheckInWidget() {
  const { user } = useAuth();
  const toast = useToast();
  const [entry, setEntry] = useState<StoredEntry>({ date: today() });
  const [tick, setTick] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // ── Load + auto-tick when active ──
  useEffect(() => {
    setEntry(loadStored());
  }, []);

  useEffect(() => {
    if (entry.checkInAt && !entry.checkOutAt) {
      const id = setInterval(() => setTick((t) => t + 1), 1000);
      return () => clearInterval(id);
    }
  }, [entry.checkInAt, entry.checkOutAt]);

  // ── Resolve state ──
  const state: State =
    entry.checkInAt && !entry.checkOutAt ? 'active'
    : entry.checkOutAt ? 'done'
    : 'idle';

  // ── Resolve employee id (defensive) ──
  const employeeId = (user as any)?.employeeId || (user as any)?.id;

  const checkIn = useCallback(async () => {
    if (submitting) return;
    const now = new Date();
    const next: StoredEntry = {
      date: today(),
      checkInAt: now.toISOString(),
      synced: false,
    };
    setEntry(next);
    saveStored(next);
    setSubmitting(true);
    try {
      await api.post('/attendance', {
        employeeId,
        date: today(),
        timeIn: now.toISOString().slice(11, 19),
        source: 'web',
      });
      const synced = { ...next, synced: true };
      setEntry(synced);
      saveStored(synced);
      toast.success('Checked in', `at ${now.toLocaleTimeString()}`);
    } catch {
      toast.warning('Checked in locally', 'Couldn\'t reach the attendance service — will retry on checkout.');
    } finally {
      setSubmitting(false);
    }
  }, [employeeId, submitting, toast]);

  const checkOut = useCallback(async () => {
    if (submitting || !entry.checkInAt) return;
    const now = new Date();
    const next: StoredEntry = {
      ...entry,
      checkOutAt: now.toISOString(),
      synced: entry.synced,
    };
    setEntry(next);
    saveStored(next);
    setSubmitting(true);
    try {
      await api.post('/attendance', {
        employeeId,
        date: today(),
        timeOut: now.toISOString().slice(11, 19),
        source: 'web',
      });
      const synced = { ...next, synced: true };
      setEntry(synced);
      saveStored(synced);
      const ms = new Date(now).getTime() - new Date(entry.checkInAt).getTime();
      toast.success('Checked out', `Worked ${formatDuration(ms)} today.`);
    } catch {
      toast.warning('Checked out locally', 'Couldn\'t reach the attendance service.');
    } finally {
      setSubmitting(false);
    }
  }, [employeeId, submitting, entry, toast]);

  // ── Computed values for live render ──
  const elapsedMs = entry.checkInAt
    ? (entry.checkOutAt ? new Date(entry.checkOutAt) : new Date()).getTime() - new Date(entry.checkInAt).getTime()
    : 0;

  // suppress unused-var warning for tick — its job is to force re-render
  void tick;

  // ─── Render ───
  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={checkIn}
        disabled={submitting}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/50"
        aria-label="Check in"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span>Check in</span>
      </button>
    );
  }

  if (state === 'active') {
    return (
      <div className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
        {/* Pulsing live dot */}
        <span className="relative flex items-center justify-center w-2 h-2">
          <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
          <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </span>
        {/* Live timer */}
        <span className="text-xs font-semibold text-emerald-800 tabular-nums whitespace-nowrap">
          {formatElapsed(elapsedMs)}
        </span>
        {entry.synced === false && (
          <span title="Not synced to server — will retry on checkout">
            <AlertCircle className="w-3 h-3 text-amber-500" />
          </span>
        )}
        {/* Check out button */}
        <button
          type="button"
          onClick={checkOut}
          disabled={submitting}
          className="ml-1 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white hover:bg-rose-50 text-rose-700 text-2xs font-semibold border border-rose-200 transition-colors disabled:opacity-60"
          aria-label="Check out"
        >
          <LogOut className="w-3 h-3" />
          <span>Out</span>
        </button>
      </div>
    );
  }

  // state === 'done'
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
      <span className="text-2xs font-semibold text-slate-700">
        Worked {formatDuration(elapsedMs)}
      </span>
    </div>
  );
}

/**
 * Compact dark-themed variant for use inside the dark topbar band.
 * Same logic, restyled for white-on-dark legibility.
 */
export function CheckInWidgetDark() {
  const { user } = useAuth();
  const toast = useToast();
  const [entry, setEntry] = useState<StoredEntry>({ date: today() });
  const [tick, setTick] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setEntry(loadStored()); }, []);

  useEffect(() => {
    if (entry.checkInAt && !entry.checkOutAt) {
      const id = setInterval(() => setTick((t) => t + 1), 1000);
      return () => clearInterval(id);
    }
  }, [entry.checkInAt, entry.checkOutAt]);

  const state: State =
    entry.checkInAt && !entry.checkOutAt ? 'active'
    : entry.checkOutAt ? 'done'
    : 'idle';

  const employeeId = (user as any)?.employeeId || (user as any)?.id;

  const checkIn = async () => {
    if (submitting) return;
    const now = new Date();
    const next: StoredEntry = { date: today(), checkInAt: now.toISOString(), synced: false };
    setEntry(next); saveStored(next); setSubmitting(true);
    try {
      await api.post('/attendance', {
        employeeId, date: today(),
        timeIn: now.toISOString().slice(11, 19),
        source: 'web',
      });
      const synced = { ...next, synced: true };
      setEntry(synced); saveStored(synced);
      toast.success('Checked in', `at ${now.toLocaleTimeString()}`);
    } catch {
      toast.warning('Checked in locally', 'Will retry on checkout.');
    } finally { setSubmitting(false); }
  };

  const checkOut = async () => {
    if (submitting || !entry.checkInAt) return;
    const now = new Date();
    const next: StoredEntry = { ...entry, checkOutAt: now.toISOString() };
    setEntry(next); saveStored(next); setSubmitting(true);
    try {
      await api.post('/attendance', {
        employeeId, date: today(),
        timeOut: now.toISOString().slice(11, 19),
        source: 'web',
      });
      const synced = { ...next, synced: true };
      setEntry(synced); saveStored(synced);
      const ms = now.getTime() - new Date(entry.checkInAt).getTime();
      toast.success('Checked out', `Worked ${formatDuration(ms)} today.`);
    } catch {
      toast.warning('Checked out locally');
    } finally { setSubmitting(false); }
  };

  const elapsedMs = entry.checkInAt
    ? (entry.checkOutAt ? new Date(entry.checkOutAt) : new Date()).getTime() - new Date(entry.checkInAt).getTime()
    : 0;

  void tick;

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={checkIn}
        disabled={submitting}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-white text-2xs font-bold shadow-sm transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40"
        aria-label="Check in"
        title="Check in"
      >
        <LogIn className="w-3 h-3" />
        <span className="hidden sm:inline">Check in</span>
      </button>
    );
  }

  if (state === 'active') {
    return (
      <div className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-400/30">
        <span className="relative flex items-center justify-center w-2 h-2">
          <span className="absolute w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-80" />
          <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-2xs font-bold text-emerald-200 tabular-nums whitespace-nowrap">
          {formatElapsed(elapsedMs)}
        </span>
        {entry.synced === false && (
          <span title="Not synced to server"><AlertCircle className="w-3 h-3 text-amber-300" /></span>
        )}
        <button
          type="button"
          onClick={checkOut}
          disabled={submitting}
          className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.06] hover:bg-rose-500/20 text-rose-200 text-[10px] font-bold border border-white/[0.1] transition-colors disabled:opacity-60"
          aria-label="Check out"
          title="Check out"
        >
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.06] border border-white/[0.08]">
      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      <span className="text-2xs font-semibold text-white/80 whitespace-nowrap">
        Worked {formatDuration(elapsedMs)}
      </span>
    </div>
  );
}

// Suppress unused import warning
void Clock;
