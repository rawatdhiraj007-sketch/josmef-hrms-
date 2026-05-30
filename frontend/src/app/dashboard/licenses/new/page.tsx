'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Stethoscope, Info, ShieldAlert, Trash2 } from 'lucide-react';

import { Button, Input, Select, Textarea, useToast } from '@/components/ui';
import { FormSection, FormGrid, FormActions } from '@/components/form';
import type { SaveState } from '@/components/form';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { validate, required as req, Errors } from '@/lib/validation';

interface Employee {
  id: string; firstName: string; lastName: string; employeeId: string; position?: string;
}

const AUTHORITY_DEFAULTS: Record<string, { authority: string; country: string; cpd?: number }> = {
  prc_rn: { authority: 'Professional Regulation Commission', country: 'PH', cpd: 45 },
  prc_md: { authority: 'Professional Regulation Commission', country: 'PH', cpd: 50 },
  prc_pt: { authority: 'Professional Regulation Commission', country: 'PH', cpd: 30 },
  prc_mt: { authority: 'Professional Regulation Commission', country: 'PH', cpd: 30 },
  prc_pharmacist: { authority: 'Professional Regulation Commission', country: 'PH', cpd: 30 },
  prc_dentist: { authority: 'Professional Regulation Commission', country: 'PH', cpd: 60 },
  doh_facility: { authority: 'Department of Health', country: 'PH' },
  philhealth_accreditation: { authority: 'Philippine Health Insurance Corporation', country: 'PH' },
  nmc: { authority: 'Nursing and Midwifery Council', country: 'GB', cpd: 35 },
  gmc: { authority: 'General Medical Council', country: 'GB' },
  hcpc: { authority: 'Health and Care Professions Council', country: 'GB', cpd: 30 },
  bls: { authority: 'American Heart Association', country: 'US' },
  acls: { authority: 'American Heart Association', country: 'US' },
  pals: { authority: 'American Heart Association', country: 'US' },
  nbi: { authority: 'National Bureau of Investigation', country: 'PH' },
  dbs: { authority: 'Disclosure and Barring Service', country: 'GB' },
};

type FormShape = {
  employeeId: string; licenseType: string; customTypeLabel: string;
  licenseNumber: string; issuingAuthority: string; countryCode: string;
  issueDate: string; expiryDate: string;
  cpdUnits: string; cpdRequired: string;
  verificationUrl: string; notes: string;
};

const initial: FormShape = {
  employeeId: '', licenseType: 'prc_rn', customTypeLabel: '',
  licenseNumber: '', issuingAuthority: 'Professional Regulation Commission', countryCode: 'PH',
  issueDate: '', expiryDate: '',
  cpdUnits: '0', cpdRequired: '45',
  verificationUrl: '', notes: '',
};

