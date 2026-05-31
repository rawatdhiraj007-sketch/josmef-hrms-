'use client';

import { useEffect, useState } from 'react';
import {
  UserPlus, ShieldCheck, Plane, DollarSign, GraduationCap,
  AlertCircle, CheckCircle2, FileText, Sparkles,
} from 'lucide-react';

interface Event {
  id: string;
  icon: any;
  text: string;
  who?: string;
  tone: 'success' | 'info' | 'warning' | 'brand';
}

const SEED: Omit<Event, 'id'>[] = [
  { icon: UserPlus,       tone: 'success', text: 'New hire onboarded',         who: 'Maria Cruz · RN' },
  { icon: Plane,          tone: 'warning', text: 'Leave request submitted',    who: 'James Reyes' },
  { icon: ShieldCheck,    tone: 'info',    text: 'PRC license renewed',        who: 'Patricia Tan' },
  { icon: DollarSign,     tone: 'success', text: 'Payroll run released',       who: 'May 15–31 · 242 employees' },
  { icon: GraduationCap,  tone: 'brand',   text: 'Training completed',         who: 'BLS · ICU team' },
  { icon: AlertCircle,    tone: 'warning', text: 'License expiring in 7 days', who: 'Antonio Lopez · MD' },
  { icon: CheckCircle2,   tone: 'success', text: 'Exit clearance approved',    who: 'Sofia Mendoza' },
  { icon: FileText,       tone: 'info',    text: 'Certificate generated',      who: 'COE · Maria Cruz' },
  { icon: Sparkles,       tone: 'brand',   text: 'AI insight surfaced',        who: 'Attendance dip in Pharmacy' },
  { icon: UserPlus,       tone: 'success', text: 'Applicant moved to interview', who: 'Anna Lim · Pharmacist' },
];

const TONE_BG: Record<Event['tone'], string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  info:    'bg-blue-50    text-blue-700    ring-blue-200',
  warning: 'bg-amber-50   text-amber-700   ring-amber-200',
  brand:   'bg-primary-50 text-primary-700 ring-primary-200',
};

/**
 * Auto-updating activity feed mounted on the landing page.
 *
 * Visual demo only — no API calls. Events cycle every 3.2s from a
 * pre-defined SEED list. Each new event slides in at the top, the
 * oldest slides out the bottom. Honors prefers-reduced-motion (the
 * keyframes are no-op'd globally for that preference).
 */
export default function LiveActivityFeed() {
  const [events, setEvents] = useState<Event[]>(() =>
    SEED.slice(0, 4).map((e, i) => ({ ...e, id: `seed-${i}` })),
  );
  const [cursor, setCursor] = useState(4);

  useEffect(() => {
    const t = setInterval(() => {
      setCursor((c) => {
        const next = (c + 1) % SEED.length;
        setEvents((evs) => {
          const newEvent: Event = { ...SEED[c % SEED.length], id: `e-${Date.now()}-${c}` };
          return [newEvent, ...evs].slice(0, 4);
        });
        return next;
      });
    }, 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="relative flex items-center justify-center w-2 h-2">
            <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-sm font-semibold text-slate-900">Live activity</span>
        </div>
        <span className="text-2xs text-slate-500">Real-time across your workspace</span>
      </div>

      {/* Feed */}
      <ul className="divide-y divide-slate-100">
        {events.map((e, idx) => {
          const Icon = e.icon;
          return (
            <li
              key={e.id}
              className="px-4 py-3 flex items-start gap-3"
              style={{ animation: 'nn-feed-in 0.45s ease-out' }}
            >
              <span className={`w-8 h-8 rounded-lg ring-1 flex items-center justify-center flex-shrink-0 ${TONE_BG[e.tone]}`}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-slate-900 font-medium">{e.text}</div>
                {e.who && <div className="text-2xs text-slate-500 mt-0.5">{e.who}</div>}
              </div>
              <span className="text-2xs text-slate-400 tabular-nums flex-shrink-0 mt-0.5">
                {idx === 0 ? 'just now' : `${idx * 3}s`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
