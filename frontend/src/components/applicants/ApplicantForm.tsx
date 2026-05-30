'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Applicant, ApplicantStatus } from '@/types/applicant';
import {
  ArrowLeft, User, MapPin, FileText, Trash2, RotateCcw, ShieldAlert,
} from 'lucide-react';

import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { FormSection, FormGrid, FormActions } from '@/components/form';
import type { SaveState } from '@/components/form';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { validate, required as req, email as emailRule, Errors } from '@/lib/validation';

interface Props { applicant?: Applicant; mode: 'create' | 'edit'; }

type FormShape = Record<string, string>;

const defaults: FormShape = {
  firstName: '', middleName: '', lastName: '', email: '', mobile: '',
  dateOfBirth: '', gender: '', address: '', city: '', province: '', zipCode: '',
  positionApplied: '', department: '', sourceChannel: '', status: 'new',
  applicationDate: new Date().toISOString().split('T')[0],
  interviewDate: '', notes: '', expectedSalary: '', referredBy: '',
};

export default function ApplicantForm({ applicant, mode }: Props) {
  const router = useRouter();
  const toast = useToast();

  const initial: FormShape = applicant ? {
    ...defaults, ...applicant,
    dateOfBirth: applicant.dateOfBirth?.split('T')[0] || '',
    applicationDate: applicant.applicationDate?.split('T')[0] || '',
    interviewDate: applicant.interviewDate?.split('T')[0] || '',
    expectedSalary: applicant.expectedSalary?.toString() || '',
  } as FormShape : defaults;

  const draftKey = `nn:draft:applicant:${applicant?.id ?? 'new'}`;
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
      firstName:       [req()],
      lastName:        [req()],
      email:           [req(), emailRule()],
      mobile:          [req()],
      dateOfBirth:     [req()],
      gender:          [req()],
      positionApplied: [req()],
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
      expectedSalary: form.expectedSalary ? parseFloat(form.expectedSalary) : undefined,
      interviewDate: form.interviewDate || undefined,
    };

    try {
      if (mode === 'create') await api.post('/applicants', payload);
      else await api.put(`/applicants/${applicant!.id}`, payload);
      clearDraft();
      setSaveState('saved');
      toast.success(mode === 'create' ? 'Applicant added' : 'Changes saved');
      router.push('/dashboard/applicants');
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
              {mode === 'create' ? 'Add New Applicant' : 'Edit Applicant'}
            </h1>
            {mode === 'edit' && applicant && (
              <p className="text-xs text-surface-500 truncate">{applicant.firstName} {applicant.lastName}</p>
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
        <FormSection title="Personal Information" description="Basic identity details" icon={User}>
          <FormGrid cols={3}>
            <Input label="First Name"   required value={form.firstName}  onChange={(e) => set('firstName',  e.target.value)} error={errors.firstName} />
            <Input label="Middle Name"           value={form.middleName} onChange={(e) => set('middleName', e.target.value)} />
            <Input label="Last Name"    required value={form.lastName}   onChange={(e) => set('lastName',   e.target.value)} error={errors.lastName} />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} />
            <Input label="Mobile"       required value={form.mobile}     onChange={(e) => set('mobile',     e.target.value)} error={errors.mobile} />
            <Input label="Date of Birth" required type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} error={errors.dateOfBirth} />
            <Select label="Gender" required value={form.gender} onChange={(e) => set('gender', e.target.value)} error={errors.gender}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </FormGrid>
        </FormSection>

        <FormSection title="Address" icon={MapPin}>
          <FormGrid cols={3}>
            <div className="sm:col-span-2 lg:col-span-3">
              <Input label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </div>
            <Input label="City"     value={form.city}     onChange={(e) => set('city',     e.target.value)} />
            <Input label="Province" value={form.province} onChange={(e) => set('province', e.target.value)} />
            <Input label="Zip Code" value={form.zipCode}  onChange={(e) => set('zipCode',  e.target.value)} />
          </FormGrid>
        </FormSection>

        <FormSection title="Application Details" icon={FileText}>
          <FormGrid cols={3}>
            <Input label="Position Applied" required value={form.positionApplied} onChange={(e) => set('positionApplied', e.target.value)} error={errors.positionApplied} />
            <Input label="Department" value={form.department} onChange={(e) => set('department', e.target.value)} />
            <Select label="Source Channel" value={form.sourceChannel} onChange={(e) => set('sourceChannel', e.target.value)}>
              <option value="">Select</option>
              {['Walk-in', 'Online', 'Referral', 'Agency', 'Job Fair'].map((o) => <option key={o} value={o}>{o}</option>)}
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {Object.values(ApplicantStatus).map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
              ))}
            </Select>
            <Input type="date"   label="Application Date" value={form.applicationDate} onChange={(e) => set('applicationDate', e.target.value)} />
            <Input type="date"   label="Interview Date"   value={form.interviewDate}   onChange={(e) => set('interviewDate',   e.target.value)} />
            <Input type="number" label="Expected Salary"  value={form.expectedSalary}  onChange={(e) => set('expectedSalary',  e.target.value)} />
            <Input               label="Referred By"      value={form.referredBy}      onChange={(e) => set('referredBy',      e.target.value)} />
          </FormGrid>
          <div className="mt-4">
            <Textarea label="Notes" rows={3} placeholder="Any additional notes…" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </FormSection>

        <FormActions
          saveState={saveState}
          lastSavedAt={lastSavedAt}
          dirty={isDirty && saveState !== 'saving'}
          onCancel={handleCancel}
          submitting={submitting}
          submitLabel={mode === 'create' ? 'Save Applicant' : 'Update Applicant'}
        />
      </form>
    </div>
  );
}
