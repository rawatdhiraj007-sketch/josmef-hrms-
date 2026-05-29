'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import {
  Briefcase, Plus, Edit, ToggleLeft, ToggleRight, Trash2, Copy,
  Eye, MapPin, Building2, Users,
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  department?: string;
  location?: string;
  employmentType: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  isActive: boolean;
  numberOfOpenings: number;
  applicantCount: number;
  postedDate?: string;
  closingDate?: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('active');
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    try { const r = await api.get('/jobs'); setJobs(r.data); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function toggle(j: Job) {
    await api.put(`/jobs/${j.id}`, { isActive: !j.isActive });
    await load();
  }
  async function remove(id: string) {
    if (!confirm('Close this job opening? Applicants can no longer find it.')) return;
    await api.delete(`/jobs/${id}`);
    await load();
  }

  function copyApplyLink() {
    const url = `${window.location.origin}/apply`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const filtered = jobs.filter(j =>
    filter === 'all' ? true :
    filter === 'active' ? j.isActive : !j.isActive
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
            <Briefcase className="w-6 h-6 text-primary-600" /> Job Openings
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Post jobs that appear on your public apply page
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyApplyLink} className="btn-secondary text-sm" title="Copy public apply URL to share">
            <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Share apply link'}
          </button>
          <Link href="/dashboard/jobs/new" className="btn-primary">
            <Plus className="w-4 h-4" /> Post job
          </Link>
        </div>
      </div>

      {/* Public link banner */}
      <div className="card bg-gradient-to-r from-primary-50 to-pink-50 border-primary-200 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
          <Eye className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-surface-900">Your public apply page</div>
          <div className="text-xs text-surface-600 font-mono truncate">
            {typeof window !== 'undefined' ? `${window.location.origin}/apply` : '/apply'}
          </div>
        </div>
        <Link href="/apply" target="_blank" className="btn-ghost text-xs whitespace-nowrap">
          Open ↗
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2">
        {(['active', 'closed', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-primary-100 text-primary-700 border border-primary-200'
                : 'text-surface-600 hover:bg-surface-100 border border-transparent'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-xs text-surface-500">
              {f === 'all' ? jobs.length : jobs.filter(j => f === 'active' ? j.isActive : !j.isActive).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-surface-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-12 h-12 text-surface-200 mx-auto mb-3" />
          <h3 className="font-semibold text-surface-900 mb-1">
            {filter === 'closed' ? 'No closed jobs' : filter === 'all' ? 'No jobs yet' : 'No active openings'}
          </h3>
          <p className="text-sm text-surface-500 mb-4">
            Post your first job to start receiving applicants
          </p>
          <Link href="/dashboard/jobs/new" className="btn-primary inline-flex">
            <Plus className="w-4 h-4" /> Post first job
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(j => (
            <div key={j.id} className={`card p-5 ${!j.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-900">{j.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-surface-500">
                    {j.department && (
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {j.department}</span>
                    )}
                    {j.location && (
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {j.location}</span>
                    )}
                    <span className="badge-info text-2xs capitalize">
                      {j.employmentType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button onClick={() => toggle(j)} className="text-surface-400 hover:text-primary-600">
                  {j.isActive ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              {j.salaryMin && (
                <div className="text-sm font-medium text-surface-700 mb-3">
                  ₱{Number(j.salaryMin).toLocaleString()}
                  {j.salaryMax && ` – ₱${Number(j.salaryMax).toLocaleString()}`}
                  <span className="text-xs text-surface-500 ml-1">/ month</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-surface-100 text-xs text-surface-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {j.applicantCount} applicant{j.applicantCount !== 1 ? 's' : ''}
                </span>
                <span>· {j.numberOfOpenings} opening{j.numberOfOpenings !== 1 ? 's' : ''}</span>
                {j.closingDate && (
                  <span>· closes {new Date(j.closingDate).toLocaleDateString()}</span>
                )}
              </div>

              <div className="flex gap-1 mt-3 pt-3 border-t border-surface-100">
                <Link href={`/dashboard/jobs/${j.id}/edit`} className="btn-ghost text-xs flex-1">
                  <Edit className="w-3 h-3" /> Edit
                </Link>
                <button onClick={() => remove(j.id)} className="btn-ghost text-xs text-rose-600">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
