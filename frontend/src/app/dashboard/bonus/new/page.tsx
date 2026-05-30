'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Gift, ArrowLeft, Info, ShieldAlert, Trash2 } from 'lucide-react';

import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { FormSection, FormGrid, FormActions } from '@/components/form';
import type { SaveState } from '@/components/form';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { validate, required as req, Errors } from '@/lib/validation';

type FormShape = {
  title: string; type: string; year: string;
  payoutDate: string; amountPerEmployee: string; notes: string;
};

const initial: FormShape = {
  title: '', type: '13th_month', year: String(new Date().getFullYear()),
  payoutDate: '', amountPerEmployee: '', notes: '',
};

export default function NewBonusRunPage() {
  const router = useRouter();
  const toast = useToast();

  const draftKey = 'nn:draft:bonus:new';
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
    const errs = validate(form, {
      title: [req()],
      type:  [req()],
      year:  [req()],
      payoutDate: [req('Payout date is required')],
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) { toast.error('Check the highlighted fields'); return; }

    setSubmitting(true);
    setSaveState('saving');
    try {
      const payload: any = {
        title: form.title,
        type: form.type,
        year: Number(form.year),
        payoutDate: form.payoutDate,
        notes: form.notes,
      };
      if (form.type !== '13th_month' && form.amountPerEmployee) {
        payload.amountPerEmployee = Number(form.amountPerEmployee);
      }
      const r = await api.post('/bonus', payload);
      clearDraft();
      setSaveState('saved');
      toast.success('Bonus run created');
      router.push(`/dashboard/bonus/${r.data.id}`);
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed';
      setServerError(message);
      setSaveState('error');
      toast.error('Failed to create', message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    router.push('/dashboard/bonus');
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
          <Gift className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">New Bonus Run</h1>
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <FormSection title="Run details" icon={Gift}>
          <Input label="Title" required value={form.title} onChange={(e) => set('title', e.target.value)} error={errors.title} placeholder="e.g. 13th Month Pay 2025" />
          <FormGrid cols={2} className="mt-4">
            <Select label="Type" required value={form.type} onChange={(e) => set('type', e.target.value)} error={errors.type}>
              <option value="13th_month">13th Month Pay (auto-computed)</option>
              <option value="performance">Performance Bonus</option>
              <option value="christmas">Christmas Bonus</option>
              <option value="commission">Commission</option>
              <option value="signing">Signing Bonus</option>
              <option value="retention">Retention Bonus</option>
              <option value="other">Other</option>
            </Select>
            <Input type="number" label="Year" required value={form.year} onChange={(e) => set('year', e.target.value)} error={errors.year} />
          </FormGrid>
          <div className="mt-4">
            <Input type="date" label="Payout Date" required value={form.payoutDate} onChange={(e) => set('payoutDate', e.target.value)} error={errors.payoutDate} />
          </div>

          {form.type === '13th_month' ? (
            <div className="mt-4 px-4 py-3 rounded-xl bg-info-50 border border-blue-200 text-blue-800 text-sm flex gap-2 bg-blue-50">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                13th month pay will be auto-computed per employee as <strong>(total basic pay paid in {form.year}) ÷ 12</strong> — per PH Presidential Decree 851.
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Input type="number" label="Amount per Employee (₱)" placeholder="Leave blank to set per-employee later" value={form.amountPerEmployee} onChange={(e) => set('amountPerEmployee', e.target.value)} />
            </div>
          )}

          <div className="mt-4">
            <Textarea label="Notes" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </FormSection>

        <FormActions
          saveState={saveState}
          lastSavedAt={lastSavedAt}
          dirty={isDirty && saveState !== 'saving'}
          onCancel={handleCancel}
          submitting={submitting}
          submitLabel="Create Draft"
        />
      </form>
    </div>
  );
}
