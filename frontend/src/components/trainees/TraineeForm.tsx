'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Trainee, TraineeStatusEnum } from '@/types/trainee';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

interface Props {
  trainee?: Trainee;
  mode: 'create' | 'edit';
}

const defaultForm = {
  firstName: '', middleName: '', lastName: '', email: '', mobile: '',
  positionApplied: '', department: '', trainingProgram: '', trainingLocation: '',
  trainingStartDate: new Date().toISOString().split('T')[0], trainingEndDate: '',
  trainer: '', status: 'ongoing', examScore: '', performanceRating: '',
  remarks: '', deploymentDate: '', deploymentSite: '',
};

export default function TraineeForm({ trainee, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    trainee ? {
      ...defaultForm, ...trainee,
      trainingStartDate: trainee.trainingStartDate?.split('T')[0] || '',
      trainingEndDate: trainee.trainingEndDate?.split('T')[0] || '',
      deploymentDate: trainee.deploymentDate?.split('T')[0] || '',
      examScore: trainee.examScore?.toString() || '',
      performanceRating: trainee.performanceRating?.toString() || '',
    } : defaultForm,
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
      examScore: form.examScore ? parseFloat(form.examScore) : undefined,
      performanceRating: form.performanceRating ? parseFloat(form.performanceRating) : undefined,
      trainingEndDate: form.trainingEndDate || undefined,
      deploymentDate: form.deploymentDate || undefined,
    };
    try {
      if (mode === 'create') await api.post('/trainees', payload);
      else await api.put(`/trainees/${trainee!.id}`, payload);
      router.push('/dashboard/trainees');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save');
    } finally { setSubmitting(false); }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100"><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
        <h1 className="text-2xl font-bold text-gray-900">{mode === 'create' ? 'Add New Trainee' : 'Edit Trainee'}</h1>
      </div>
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Inp label="First Name *" name="firstName" value={form.firstName} onChange={handleChange} required />
            <Inp label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} />
            <Inp label="Last Name *" name="lastName" value={form.lastName} onChange={handleChange} required />
            <Inp label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
            <Inp label="Mobile *" name="mobile" value={form.mobile} onChange={handleChange} required />
            <Inp label="Position *" name="positionApplied" value={form.positionApplied} onChange={handleChange} required />
            <Inp label="Department" name="department" value={form.department} onChange={handleChange} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Inp label="Training Program" name="trainingProgram" value={form.trainingProgram} onChange={handleChange} />
            <Inp label="Training Location" name="trainingLocation" value={form.trainingLocation} onChange={handleChange} />
            <Inp label="Trainer" name="trainer" value={form.trainer} onChange={handleChange} />
            <Inp label="Start Date *" name="trainingStartDate" type="date" value={form.trainingStartDate} onChange={handleChange} required />
            <Inp label="End Date" name="trainingEndDate" type="date" value={form.trainingEndDate} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {Object.values(TraineeStatusEnum).map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <Inp label="Exam Score" name="examScore" type="number" value={form.examScore} onChange={handleChange} />
            <Inp label="Performance Rating" name="performanceRating" type="number" value={form.performanceRating} onChange={handleChange} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deployment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Inp label="Deployment Date" name="deploymentDate" type="date" value={form.deploymentDate} onChange={handleChange} />
            <Inp label="Deployment Site" name="deploymentSite" value={form.deploymentSite} onChange={handleChange} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks</label>
            <textarea name="remarks" value={form.remarks} onChange={handleChange} rows={3} className="input-field" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg border border-surface-300 text-gray-700 hover:bg-surface-100">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {mode === 'create' ? 'Save Trainee' : 'Update Trainee'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Inp({ label, name, value, onChange, type = 'text', required = false }: {
  label: string; name: string; value: string; onChange: (e: any) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} className="input-field" required={required} />
    </div>
  );
}
