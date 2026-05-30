'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Briefcase, ShieldAlert, Trash2 } from 'lucide-react';

import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { FormSection, FormGrid, FormActions } from '@/components/form';
import type { SaveState } from '@/components/form';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { validate, required as req, Errors } from '@/lib/validation';

type FormShape = {
  title: string; department: string; location: string; employmentType: string;
  description: string; salaryMin: string; salaryMax: string;
  numberOfOpenings: string; closingDate: string;
};

const initial: FormShape = {
  title: '', department: '', location: 'Manila, Philippines',
  employmentType: 'full_time', description: '',
  salaryMin: '', salaryMax: '', numberOfOpenings: '1', closingDate: '',
};

export default function NewJobPage() {
  const router = useRouter();
  const toast = useToast();

  const draftKey = 'nn:draft:job:new';
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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const errs = validate(form, { title: [req()] });
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Title is required');
      return;
    }

    setSubmitting(true);
    setSaveState('saving');
    try {
      const body: any = { ...form, isActive: true };
      if (form.salaryMin) body.salaryMin = Number(form.salaryMin);
      if (form.salaryMax) body.salaryMax = Number(form.salaryMax);
      body.numberOfOpenings = Number(form.numberOfOpenings) || 1;
      if (!form.closingDate) delete body.closingDate;
      await api.post('/jobs', body);
      clearDraft();
      setSaveState('saved');
      toast.success('Job posted');
      router.push('/dashboard/jobs');
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to create job';
      setServerError(message);
      setSaveState('error');
      toast.error('Failed to post', message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    router.push('/dashboard/jobs');
  }

  function handleResetDraft() {
    if (!window.confirm('Discard the auto-saved draft and start fresh?')) return;
    clearDraft();
    setValues(initial);
    setErrors({});
  }

  return (
    <div className="max-w-3xl space-y-5 pb-20">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button" onClick={() => router.back()}
          className="text-sm text-surface-500 hover:text-surface-900 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>
        {hasDraft && (
          <Button type="button" variant="ghost" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleResetDraft}>
            Discard draft
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">Post a Job</h1>
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <FormSection title="Role" icon={Briefcase}>
          <FormGrid cols={1}>
            <Input label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} placeholder="e.g. Registered Nurse — Med-Surg" />
          </FormGrid>
          <FormGrid cols={2} className="mt-4">
            <Input label="Department" placeholder="e.g. Nursing" value={form.department} onChange={(e) => set('department', e.target.value)} />
            <Input label="Location"   value={form.location}   onChange={(e) => set('location',   e.target.value)} />
          </FormGrid>
          <div className="mt-4">
            <Select label="Employment type" value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="probationary">Probationary</option>
              <option value="intern">Intern</option>
            </Select>
          </div>
        </FormSection>

        <FormSection title="Compensation" description="Optional range — shown in job listings">
          <FormGrid cols={2}>
            <Input type="number" label="Salary min (PHP / month)" placeholder="25000" value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />
            <Input type="number" label="Salary max (PHP / month)" placeholder="35000" value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} />
          </FormGrid>
        </FormSection>

        <FormSection title="Logistics">
          <FormGrid cols={2}>
            <Input type="number" min="1" label="Number of openings" value={form.numberOfOpenings} onChange={(e) => set('numberOfOpenings', e.target.value)} />
            <Input type="date" label="Closing date (optional)" value={form.closingDate} onChange={(e) => set('closingDate', e.target.value)} />
          </FormGrid>
          <div className="mt-4">
            <Textarea label="Description" rows={5} placeholder="Describe the role, what they'll do, what you're looking for…" value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
        </FormSection>

        <FormActions
          saveState={saveState}
          lastSavedAt={lastSavedAt}
          dirty={isDirty && saveState !== 'saving'}
          onCancel={handleCancel}
          submitting={submitting}
          submitLabel="Post job"
        />
      </form>
    </div>
  );
}
