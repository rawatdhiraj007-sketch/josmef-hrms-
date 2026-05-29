'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import {
  CalendarCheck, ChevronLeft, ChevronRight, Plus, Settings,
  Sun, Moon, AlertTriangle, Clock,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  code?: string;
  startTime: string;
  endTime: string;
  hoursPerShift: number;
  payMultiplier: number;
  isNightShift: boolean;
  color: string;
  department?: string;
  requiredCertifications?: string[];
}

interface Assignment {
  id: string;
  employeeId: string;
  shiftDate: string;
  status: string;
  shiftType: string;
  shiftTemplate: Template;
  employee: { id: string; firstName: string; lastName: string; employeeId: string; department?: string };
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department?: string;
  position?: string;
}

// Get the Monday of the week containing the given date
function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as start
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ShiftsPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [templates, setTemplates] = useState<Template[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<{ employeeId: string; date: string } | null>(null);

  const weekDays = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  async function load() {
    setLoading(true);
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const [t, e, a] = await Promise.all([
        api.get('/shifts/templates'),
        api.get('/employees', { params: { limit: 500 } }),
        api.get('/shifts', {
          params: { dateFrom: fmt(weekStart), dateTo: fmt(weekEnd) },
        }),
      ]);
      setTemplates(t.data);
      setEmployees(e.data.rows || e.data.data || []);
      setAssignments(a.data);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [weekStart]);

  function getAssignment(employeeId: string, dateStr: string): Assignment | undefined {
    return assignments.find(a => a.employeeId === employeeId && a.shiftDate.startsWith(dateStr));
  }

  function shiftWeek(delta: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  }

  async function quickAssign(employeeId: string, dateStr: string, templateId: string) {
    try {
      const r = await api.post('/shifts/assign', {
        employeeId,
        shiftTemplateId: templateId,
        shiftDate: dateStr,
      });
      if (r.data.errors?.length) {
        alert('Cannot assign:\n' + r.data.errors.join('\n'));
        return;
      }
      if (r.data.warnings?.length) {
        if (!confirm('Warnings:\n' + r.data.warnings.join('\n') + '\n\nAssign anyway?')) return;
        await api.post('/shifts/assign', {
          employeeId,
          shiftTemplateId: templateId,
          shiftDate: dateStr,
          force: true,
        });
      }
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Assign failed');
    }
  }

  async function removeAssignment(id: string) {
    if (!confirm('Remove this shift assignment?')) return;
    await api.delete(`/shifts/${id}`);
    await load();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
            <CalendarCheck className="w-6 h-6 text-primary-600" /> Shift Scheduling
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            24/7 rotating shifts · skill-based · fatigue-aware
          </p>
        </div>
        <a href="/dashboard/shifts/templates" className="btn-secondary">
          <Settings className="w-4 h-4" /> Shift Templates
        </a>
      </div>

      {/* Week navigation */}
      <div className="card p-4 flex items-center justify-between gap-3">
        <button onClick={() => shiftWeek(-1)} className="btn-ghost">
          <ChevronLeft className="w-4 h-4" /> Previous week
        </button>
        <div className="text-center">
          <div className="font-semibold text-surface-900">
            {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} —{' '}
            {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="text-xs text-primary-600 hover:underline">
            Jump to this week
          </button>
        </div>
        <button onClick={() => shiftWeek(1)} className="btn-ghost">
          Next week <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Templates pill bar */}
      {templates.length === 0 ? (
        <div className="card p-6 text-center">
          <Clock className="w-10 h-10 text-surface-300 mx-auto mb-2" />
          <p className="text-surface-700 font-medium mb-1">No shift templates yet</p>
          <p className="text-xs text-surface-500 mb-4">
            Create templates like "Day Shift (7am-3pm)", "Night Shift (11pm-7am)" first
          </p>
          <a href="/dashboard/shifts/templates" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> Create first template
          </a>
        </div>
      ) : (
        <div className="card p-4">
          <div className="text-2xs font-semibold uppercase tracking-wider text-surface-500 mb-2">
            Shift templates (drag onto schedule)
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map(t => (
              <div
                key={t.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-200 hover:border-primary-300 cursor-grab text-sm"
                style={{ background: `${t.color}15`, borderColor: `${t.color}55` }}
                draggable
              >
                {t.isNightShift ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span className="font-semibold" style={{ color: t.color }}>{t.code || t.name}</span>
                <span className="text-xs text-surface-600">{t.startTime.slice(0, 5)}–{t.endTime.slice(0, 5)}</span>
                {t.payMultiplier !== 1 && (
                  <span className="badge-info text-2xs">×{t.payMultiplier}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule grid */}
      {templates.length > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-2xs uppercase tracking-wider text-surface-500 sticky left-0 bg-surface-50 z-10 min-w-56">
                    Employee
                  </th>
                  {weekDays.map(d => {
                    const isToday = fmt(d) === fmt(new Date());
                    return (
                      <th
                        key={d.toISOString()}
                        className={`text-center px-2 py-3 font-semibold text-2xs uppercase tracking-wider min-w-28 ${
                          isToday ? 'bg-primary-50 text-primary-700' : 'text-surface-500'
                        }`}
                      >
                        <div>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className={`text-lg font-bold ${isToday ? 'text-primary-700' : 'text-surface-900'} normal-case mt-0.5`}>
                          {d.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className="py-12 text-center text-surface-400">Loading...</td></tr>
                )}
                {!loading && employees.length === 0 && (
                  <tr><td colSpan={8} className="py-12 text-center text-surface-400">No employees to schedule</td></tr>
                )}
                {employees.slice(0, 50).map(emp => (
                  <tr key={emp.id} className="border-b border-surface-100">
                    <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-surface-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {emp.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-surface-900 truncate">{emp.firstName} {emp.lastName}</div>
                          <div className="text-xs text-surface-500 truncate">{emp.position || emp.department || ''}</div>
                        </div>
                      </div>
                    </td>
                    {weekDays.map(d => {
                      const dateStr = fmt(d);
                      const a = getAssignment(emp.id, dateStr);
                      return (
                        <td key={dateStr} className="p-1 border-r border-surface-50 last:border-r-0">
                          {a ? (
                            <button
                              onClick={() => removeAssignment(a.id)}
                              className="w-full px-2 py-2 rounded-lg text-xs font-semibold transition-all hover:shadow-card text-left"
                              style={{
                                background: `${a.shiftTemplate.color}25`,
                                color: a.shiftTemplate.color,
                                border: `1px solid ${a.shiftTemplate.color}55`,
                              }}
                              title="Click to remove"
                            >
                              {a.shiftTemplate.isNightShift ? '🌙' : '☀️'} {a.shiftTemplate.code || a.shiftTemplate.name.slice(0, 4)}
                              <div className="text-2xs font-normal opacity-70">
                                {a.shiftTemplate.startTime.slice(0, 5)}
                              </div>
                            </button>
                          ) : (
                            <button
                              onClick={() => setAssignModal({ employeeId: emp.id, date: dateStr })}
                              className="w-full px-2 py-2 rounded-lg text-xs text-surface-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            >
                              +
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick-assign modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setAssignModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-surface-900 mb-1">Assign shift</h3>
            <p className="text-xs text-surface-500 mb-4">
              {employees.find(e => e.id === assignModal.employeeId)?.firstName} on{' '}
              {new Date(assignModal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div className="space-y-2">
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={async () => {
                    await quickAssign(assignModal.employeeId, assignModal.date, t.id);
                    setAssignModal(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-surface-200 hover:border-primary-300 hover:bg-surface-50 text-left transition"
                >
                  <div className="w-2 h-10 rounded-full" style={{ background: t.color }} />
                  <div className="flex-1">
                    <div className="font-medium text-surface-900">{t.name}</div>
                    <div className="text-xs text-surface-500">
                      {t.startTime.slice(0, 5)}–{t.endTime.slice(0, 5)} · {t.hoursPerShift}h
                      {t.payMultiplier !== 1 && ` · ×${t.payMultiplier} pay`}
                    </div>
                  </div>
                  {t.requiredCertifications?.length ? (
                    <span className="badge-warning text-2xs">
                      <AlertTriangle className="w-3 h-3" />
                      Cert required
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <button onClick={() => setAssignModal(null)} className="btn-ghost w-full mt-4">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