export default function NewLicensePage() {
  const router = useRouter();
  const toast = useToast();

  const draftKey = 'nn:draft:license:new';
  const {
    values: form, setValues, setField, clearDraft, hasDraft, isDirty, lastSavedAt,
  } = useFormDraft<FormShape>({ key: draftKey, initial });

  const [employees, setEmployees] = useState<Employee[]>([]);
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
    api.get('/employees', { params: { limit: 500 } }).then((r) =>
      setEmployees(r.data.rows || r.data),
    );
  }, []);

  function handleTypeChange(type: string) {
    const defaults = AUTHORITY_DEFAULTS[type];
    setValues((f) => ({
      ...f,
      licenseType: type,
      issuingAuthority: defaults?.authority ?? '',
      countryCode: defaults?.country ?? '',
      cpdRequired: defaults?.cpd != null ? String(defaults.cpd) : '0',
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    const errs = validate(form, {
      employeeId:    [req('Select an employee')],
      licenseType:   [req()],
      licenseNumber: [req()],
      expiryDate:    [req('Expiry date is required')],
    });
    setErrors(errs);
    if (Object.keys(errs).length > 0) { toast.error('Check the highlighted fields'); return; }

    setSubmitting(true);
    setSaveState('saving');
    try {
      const payload: any = {
        ...form,
        cpdUnits:    Number(form.cpdUnits)    || 0,
        cpdRequired: Number(form.cpdRequired) || 0,
      };
      const r = await api.post('/licenses', payload);
      clearDraft();
      setSaveState('saved');
      toast.success('License added');
      router.push(`/dashboard/licenses/${r.data.id ?? ''}` || '/dashboard/licenses');
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Failed to create license';
      setServerError(message);
      setSaveState('error');
      toast.error('Failed to add', message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    router.push('/dashboard/licenses');
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
          <ArrowLeft className="w-4 h-4" /> Back to Licenses
        </button>
        {hasDraft && (
          <Button type="button" variant="ghost" size="sm" leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleResetDraft}>
            Discard draft
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-surface-900">Add Professional License</h1>
      </div>

      <div className="px-4 py-3 rounded-xl bg-primary-50/60 border border-primary-200/60 text-sm text-primary-900 flex gap-2">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-600" />
        <div>
          The compliance engine alerts when this license is within 90/30/7 days of expiry, or once expired. Issuing authority, country, and CPD requirements auto-fill based on type.
        </div>
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={submit} className="space-y-5">
        <FormSection title="License" icon={Stethoscope}>
          <Select label="Employee" required value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)} error={errors.employeeId}>
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} {emp.position ? `· ${emp.position}` : ''} ({emp.employeeId})
              </option>
            ))}
          </Select>

          <FormGrid cols={2} className="mt-4">
            <Select label="License Type" required value={form.licenseType} onChange={(e) => handleTypeChange(e.target.value)} error={errors.licenseType}>
              <optgroup label="PH PRC">
                <option value="prc_rn">Registered Nurse</option>
                <option value="prc_md">Physician (MD)</option>
                <option value="prc_pt">Physical Therapist</option>
                <option value="prc_ot">Occupational Therapist</option>
                <option value="prc_mt">Medical Technologist</option>
                <option value="prc_rt">Respiratory Therapist</option>
                <option value="prc_pharmacist">Pharmacist</option>
                <option value="prc_dentist">Dentist</option>
                <option value="prc_psychologist">Psychologist</option>
                <option value="prc_radtech">Radiologic Technologist</option>
                <option value="prc_nutritionist">Nutritionist-Dietitian</option>
                <option value="prc_midwife">Midwife</option>
                <option value="prc_other">PRC Other</option>
              </optgroup>
              <optgroup label="PH DOH / PhilHealth">
                <option value="doh_facility">DOH Facility License</option>
                <option value="philhealth_accreditation">PhilHealth Accreditation</option>
              </optgroup>
              <optgroup label="UK">
                <option value="nmc">NMC (Nursing & Midwifery)</option>
                <option value="gmc">GMC (Medical)</option>
                <option value="hcpc">HCPC (Allied Health)</option>
                <option value="gdc">GDC (Dental)</option>
                <option value="gphc">GPhC (Pharmacy)</option>
              </optgroup>
              <optgroup label="Clinical Certifications">
                <option value="bls">BLS — Basic Life Support</option>
                <option value="acls">ACLS — Advanced Cardiac</option>
                <option value="pals">PALS — Pediatric Advanced</option>
                <option value="nrp">NRP — Neonatal Resuscitation</option>
                <option value="atls">ATLS — Trauma</option>
                <option value="iv_therapy">IV Therapy</option>
                <option value="infection_control">Infection Control</option>
              </optgroup>
              <optgroup label="Background / Clearance">
                <option value="nbi">NBI Clearance (PH)</option>
                <option value="dbs">DBS Check (UK)</option>
              </optgroup>
              <option value="other">Other</option>
            </Select>
            <Input label="License Number" required placeholder="e.g. 0123456" className="font-mono" value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} error={errors.licenseNumber} />
          </FormGrid>
        </FormSection>

        <FormSection title="Authority & Country">
          <FormGrid cols={2}>
            <Input label="Issuing Authority" value={form.issuingAuthority} onChange={(e) => set('issuingAuthority', e.target.value)} />
            <Select label="Country" value={form.countryCode} onChange={(e) => set('countryCode', e.target.value)}>
              <option value="PH">Philippines</option>
              <option value="GB">United Kingdom</option>
              <option value="US">United States</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="ES">Spain</option>
              <option value="IT">Italy</option>
              <option value="NL">Netherlands</option>
              <option value="AU">Australia</option>
              <option value="SG">Singapore</option>
            </Select>
          </FormGrid>
        </FormSection>

        <FormSection title="Dates & CPD">
          <FormGrid cols={2}>
            <Input type="date" label="Issue Date"  value={form.issueDate}  onChange={(e) => set('issueDate',  e.target.value)} />
            <Input type="date" label="Expiry Date" required value={form.expiryDate} onChange={(e) => set('expiryDate', e.target.value)} error={errors.expiryDate} />
            <Input type="number" min="0" step="0.5" label="CPD Units Completed" value={form.cpdUnits}    onChange={(e) => set('cpdUnits',    e.target.value)} />
            <Input type="number" min="0" step="0.5" label="CPD Units Required"  value={form.cpdRequired} onChange={(e) => set('cpdRequired', e.target.value)} />
          </FormGrid>
        </FormSection>

        <FormSection title="Additional">
          <Input type="url" label="Verification URL" placeholder="https://www.prc.gov.ph/online-verification/…" value={form.verificationUrl} onChange={(e) => set('verificationUrl', e.target.value)} />
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
          submitLabel="Add License"
        />
      </form>
    </div>
  );
}
