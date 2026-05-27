'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Applicant, ApplicantStatus } from '@/types/applicant';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

interface Props {
  applicant?: Applicant;
  mode: 'create' | 'edit';
}

const defaultForm = {
  firstName: '', middleName: '', lastName: '', email: '', mobile: '',
  dateOfBirth: '', gender: '', address: '', city: '', province: '', zipCode: '',
  positionApplied: '', department: '', sourceChannel: '', status: 'new',
  applicationDate: new Date().toISOString().split('T')[0],
  interviewDate: '', notes: '', expectedSalary: '', referredBy: '',
};

export default function ApplicantForm({ applicant, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    applicant
      ? {
          ...defaultForm,
          ...applicant,
          dateOfBirth: applicant.dateOfBirth?.split('T')[0] || '',
          applicationDate: applicant.applicationDate?.split('T')[0] || '',
          interviewDate: applicant.interviewDate?.split('T')[0] || '',
          expectedSalary: applicant.expectedSalary?.toString() || '',
        }
      : defaultForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      ...form,
      expectedSalary: form.expectedSalary ? parseFloat(form.expectedSalary) : undefined,
      interviewDate: form.interviewDate || undefined,
    };

    try {
      if (mode === 'create') {
        await api.post('/applicants', payload);
      } else {
        await api.put(`/applicants/${applicant!.id}`, payload);
      }
      router.push('/dashboard/applicants');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? 'Add New Applicant' : 'Edit Applicant'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="First Name *" name="firstName" value={form.firstName} onChange={handleChange} required />
            <Field label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} />
            <Field label="Last Name *" name="lastName" value={form.lastName} onChange={handleChange} required />
            <Field label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Field label="Mobile *" name="mobile" value={form.mobile} onChange={handleChange} required />
            <Field label="Date of Birth *" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field" required>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Address" name="address" value={form.address} onChange={handleChange} />
            </div>
            <Field label="City" name="city" value={form.city} onChange={handleChange} />
            <Field label="Province" name="province" value={form.province} onChange={handleChange} />
            <Field label="Zip Code" name="zipCode" value={form.zipCode} onChange={handleChange} />
          </div>
        </div>

        {/* Application Details */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Position Applied *" name="positionApplied" value={form.positionApplied} onChange={handleChange} required />
            <Field label="Department" name="department" value={form.department} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Source Channel</label>
              <select name="sourceChannel" value={form.sourceChannel} onChange={handleChange} className="input-field">
                <option value="">Select</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Online">Online</option>
                <option value="Referral">Referral</option>
                <option value="Agency">Agency</option>
                <option value="Job Fair">Job Fair</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {Object.values(ApplicantStatus).map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
            <Field label="Application Date" name="applicationDate" type="date" value={form.applicationDate} onChange={handleChange} />
            <Field label="Interview Date" name="interviewDate" type="date" value={form.interviewDate} onChange={handleChange} />
            <Field label="Expected Salary" name="expectedSalary" type="number" value={form.expectedSalary} onChange={handleChange} />
            <Field label="Referred By" name="referredBy" value={form.referredBy} onChange={handleChange} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Any additional notes..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg border border-surface-300 text-gray-700 hover:bg-surface-100">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {mode === 'create' ? 'Save Applicant' : 'Update Applicant'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', required = false }: {
  label: string; name: string; value: string; onChange: (e: any) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} className="input-field" required={required} />
    </div>
  );
}
