'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, GraduationCap, Info, Trash2, ShieldAlert } from 'lucide-react';

import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { FormSection, FormGrid, FormActions } from '@/components/form';
import type { SaveState } from '@/components/form';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { validate, required as req, Errors } from '@/lib/validation';

type FormShape = {
  title: string; description: string; provider: string; category: string;
  url: string; externalId: string; thumbnailUrl: string;
  durationMinutes: string; isMandatory: boolean; issuesCertificate: boolean;
  skills: string;
};

const initial: FormShape = {
  title: '', description: '', provider: 'graphy', category: 'compliance',
  url: '', externalId: '', thumbnailUrl: '',
  durationMinutes: '60', isMandatory: false, issuesCertificate: true,
  skills: '',
};

export default function NewCoursePage() {
  const router = useRouter();
  const toast = useToast();

  const draftKey = 'nn:draft:course:new';
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
    if (Object.keys(errs).length > 0) { toast.error('Title is required'); return; }

    setSubmitting(true);
    setSaveState('saving');
    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes) || 0,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      const r = await api.post('/training/courses', payload);
      clearDraft();
      setSaveState('saved');
      toast.success('Course created');
      router.push(`/dashboard/training/${r.data.id}`);
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to create course';
      setServerError(message);
      setSaveState('error');
      toast.error('Failed to create', message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    router.push('/dashboard/training');
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
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {hasDraft && (
          <Button type="button" variant="ghost" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleResetDraft}>
            Discard draft
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">Add Course</h1>
      </div>

      {form.provider === 'graphy' && (
        <div className="px-4 py-3 rounded-xl bg-accent-50/60 border border-accent-200/60 text-sm text-accent-900 flex gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent-600" />
          <div>
            <strong>Graphy integration:</strong> Paste the course URL from your Graphy school (e.g. <code className="bg-white/60 px-1 rounded text-xs">https://yourschool.graphy.com/courses/xyz</code>). Set the Graphy course ID below to enable progress sync.
          </div>
        </div>
      )}

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <FormSection title="Basic info" icon={GraduationCap}>
          <Input label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} placeholder="e.g. BLS / CPR Refresher 2025" />
          <FormGrid cols={2} className="mt-4">
            <Select label="Provider" value={form.provider} onChange={(e) => set('provider', e.target.value)}>
              <option value="graphy">Graphy</option>
              <option value="internal">Internal</option>
              <option value="coursera">Coursera</option>
              <option value="udemy">Udemy</option>
              <option value="youtube">YouTube</option>
              <option value="other">Other</option>
            </Select>
            <Select label="Category" value={form.category} onChange={(e) => set('category', e.target.value)}>
              <option value="clinical">Clinical</option>
              <option value="compliance">Compliance</option>
              <option value="leadership">Leadership</option>
              <option value="soft_skills">Soft Skills</option>
              <option value="technical">Technical</option>
              <option value="safety">Safety</option>
              <option value="onboarding">Onboarding</option>
              <option value="other">Other</option>
            </Select>
          </FormGrid>
        </FormSection>

        <FormSection title="Links & metadata">
          <Input type="url" label="Course URL" placeholder="https://yourschool.graphy.com/courses/abc-123" value={form.url} onChange={(e) => set('url', e.target.value)} />
          <FormGrid cols={2} className="mt-4">
            <Input label="Graphy / External ID" placeholder="course_abc123" value={form.externalId} onChange={(e) => set('externalId', e.target.value)} className="font-mono" />
            <Input type="number" label="Duration (min)" value={form.durationMinutes} onChange={(e) => set('durationMinutes', e.target.value)} />
          </FormGrid>
          <div className="mt-4">
            <Input type="url" label="Thumbnail URL" placeholder="https://…" value={form.thumbnailUrl} onChange={(e) => set('thumbnailUrl', e.target.value)} />
          </div>
        </FormSection>

        <FormSection title="Content">
          <Textarea label="Description" rows={3} placeholder="What will trainees learn?" value={form.description} onChange={(e) => set('description', e.target.value)} />
          <div className="mt-4">
            <Input label="Skills (comma-separated)" placeholder="Phlebotomy, Patient Care, IV Insertion" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-5 mt-4">
            <label className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer">
              <input type="checkbox" checked={form.isMandatory} onChange={(e) => set('isMandatory', e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-200" />
              Mandatory for all employees
            </label>
            <label className="flex items-center gap-2 text-sm text-surface-700 cursor-pointer">
              <input type="checkbox" checked={form.issuesCertificate} onChange={(e) => set('issuesCertificate', e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-200" />
              Issues certificate on completion
            </label>
          </div>
        </FormSection>

        <FormActions
          saveState={saveState}
          lastSavedAt={lastSavedAt}
          dirty={isDirty && saveState !== 'saving'}
          onCancel={handleCancel}
          submitting={submitting}
          submitLabel="Create Course"
        />
      </form>
    </div>
  );
}
