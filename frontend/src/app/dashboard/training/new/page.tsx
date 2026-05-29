'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, GraduationCap, Info } from 'lucide-react';

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    provider: 'graphy',
    category: 'compliance',
    url: '',
    externalId: '',
    thumbnailUrl: '',
    durationMinutes: 60,
    isMandatory: false,
    issuesCertificate: true,
    skills: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const r = await api.post('/training/courses', payload);
      router.push(`/dashboard/training/${r.data.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create course');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/dashboard/training" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <h1 className="text-2xl font-bold flex items-center gap-2"><GraduationCap className="w-6 h-6 text-rose-600" /> Add Course</h1>

      {form.provider === 'graphy' && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-900 flex gap-2">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Graphy integration:</strong> Paste the course URL from your Graphy school
            (e.g. <code className="bg-purple-100 px-1 rounded text-xs">https://yourschool.graphy.com/courses/xyz</code>).
            Employees launch the course in a new tab. Set the Graphy course ID below to enable progress sync (coming soon).
          </div>
        </div>
      )}

      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="e.g. BLS / CPR Refresher 2025"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Provider</label>
            <select value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="graphy">Graphy</option>
              <option value="internal">Internal</option>
              <option value="coursera">Coursera</option>
              <option value="udemy">Udemy</option>
              <option value="youtube">YouTube</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="clinical">Clinical</option>
              <option value="compliance">Compliance</option>
              <option value="leadership">Leadership</option>
              <option value="soft_skills">Soft Skills</option>
              <option value="technical">Technical</option>
              <option value="safety">Safety</option>
              <option value="onboarding">Onboarding</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Course URL</label>
          <input type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="https://yourschool.graphy.com/courses/abc-123"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Graphy / External ID</label>
            <input value={form.externalId} onChange={e => setForm({ ...form, externalId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono text-xs"
              placeholder="course_abc123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (min)</label>
            <input type="number" value={form.durationMinutes}
              onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
          <input type="url" value={form.thumbnailUrl}
            onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea rows={3} value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="What will trainees learn?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
          <input value={form.skills}
            onChange={e => setForm({ ...form, skills: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Phlebotomy, Patient Care, IV Insertion"
          />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isMandatory}
              onChange={e => setForm({ ...form, isMandatory: e.target.checked })}
              className="rounded"
            />
            Mandatory for all employees
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.issuesCertificate}
              onChange={e => setForm({ ...form, issuesCertificate: e.target.checked })}
              className="rounded"
            />
            Issues certificate on completion
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
          <Link href="/dashboard/training" className="px-4 py-2 text-sm text-gray-600">Cancel</Link>
          <button type="submit" disabled={submitting}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
}
