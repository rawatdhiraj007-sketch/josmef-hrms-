'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Trainee, TraineeStatusEnum } from '@/types/trainee';
import {
  ArrowLeft, User, GraduationCap, MapPinned, Trash2, RotateCcw, ShieldAlert,
} from 'lucide-react';

import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { FormSection, FormGrid, FormActions } from '@/components/form';
import type { SaveState } from '@/components/form';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { validate, required as req, email as emailRule, Errors } from '@/lib/validation';

interface Props { trainee?: Trainee; mode: 'create' | 'edit'; }

type FormShape = Record<string, string>;

const defaults: FormShape = {
  firstName: '', middleName: '', lastName: '', email: '', mobile: '',
  positionApplied: '', department: '', trainingProgram: '', trainingLocation: '',
  trainingStartDate: new Date().toISOString().split('T')[0], trainingEndDate: '',
  trainer: '', status: 'ongoing', examScore: '', performanceRating: '',
  remarks: '', deploymentDate: '', deploymentSite: '',
};

export default function TraineeForm({ trainee, mode }: Props) {
  const router = useRouter();
  const toast = useToast();

  const initial: FormShape = trainee ? {
    ...defaults, ...trainee,
    trainingStartDate: trainee.trainingStartDate?.split('T')[0] || '',
    trainingEndDate: trainee.trainingEndDate?.split('T')[0] || '',
    deploymentDate: trainee.deploymentDate?.split('T')[0] || '',
    examScore: trainee.examScore?.toString() || '',
    performanceRating: trainee.performanceRating?.toString() || '',
  } as FormShape : defaults;

  const draftKey = `nn:draft:trainee:${trainee?.id ?? 'new'}`;
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

  function validateAll(): boolean {
    const e = validate(form, {
      firstName:        [req()],
      lastName:         [req()],
      email:            [req(), emailRule()],
      mobile:           [req()],
      positionApplied:  [req()],
      trainingStartDate:[req()],
    });
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error('Check the highlighted fields', 'Some required fields are missing or invalid.');
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validateAll()) return;

    setSubmitting(true);
    setSaveState('saving');

    const payload: any = {
      ...form,
      examScore: form.examScore ? parseFloat(form.examScore) : undefined,
      performanceRating: form.performanceRating ? parseFloat(form.performanceRating) : undefined,
      trainingEndDate: form.trainingEndDate || undefined,
      deploymentDate: form.deploymentDate || undefined,
    };

    try {
      if (mode === 'create') await api.post('/trainees', payload);
      else await api.put(`/trainees/${trainee!.id}`, payload);
      clearDraft();
      setSaveState('saved');
      toast.success(mode === 'create' ? 'Trainee added' : 'Changes saved');
      router.push('/dashboard/trainees');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const message = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save';
      setServerError(message);
      setSaveState('error');
      toast.error('Save failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    router.back();
  }

  function handleResetDraft() {
    if (!window.confirm('Discard the auto-saved draft and start fresh?')) return;
    clearDraft();
    setValues(initial);
    setErrors({});
    toast.info('Draft discarded');
  }

  return (
    <div className="space-y-5 pb-20">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors flex-shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">
              {mode === 'create' ? 'Add New Trainee' : 'Edit Trainee'}
            </h1>
            {mode === 'edit' && trainee && (
              <p className="text-xs text-surface-500 truncate">{trainee.firstName} {trainee.lastName}</p>
            )}
          </div>
        </div>
        {hasDraft && mode === 'create' && (
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

      {hasDraft && mode === 'create' && lastSavedAt && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-800 text-xs flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restored from draft saved {new Date(lastSavedAt).toLocaleString()}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormSection title="Personal Information" icon={User}>
          <FormGrid cols={3}>
            <Input label="First Name"  required value={form.firstName}      onChange={(e) => set('firstName',      e.target.value)} error={errors.firstName} />
            <Input label="Middle Name"          value={form.middleName}     onChange={(e) => set('middleName',     e.target.value)} />
            <Input label="Last Name"   required value={form.lastName}       onChange={(e) => set('lastName',       e.target.value)} error={errors.lastName} />
            <Input label="Email" type="email" required value={form.email}   onChange={(e) => set('email',          e.target.value)} error={errors.email} />
            <Input label="Mobile"      required value={form.mobile}         onChange={(e) => set('mobile',         e.target.value)} error={errors.mobile} />
            <Input label="Position"    required value={form.positionApplied} onChange={(e) => set('positionApplied', e.target.value)} error={errors.positionApplied} />
            <Input label="Department"           value={form.department}     onChange={(e) => set('department',     e.target.value)} />
          </FormGrid>
        </FormSection>

        <FormSection title="Training Details" icon={GraduationCap}>
          <FormGrid cols={3}>
            <Input  label="Training Program"  value={form.trainingProgram}  onChange={(e) => set('trainingProgram',  e.target.value)} />
            <Input  label="Training Location" value={form.trainingLocation} onChange={(e) => set('trainingLocation', e.target.value)} />
            <Input  label="Trainer"           value={form.trainer}          onChange={(e) => set('trainer',          e.target.value)} />
            <Input  type="date" label="Start Date" required value={form.trainingStartDate} onChange={(e) => set('trainingStartDate', e.target.value)} error={errors.trainingStartDate} />
            <Input  type="date" label="End Date"            value={form.trainingEndDate}   onChange={(e) => set('trainingEndDate',   e.target.value)} />
            <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {Object.values(TraineeStatusEnum).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </Select>
            <Input type="number" label="Exam Score"         value={form.examScore}         onChange={(e) => set('examScore',         e.target.value)} />
            <Input type="number" label="Performance Rating" value={form.performanceRating} onChange={(e) => set('performanceRating', e.target.value)} />
          </FormGrid>
        </FormSection>

        <FormSection title="Deployment" icon={MapPinned}>
          <FormGrid cols={2}>
            <Input type="date" label="Deployment Date" value={form.deploymentDate} onChange={(e) => set('deploymentDate', e.target.value)} />
            <Input              label="Deployment Site" value={form.deploymentSite} onChange={(e) => set('deploymentSite', e.target.value)} />
          </FormGrid>
          <div className="mt-4">
            <Textarea label="Remarks" rows={3} value={form.remarks} onChange={(e) => set('remarks', e.target.value)} />
          </div>
        </FormSection>

        <FormActions
          saveState={saveState}
          lastSavedAt={lastSavedAt}
          dirty={isDirty && saveState !== 'saving'}
          onCancel={handleCancel}
          submitting={submitting}
          submitLabel={mode === 'create' ? 'Save Trainee' : 'Update Trainee'}
        />
      </form>
    </div>
  );
}
