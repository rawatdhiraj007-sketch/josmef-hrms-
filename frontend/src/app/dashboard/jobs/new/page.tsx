'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, Briefcase } from 'lucide-react';

export default function NewJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    department: '',
    location: 'Manila, Philippines',
    employmentType: 'full_time',
    description: '',
    salaryMin: '',
    salaryMax: '',
    numberOfOpenings: 1,
    closingDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const body: any = { ...form, isActive: true };
      if (form.salaryMin) body.salaryMin = Number(form.salaryMin);
      if (form.salaryMax) body.salaryMax = Number(form.salaryMax);
      body.numberOfOpenings = Number(form.numberOfOpenings) || 1;
      if (!form.closingDate) delete body.closingDate;
      await api.post('/jobs', body);
      router.push('/dashboard/jobs');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create job');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/jobs" className="text-sm text-surface-500 hover:text-surface-700 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </Link>

      <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
        <Briefcase className="w-6 h-6 text-primary-600" /> Post a Job
      </h1>

      <form onSubmit={submit} className="card p-6 space-y-4">
        {error && <div className="badge-danger w-full p-3">{error}</div>}

        <div>
          <label className="label">Title *</label>
          <input
            required
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Registered Nurse - Med-Surg"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Department</label>
            <input
              value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Nursing"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Location</label>
            <input
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label">Employment type</label>
          <select
            value={form.employmentType}
            onChange={e => setForm({ ...form, employmentType: e.target.value })}
            className="input-field"
          >
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="probationary">Probationary</option>
            <option value="intern">Intern</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Salary min (PHP / month)</label>
            <input
              type="number"
              value={form.salaryMin}
              onChange={e => setForm({ ...form, salaryMin: e.target.value })}
              placeholder="25000"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Salary max (PHP / month)</label>
            <input
              type="number"
              value={form.salaryMax}
              onChange={e => setForm({ ...form, salaryMax: e.target.value })}
              placeholder="35000"
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Number of openings</label>
            <input
              type="number"
              min="1"
              value={form.numberOfOpenings}
              onChange={e => setForm({ ...form, numberOfOpenings: Number(e.target.value) })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Closing date (optional)</label>
            <input
              type="date"
              value={form.closingDate}
              onChange={e => setForm({ ...form, closingDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the role, what they'll do, what you're looking for..."
            className="input-field"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-surface-100">
          <Link href="/dashboard/jobs" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? 'Posting...' : 'Post job'}
          </button>
        </div>
      </form>
    </div>
  );
}
