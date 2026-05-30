'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { SeparationType } from '@/types/exit-clearance';
import { ArrowLeft, Search, UserMinus, ShieldAlert, Trash2 } from 'lucide-react';

import { Button, Input, Select, Textarea, Badge, useToast } from '@/components/ui';
import { FormSection, FormGrid, FormActions } from '@/components/form';
import type { SaveState } from '@/components/form';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { validate, required as req, Errors } from '@/lib/validation';

type FormShape = {
  employeeId: string; separationType: string;
  lastWorkingDay: string; resignationDate: string; effectiveDate: string;
  reason: string; remarks: string;
};

const initial: FormShape = {
  employeeId: '', separationType: 'resignation',
  lastWorkingDay: '', resignationDate: new Date().toISOString().split('T')[0],
  effectiveDate: '', reason: '', remarks: '',
};

export default function NewExitClearancePage() {
  const router = useRouter();
  const toast = useToast();

  const draftKey = 'nn:draft:exitClearance:new';
  const {
    values: form, setValues, setField, clearDraft, hasDraft, isDirty, lastSavedAt,
  } = useFormDraft<FormShape>({ key: draftKey, initial });

  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

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
    if (search.length >= 2) {
      api.get('/employees', { params: { search, limit: 10, employmentStatus: 'regular' } })
        .then((res) => setEmployees(res.data.data))
        .catch(() => {});
    } else {
      setEmployees([]);
    }
  }, [search]);

  function selectEmployee(emp: any) {
    setSelectedEmp(emp);
    set('employeeId', emp.id);
    setSearch('');
    setEmployees([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const errs = validate(form, {
      employeeId:     [req('Select an employee')],
      separationType: [req()],
      lastWorkingDay: [req('Last working day is required')],
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) { toast.error('Check the highlighted fields'); return; }

    setSubmitting(true);
    setSaveState('saving');
    try {
      await api.post('/exit-clearance', form);
      clearDraft();
      setSaveState('saved');
      toast.success('Exit clearance created');
      router.push('/dashboard/exit-clearance');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const message = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed';
      setServerError(message);
      setSaveState('error');
      toast.error('Failed to create', message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    router.push('/dashboard/exit-clearance');
  }

  function handleResetDraft() {
    if (!window.confirm('Discard the auto-saved draft?')) return;
    clearDraft();
    setValues(initial);
    setSelectedEmp(null);
    setErrors({});
  }

  return (
    <div className="space-y-5 pb-20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors"
            aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-surface-900">New Exit Clearance</h1>
        </div>
        {hasDraft && (
          <Button type="button" variant="ghost" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleResetDraft}>
            Discard draft
          </Button>
        )}
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Select Employee" description="Search by name or ID — only regular employees can be cleared" icon={UserMinus}>
          {selectedEmp ? (
            <div className="flex items-center justify-between p-4 bg-primary-50/60 border border-primary-200/60 rounded-xl">
              <div>
                <p className="font-medium text-surface-900">{selectedEmp.lastName}, {selectedEmp.firstName}</p>
                <div className="flex items-center gap-2 text-xs text-surface-500 mt-0.5">
                  <Badge variant="brand" size="sm">{selectedEmp.employeeId}</Badge>
                  <span>{selectedEmp.position} · {selectedEmp.department}</span>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedEmp(null); set('employeeId', ''); }}>
                Change
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Input
                placeholder="Search employee by name or ID…"
                leftIcon={<Search className="w-4 h-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                error={errors.employeeId}
              />
              {employees.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-card-hover z-10 max-h-60 overflow-y-auto">
                  {employees.map((emp) => (
                    <button
                      key={emp.id} type="button" onClick={() => selectEmployee(emp)}
                      className="w-full text-left px-4 py-3 hover:bg-surface-50 border-b border-surface-100 last:border-0"
                    >
                      <p className="font-medium text-surface-900">{emp.lastName}, {emp.firstName}</p>
                      <p className="text-xs text-surface-500">{emp.employeeId} — {emp.position}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </FormSection>

        <FormSection title="Separation Details">
          <FormGrid cols={3}>
            <Select label="Separation Type" required value={form.separationType} onChange={(e) => set('separationType', e.target.value)}>
              {Object.values(SeparationType).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </Select>
            <Input type="date" label="Resignation Date" value={form.resignationDate} onChange={(e) => set('resignationDate', e.target.value)} />
            <Input type="date" label="Last Working Day" required value={form.lastWorkingDay} onChange={(e) => set('lastWorkingDay', e.target.value)} error={errors.lastWorkingDay} />
            <Input type="date" label="Effective Date"            value={form.effectiveDate} onChange={(e) => set('effectiveDate', e.target.value)} />
          </FormGrid>
          <div className="mt-4">
            <Textarea label="Reason" rows={3} placeholder="Reason for separation…" value={form.reason} onChange={(e) => set('reason', e.target.value)} />
          </div>
        </FormSection>

        <FormActions
          saveState={saveState}
          lastSavedAt={lastSavedAt}
          dirty={isDirty && saveState !== 'saving'}
          onCancel={handleCancel}
          submitting={submitting}
          submitLabel="Create Clearance"
        />
      </form>
    </div>
  );
}
