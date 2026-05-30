'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Plane, ShieldAlert, Trash2, Info } from 'lucide-react';

import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { FormSection, FormGrid, FormActions } from '@/components/form';
import type { SaveState } from '@/components/form';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { validate, required as req, Errors } from '@/lib/validation';

interface Employee { id: string; firstName: string; lastName: string; employeeId: string }
interface LeaveType { id: string; code: string; name: string; annualEntitlement: number }
interface Balance { leaveType: LeaveType; entitled: number; used: number; pending: number; remaining: number }

type FormShape = {
  employeeId: string; leaveTypeId: string;
  startDate: string; endDate: string; reason: string;
};

const initial: FormShape = {
  employeeId: '', leaveTypeId: '', startDate: '', endDate: '', reason: '',
};

export default function NewLeavePage() {
  const router = useRouter();
  const toast = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);

  const draftKey = 'nn:draft:leaveRequest:new';
  const {
    values: form, setValues, setField, clearDraft, hasDraft, isDirty, lastSavedAt,
  } = useFormDraft<FormShape>({ key: draftKey, initial });

  const [submitting, setSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState<Errors<FormShape>>({});

  useUnsavedChangesWarning(isDirty && !submitting);

  function set<K extends keyof FormShape>(k: K, v: FormShape[K]) {
    setField(k, v);
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  useEffect(() => {
    api.get('/employees', { params: { limit: 500 } }).then((r) => setEmployees(r.data.rows || r.data));
    api.get('/leave/types').then((r) => setTypes(r.data));
  }, []);

  useEffect(() => {
    if (form.employeeId) {
      api.get(`/leave/balances/${form.employeeId}`).then((r) => setBalances(r.data)).catch(() => setBalances([]));
    } else {
      setBalances([]);
    }
  }, [form.employeeId]);

  const daysRequested = (() => {
    if (!form.startDate || !form.endDate) return 0;
    const s = new Date(form.startDate);
    const e = new Date(form.endDate);
    if (e < s) return 0;
    return Math.floor((e.getTime() - s.getTime()) / 86400000) + 1;
  })();

  const selectedBalance = balances.find((b) => b.leaveType.id === form.leaveTypeId);
  const exceedsBalance = !!(selectedBalance && daysRequested > selectedBalance.remaining);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const errs = validate(form, {
      employeeId:  [req('Select an employee')],
      leaveTypeId: [req('Select a leave type')],
      startDate:   [req()],
      endDate:     [req()],
      reason:      [req('Please describe the reason')],
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Check the highlighted fields');
      return;
    }

    setSubmitting(true);
    setSaveState('saving');
    try {
      await api.post('/leave/requests', form);
      clearDraft();
      setSaveState('saved');
      toast.success('Leave request submitted');
      router.push('/dashboard/leave');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to submit request';
      setServerError(message);
      setSaveState('error');
      toast.error('Submission failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    router.push('/dashboard/leave');
  }

  function handleResetDraft() {
    if (!window.confirm('Discard the auto-saved draft?')) return;
    clearDraft();
    setValues(initial);
    setErrors({});
  }

  return (
    <div className="max-w-3xl space-y-5 pb-20">
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => router.back()}
          className="text-sm text-surface-500 hover:text-surface-900 flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Leave Management
        </button>
        {hasDraft && (
          <Button type="button" variant="ghost" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleResetDraft}>
            Discard draft
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
          <Plane className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">File Leave Request</h1>
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <FormSection title="Request" description="Who, what, and when">
          <Select label="Employee" required value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)} error={errors.employeeId}>
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>
            ))}
          </Select>

          {balances.length > 0 && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-primary-50/60 border border-primary-200/60">
              <div className="text-2xs font-bold text-primary-900 uppercase tracking-wider mb-2">Available Balances ({new Date().getFullYear()})</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {balances.map((b) => (
                  <div key={b.leaveType.id} className="bg-white rounded-lg p-2 text-center border border-primary-100">
                    <div className="text-2xs text-surface-500">{b.leaveType.code}</div>
                    <div className="font-bold text-primary-700 tabular-nums">{b.remaining}</div>
                    <div className="text-2xs text-surface-400">of {b.entitled}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <Select label="Leave Type" required value={form.leaveTypeId} onChange={(e) => set('leaveTypeId', e.target.value)} error={errors.leaveTypeId}>
              <option value="">Select leave type</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.code} — {t.name}</option>)}
            </Select>
          </div>

          <FormGrid cols={2} className="mt-4">
            <Input type="date" label="Start Date" required value={form.startDate} onChange={(e) => set('startDate', e.target.value)} error={errors.startDate} />
            <Input type="date" label="End Date"   required value={form.endDate}   onChange={(e) => set('endDate',   e.target.value)} error={errors.endDate} />
          </FormGrid>

          {daysRequested > 0 && selectedBalance && (
            <div className={`mt-4 text-sm p-3 rounded-xl border flex items-start gap-2 ${
              exceedsBalance
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                Requesting <strong>{daysRequested} day{daysRequested > 1 ? 's' : ''}</strong>
                {' '}— Remaining: <strong className="tabular-nums">{selectedBalance.remaining}</strong>
                {exceedsBalance && ' — Exceeds balance.'}
              </div>
            </div>
          )}

          <div className="mt-4">
            <Textarea label="Reason" required rows={4} placeholder="Describe the reason for this leave request…" value={form.reason} onChange={(e) => set('reason', e.target.value)} error={errors.reason} />
          </div>
        </FormSection>

        <FormActions
          saveState={saveState}
          lastSavedAt={lastSavedAt}
          dirty={isDirty && saveState !== 'saving'}
          onCancel={handleCancel}
          submitting={submitting}
          submitLabel="Submit Request"
        />
      </form>
    </div>
  );
}
