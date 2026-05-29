'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, Stethoscope, Info } from 'lucide-react';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  position?: string;
}

// Auto-suggest issuing authority based on type
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

export default function NewLicensePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    employeeId: '',
    licenseType: 'prc_rn',
    customTypeLabel: '',
    licenseNumber: '',
    issuingAuthority: 'Professional Regulation Commission',
    countryCode: 'PH',
    issueDate: '',
    expiryDate: '',
    cpdUnits: 0,
    cpdRequired: 45,
    verificationUrl: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/employees', { params: { limit: 500 } }).then(r =>
      setEmployees(r.data.rows || r.data),
    );
  }, []);

  function handleTypeChange(type: string) {
    const defaults = AUTHORITY_DEFAULTS[type];
    setForm({
      ...form,
      licenseType: type,
      issuingAuthority: defaults?.authority ?? '',
      countryCode: defaults?.country ?? '',
      cpdRequired: defaults?.cpd ?? 0,
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const r = await api.post('/licenses', form);
      router.push(`/dashboard/licenses/${r.data.id ?? ''}` || '/dashboard/licenses');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create license');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/licenses" className="text-sm text-surface-500 hover:text-surface-700 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Licenses
      </Link>

      <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
        <Stethoscope className="w-6 h-6 text-primary-600" /> Add Professional License
      </h1>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex gap-3 text-sm text-primary-900">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div>
          The compliance engine will automatically alert when this license is
          within 90/30/7 days of expiry, or once expired. Issuing authority,
          country, and CPD requirements auto-fill based on type.
        </div>
      </div>

      <form onSubmit={submit} className="card p-6 space-y-4">
        {error && <div className="badge-danger w-full p-3">{error}</div>}

        <div>
          <label className="label">Employee *</label>
          <select required value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="input-field">
            <option value="">Select employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} {emp.position ? `· ${emp.position}` : ''} ({emp.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">License Type *</label>
            <select required value={form.licenseType} onChange={e => handleTypeChange(e.target.value)} className="input-field">
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
            </select>
          </div>
          <div>
            <label className="label">License Number *</label>
            <input
              required
              value={form.licenseNumber}
              onChange={e => setForm({ ...form, licenseNumber: e.target.value })}
              placeholder="e.g. 0123456"
              className="input-field font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Issuing Authority</label>
            <input value={form.issuingAuthority} onChange={e => setForm({ ...form, issuingAuthority: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label">Country</label>
            <select value={form.countryCode} onChange={e => setForm({ ...form, countryCode: e.target.value })} className="input-field">
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
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Issue Date</label>
            <input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="label">Expiry Date *</label>
            <input required type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="input-field" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">CPD Units Completed</label>
            <input type="number" min="0" step="0.5" value={form.cpdUnits} onChange={e => setForm({ ...form, cpdUnits: Number(e.target.value) })} className="input-field" />
          </div>
          <div>
            <label className="label">CPD Units Required</label>
            <input type="number" min="0" step="0.5" value={form.cpdRequired} onChange={e => setForm({ ...form, cpdRequired: Number(e.target.value) })} className="input-field" />
          </div>
        </div>

        <div>
          <label className="label">Verification URL</label>
          <input
            type="url"
            value={form.verificationUrl}
            onChange={e => setForm({ ...form, verificationUrl: e.target.value })}
            placeholder="https://www.prc.gov.ph/online-verification/..."
            className="input-field"
          />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field" />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-surface-100">
          <Link href="/dashboard/licenses" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Saving...' : 'Add License'}
          </button>
        </div>
      </form>
    </div>
  );
}
