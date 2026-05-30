'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import {
  CalendarCheck, ChevronLeft, ChevronRight, Plus, Settings,
  Sun, Moon, AlertTriangle, Clock, Copy, Trash2, Search, Users, Loader2,
} from 'lucide-react';

import { Button, Badge, Card, Modal, useToast } from '@/components/ui';
import { PageHeader, FilterSelect } from '@/components/data';

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

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ShiftsPage() {
  const toast = useToast();

  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [templates, setTemplates] = useState<Template[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [assignModal, setAssignModal] = useState<{ employeeId: string; date: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<Assignment | null>(null);
  const [confirmCopy, setConfirmCopy] = useState(false);
  const [copying, setCopying] = useState(false);

  const weekDays = useMemo(() => (
    [...Array(7)].map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    })
  ), [weekStart]);

  async function load() {
    setLoading(true);
    try {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const [t, e, a] = await Promise.all([
        api.get('/shifts/templates').catch(() => ({ data: [] })),
        api.get('/employees', { params: { limit: 500 } }),
        api.get('/shifts', { params: { dateFrom: fmt(weekStart), dateTo: fmt(weekEnd) } }).catch(() => ({ data: [] })),
      ]);
      setTemplates(t.data || []);
      setEmployees(e.data.rows || e.data.data || []);
      setAssignments(a.data || []);
    } catch {
      toast.error('Failed to load shifts');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [weekStart]);

  function getAssignment(employeeId: string, dateStr: string): Assignment | undefined {
    return assignments.find((a) => a.employeeId === employeeId && a.shiftDate.startsWith(dateStr));
  }

  function shiftWeek(delta: number) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + delta * 7);
    setWeekStart(d);
  }

  async function quickAssign(employeeId: string, dateStr: string, templateId: string) {
    try {
      const r = await api.post('/shifts/assign', { employeeId, shiftTemplateId: templateId, shiftDate: dateStr });
      if (r.data.errors?.length) {
        toast.error('Cannot assign', r.data.errors.join(' · '));
        return;
      }
      if (r.data.warnings?.length) {
        const ok = window.confirm(`Warnings:\n${r.data.warnings.join('\n')}\n\nAssign anyway?`);
        if (!ok) return;
        await api.post('/shifts/assign', { employeeId, shiftTemplateId: templateId, shiftDate: dateStr, force: true });
      }
      toast.success('Shift assigned');
      await load();
    } catch (e: any) {
      toast.error('Assign failed', e?.response?.data?.message || 'Please try again.');
    }
  }

  async function removeAssignment(id: string) {
    try {
      await api.delete(`/shifts/${id}`);
      toast.success('Shift removed');
      await load();
    } catch {
      toast.error('Failed to remove shift');
    }
  }

  // ── Copy from previous week ──
  async function copyPreviousWeek() {
    setCopying(true);
    try {
      const prevStart = new Date(weekStart);
      prevStart.setDate(prevStart.getDate() - 7);
      const prevEnd = new Date(prevStart);
      prevEnd.setDate(prevEnd.getDate() + 6);
      const r = await api.get('/shifts', { params: { dateFrom: fmt(prevStart), dateTo: fmt(prevEnd) } });
      const prevAssignments: Assignment[] = r.data || [];
      if (prevAssignments.length === 0) {
        toast.warning('Previous week is empty', 'Nothing to copy.');
        setConfirmCopy(false);
        return;
      }
      let assigned = 0, failed = 0;
      for (const a of prevAssignments) {
        // shift each assignment by 7 days
        const oldDate = new Date(a.shiftDate);
        oldDate.setDate(oldDate.getDate() + 7);
        try {
          await api.post('/shifts/assign', {
            employeeId: a.employeeId,
            shiftTemplateId: a.shiftTemplate?.id,
            shiftDate: fmt(oldDate),
            force: true,
          });
          assigned++;
        } catch { failed++; }
      }
      toast.success(`Copied ${assigned} shift${assigned === 1 ? '' : 's'}`, failed > 0 ? `${failed} skipped (conflicts).` : 'From previous week.');
      setConfirmCopy(false);
      await load();
    } catch {
      toast.error('Copy failed');
    } finally {
      setCopying(false);
    }
  }

  // ── Filter employees ──
  const filteredEmployees = useMemo(() => employees.filter((e) => {
    if (deptFilter && e.department !== deptFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (e.firstName || '').toLowerCase().includes(q) ||
      (e.lastName  || '').toLowerCase().includes(q) ||
      (e.employeeId || '').toLowerCase().includes(q) ||
      (e.position   || '').toLowerCase().includes(q)
    );
  }), [employees, search, deptFilter]);

  const departments = useMemo(() => {
    const s = new Set<string>();
    employees.forEach((e) => { if (e.department) s.add(e.department); });
    return Array.from(s).sort();
  }, [employees]);

  // ── Stats for this week ──
  const totalAssignments = assignments.length;
  const employeesScheduled = new Set(assignments.map((a) => a.employeeId)).size;
  const nightShifts = assignments.filter((a) => a.shiftTemplate?.isNightShift).length;

  return (
    <div className="space-y-5 pb-12">
      <PageHeader
        icon={CalendarCheck}
        title="Shift Scheduling"
        subtitle="24/7 rotating shifts · skill-based · fatigue-aware"
        actions={
          <>
            <Button
              variant="secondary" size="sm"
              leftIcon={<Copy className="w-3.5 h-3.5" />}
              onClick={() => setConfirmCopy(true)}
              disabled={templates.length === 0}
            >
              Copy previous week
            </Button>
            <Button
              variant="secondary" size="sm"
              leftIcon={<Settings className="w-3.5 h-3.5" />}
              onClick={() => window.location.assign('/dashboard/shifts/templates')}
            >
              Templates
            </Button>
          </>
        }
      />

      {/* Week navigation */}
      <Card padding="sm">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" leftIcon={<ChevronLeft className="w-3.5 h-3.5" />} onClick={() => shiftWeek(-1)}>
            Previous
          </Button>
          <div className="text-center">
            <div className="text-sm font-semibold text-surface-900">
              {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} —{' '}
              {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="text-2xs text-primary-700 hover:underline mt-0.5">
              Jump to this week
            </button>
          </div>
          <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />} onClick={() => shiftWeek(1)}>
            Next
          </Button>
        </div>
      </Card>

      {/* Week stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Shifts scheduled"   value={totalAssignments} icon={CalendarCheck} />
        <Stat label="Employees on duty"  value={employeesScheduled} icon={Users} />
        <Stat label="Night shifts"       value={nightShifts} icon={Moon} />
      </div>

      {/* Templates pill bar */}
      {templates.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Clock className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-surface-700 mb-1">No shift templates yet</p>
            <p className="text-xs text-surface-500 mb-4">
              Create templates like "Day Shift (7am-3pm)", "Night Shift (11pm-7am)" first
            </p>
            <Button
              variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => window.location.assign('/dashboard/shifts/templates')}
            >
              Create first template
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="sm">
          <div className="text-2xs font-semibold uppercase tracking-wider text-surface-500 mb-2 px-1">
            Shift templates
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs"
                style={{ background: `${t.color}15`, borderColor: `${t.color}55` }}
              >
                {t.isNightShift ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                <span className="font-semibold" style={{ color: t.color }}>{t.code || t.name}</span>
                <span className="text-2xs text-surface-600">{t.startTime.slice(0, 5)}–{t.endTime.slice(0, 5)}</span>
                {t.payMultiplier !== 1 && (
                  <Badge variant="info" size="sm">×{t.payMultiplier}</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      {templates.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-white border border-surface-200 shadow-card">
          <div className="flex items-center gap-2 bg-surface-50 hover:bg-white border border-transparent hover:border-surface-200 rounded-lg px-3 py-1.5 flex-1 min-w-64 transition-all focus-within:bg-white focus-within:border-primary-300 focus-within:shadow-soft">
            <Search className="w-3.5 h-3.5 text-surface-400 flex-shrink-0" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or position…"
              className="bg-transparent text-sm flex-1 outline-none placeholder:text-surface-400 min-w-0"
            />
          </div>
          {departments.length > 0 && (
            <FilterSelect value={deptFilter} onChange={setDeptFilter} ariaLabel="Filter by department">
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </FilterSelect>
          )}
        </div>
      )}

      {/* Schedule grid */}
      {templates.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50/70 border-b border-surface-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-2xs uppercase tracking-wider text-surface-500 sticky left-0 bg-surface-50 z-10 min-w-56">
                    Employee
                  </th>
                  {weekDays.map((d) => {
                    const isToday = fmt(d) === fmt(new Date());
                    return (
                      <th key={d.toISOString()}
                        className={`text-center px-2 py-3 font-semibold text-2xs uppercase tracking-wider min-w-28 ${
                          isToday ? 'bg-primary-50 text-primary-700' : 'text-surface-500'
                        }`}
                      >
                        <div>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className={`text-lg font-bold normal-case mt-0.5 ${isToday ? 'text-primary-700' : 'text-surface-900'}`}>
                          {d.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-16">
                    <span className="inline-flex items-center gap-2 text-surface-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </span>
                  </td></tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-sm text-surface-500">
                    {employees.length === 0 ? 'No employees to schedule' : 'No employees match your filters.'}
                  </td></tr>
                ) : filteredEmployees.slice(0, 100).map((emp) => (
                  <tr key={emp.id} className="border-b border-surface-100 last:border-0">
                    <td className="px-4 py-2.5 sticky left-0 bg-white z-10 border-r border-surface-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {emp.firstName?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-surface-900 truncate text-xs">{emp.firstName} {emp.lastName}</div>
                          <div className="text-2xs text-surface-500 truncate">{emp.position || emp.department || ''}</div>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((d) => {
                      const dateStr = fmt(d);
                      const a = getAssignment(emp.id, dateStr);
                      return (
                        <td key={dateStr} className="p-1 border-r border-surface-50 last:border-r-0">
                          {a ? (
                            <button
                              onClick={() => setConfirmRemove(a)}
                              className="w-full px-2 py-1.5 rounded-lg text-2xs font-semibold transition-all hover:shadow-card text-left"
                              style={{
                                background: `${a.shiftTemplate.color}25`,
                                color: a.shiftTemplate.color,
                                border: `1px solid ${a.shiftTemplate.color}55`,
                              }}
                              title="Click to remove"
                            >
                              <div className="flex items-center gap-1">
                                {a.shiftTemplate.isNightShift ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                                <span>{a.shiftTemplate.code || a.shiftTemplate.name.slice(0, 4)}</span>
                              </div>
                              <div className="text-2xs font-normal opacity-70 mt-0.5">
                                {a.shiftTemplate.startTime.slice(0, 5)}
                              </div>
                            </button>
                          ) : (
                            <button
                              onClick={() => setAssignModal({ employeeId: emp.id, date: dateStr })}
                              className="w-full px-2 py-2 rounded-lg text-xs text-surface-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                              aria-label={`Assign shift to ${emp.firstName} on ${dateStr}`}
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
            {filteredEmployees.length > 100 && (
              <div className="px-4 py-2 text-2xs text-surface-500 text-center">
                Showing first 100 of {filteredEmployees.length}. Use filters to narrow down.
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Assign modal */}
      <Modal
        open={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Assign Shift"
        description={
          assignModal
            ? `${employees.find((e) => e.id === assignModal.employeeId)?.firstName} on ${new Date(assignModal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
            : ''
        }
        size="md"
      >
        <div className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id} type="button"
              onClick={async () => { if (assignModal) { await quickAssign(assignModal.employeeId, assignModal.date, t.id); setAssignModal(null); } }}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-surface-50/60 text-left transition-all"
            >
              <div className="w-2 h-10 rounded-full" style={{ background: t.color }} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-surface-900 text-sm">{t.name}</div>
                <div className="text-2xs text-surface-500 tabular-nums">
                  {t.startTime.slice(0, 5)}–{t.endTime.slice(0, 5)} · {t.hoursPerShift}h
                  {t.payMultiplier !== 1 && ` · ×${t.payMultiplier} pay`}
                </div>
              </div>
              {t.requiredCertifications?.length ? (
                <Badge variant="warning" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
                  Cert
                </Badge>
              ) : null}
            </button>
          ))}
        </div>
      </Modal>

      {/* Remove confirmation */}
      <Modal
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        title="Remove this shift?"
        description={
          confirmRemove
            ? `${confirmRemove.employee?.firstName} ${confirmRemove.employee?.lastName} · ${confirmRemove.shiftTemplate?.name} · ${new Date(confirmRemove.shiftDate).toLocaleDateString()}`
            : ''
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(null)}>Cancel</Button>
            <Button
              variant="danger" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={async () => { if (confirmRemove) { await removeAssignment(confirmRemove.id); setConfirmRemove(null); } }}
            >
              Remove
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-700">This will free up the employee for that day. You can re-assign them later.</p>
      </Modal>

      {/* Copy week confirmation */}
      <Modal
        open={confirmCopy}
        onClose={() => setConfirmCopy(false)}
        title="Copy previous week"
        description="Copy all shifts from the previous week into this week."
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmCopy(false)}>Cancel</Button>
            <Button variant="primary" size="sm" leftIcon={<Copy className="w-3.5 h-3.5" />} onClick={copyPreviousWeek} loading={copying}>
              {copying ? 'Copying…' : 'Copy week'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-700">
          Existing assignments in this week stay in place. Conflicts will be skipped.
          The previous week's shifts shift forward by 7 days.
        </p>
      </Modal>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">{label}</div>
          <div className="text-2xl font-bold text-surface-900 tabular-nums mt-1">{value}</div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 text-primary-600 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
