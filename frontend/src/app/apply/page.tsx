'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Loader2, Upload, FileText, X, Briefcase, MapPin, Building2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { BRAND } from '@/lib/brand';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://josmef-hrms-backend.onrender.com/api/v1';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
}

export default function ApplyPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    province: '',
    positionApplied: '',
    department: '',
    expectedSalary: '',
    notes: '',
    sourceChannel: 'Online Portal',
    jobOpeningId: '',
  });
  const [resume, setResume] = useState<{
    base64: string; name: string; mimeType: string; size: number;
  } | null>(null);
  const [resumeError, setResumeError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; number?: string; message?: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load active job openings
  useEffect(() => {
    fetch(`${API}/jobs/public`)
      .then(r => r.json())
      .then(data => Array.isArray(data) ? setJobs(data) : setJobs([]))
      .catch(() => setJobs([]));
  }, []);

  function pickJob(job: Job | null) {
    setSelectedJob(job);
    setForm(f => ({
      ...f,
      jobOpeningId: job?.id ?? '',
      positionApplied: job?.title ?? '',
      department: job?.department ?? f.department,
    }));
    setStep(2);
  }

  async function handleFile(file: File) {
    setResumeError('');
    if (file.size > MAX_FILE_SIZE) {
      setResumeError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 5MB.`);
      return;
    }
    if (!file.type.match(/pdf|word|msword|officedocument/i)) {
      setResumeError('Please upload a PDF or Word document');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setResume({ base64, name: file.name, mimeType: file.type, size: file.size });
    };
    reader.readAsDataURL(file);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.mobile.trim()) e.mobile = 'Required';
    if (!form.dateOfBirth) e.dateOfBirth = 'Required';
    if (!form.gender) e.gender = 'Required';
    if (!form.positionApplied.trim()) e.positionApplied = 'Required';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const body: any = {
        ...form,
        expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : undefined,
      };
      if (resume) {
        body.resumeBase64 = resume.base64;
        body.resumeFileName = resume.name;
        body.resumeMimeType = resume.mimeType;
        body.resumeSizeBytes = resume.size;
      }
      const res = await fetch(`${API}/applicants/public/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, number: data.applicantNumber });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setResult({ success: false, message: data.message || 'Submission failed. Please try again.' });
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Success page ────────────────────────────────────
  if (result?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-surface-50 via-white to-surface-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full p-8 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 mx-auto flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2 tracking-tight">
            Application received! 🎉
          </h1>
          <p className="text-surface-600 mb-6">
            Thank you for your interest in {BRAND.name}. Our recruitment team will review
            your application and reach out within 5 business days.
          </p>
          <div className="bg-surface-50 border border-surface-200 rounded-xl p-4 mb-6">
            <div className="text-2xs font-semibold uppercase tracking-wider text-surface-500 mb-1">
              Your tracking number
            </div>
            <div className="font-mono text-lg font-bold text-primary-600">
              {result.number}
            </div>
            <p className="text-xs text-surface-500 mt-2">
              Save this for reference. We'll email updates to{' '}
              <span className="text-surface-700 font-medium">{form.email}</span>
            </p>
          </div>
          <button onClick={() => window.location.reload()} className="btn-secondary w-full">
            Submit another application
          </button>
        </div>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-50 via-white to-surface-50">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between min-h-[64px]">
          <Logo width={130} />
          <div className="text-xs text-surface-500">
            Step {step} of 2
          </div>
        </div>
      </nav>

      <div className="py-12 px-4">
        {/* Hero */}
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 rounded-full px-3 py-1 text-xs font-medium mb-4">
            <Briefcase className="w-3 h-3" />
            We're hiring
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-surface-900 tracking-tight">
            Join our team
          </h1>
          <p className="text-surface-600 mt-3 max-w-lg mx-auto text-sm md:text-base">
            {step === 1
              ? "Pick a position you're interested in, or apply for general consideration."
              : selectedJob
                ? `You're applying for ${selectedJob.title}.`
                : "Tell us about yourself and we'll be in touch."}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className={`h-1.5 rounded-full transition-all ${step === 1 ? 'w-10 bg-primary-600' : 'w-1.5 bg-primary-200'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step === 2 ? 'w-10 bg-primary-600' : 'w-1.5 bg-surface-300'}`} />
          </div>
        </div>

      <div className="max-w-3xl mx-auto">
        {/* Submit error */}
        {result && !result.success && (
          <div className="card border-rose-200 bg-rose-50 p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-rose-800 text-sm">{result.message}</p>
          </div>
        )}

        {/* ─── Step 1: Job picker ─── */}
        {step === 1 && (
          <div className="card p-6 animate-fade-in">
            <h2 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-600" />
              Open positions
            </h2>

            {jobs.length === 0 ? (
              <div className="text-center py-8 text-surface-500">
                <Briefcase className="w-10 h-10 text-surface-200 mx-auto mb-2" />
                <p className="text-sm">No active openings right now</p>
                <p className="text-xs text-surface-400 mt-1">
                  But you can still apply for general consideration below
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(j => (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => pickJob(j)}
                    className="w-full text-left card p-4 hover:border-primary-300 hover:shadow-card-hover transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-surface-900 group-hover:text-primary-700 transition-colors">
                          {j.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-surface-500 mt-1.5">
                          {j.department && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {j.department}
                            </span>
                          )}
                          {j.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {j.location}
                            </span>
                          )}
                          <span className="badge-info text-2xs capitalize">
                            {j.employmentType.replace('_', ' ')}
                          </span>
                          {j.salaryMin && (
                            <span className="text-surface-700 font-medium">
                              ₱{Number(j.salaryMin).toLocaleString()}
                              {j.salaryMax && ` – ₱${Number(j.salaryMax).toLocaleString()}`}
                            </span>
                          )}
                        </div>
                        {j.description && (
                          <p className="text-sm text-surface-600 mt-2 line-clamp-2">
                            {j.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* General application option */}
            <button
              type="button"
              onClick={() => pickJob(null)}
              className="w-full text-left mt-4 card p-4 border-dashed hover:border-primary-300 transition-all"
            >
              <div className="font-medium text-surface-700">
                💼 Apply for general consideration
              </div>
              <p className="text-xs text-surface-500 mt-1">
                Don't see a fit? Tell us about yourself anyway.
              </p>
            </button>
          </div>
        )}

        {/* ─── Step 2: Application form ─── */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            {/* Back button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-surface-500 hover:text-surface-700 flex items-center gap-1"
            >
              ← Change position
            </button>

            {/* Selected job summary */}
            {selectedJob && (
              <div className="card p-4 bg-gradient-to-r from-primary-50 to-accent-500/5 border-primary-200">
                <div className="text-2xs font-semibold uppercase tracking-wider text-primary-600 mb-1">
                  Applying for
                </div>
                <div className="font-bold text-surface-900">{selectedJob.title}</div>
                <div className="text-xs text-surface-600 mt-0.5">
                  {selectedJob.department}{selectedJob.location && ` · ${selectedJob.location}`}
                </div>
              </div>
            )}

            {/* Personal info */}
            <div className="card p-6">
              <h3 className="font-semibold text-surface-900 mb-1">Personal information</h3>
              <p className="text-xs text-surface-500 mb-5">Required fields marked with *</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">First name *</label>
                  <input
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className={`input-field ${errors.firstName ? 'border-rose-400' : ''}`}
                  />
                  {errors.firstName && <p className="text-2xs text-rose-600 mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="label">Middle name</label>
                  <input
                    value={form.middleName}
                    onChange={e => setForm({ ...form, middleName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Last name *</label>
                  <input
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className={`input-field ${errors.lastName ? 'border-rose-400' : ''}`}
                  />
                  {errors.lastName && <p className="text-2xs text-rose-600 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="label">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className={`input-field ${errors.email ? 'border-rose-400' : ''}`}
                  />
                  {errors.email && <p className="text-2xs text-rose-600 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="label">Mobile *</label>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    placeholder="+63 917 123 4567"
                    className={`input-field ${errors.mobile ? 'border-rose-400' : ''}`}
                  />
                  {errors.mobile && <p className="text-2xs text-rose-600 mt-1">{errors.mobile}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="label">Date of birth *</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                    className={`input-field ${errors.dateOfBirth ? 'border-rose-400' : ''}`}
                  />
                  {errors.dateOfBirth && <p className="text-2xs text-rose-600 mt-1">{errors.dateOfBirth}</p>}
                </div>
                <div>
                  <label className="label">Gender *</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    className={`input-field ${errors.gender ? 'border-rose-400' : ''}`}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && <p className="text-2xs text-rose-600 mt-1">{errors.gender}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="label">Address</label>
                <input
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="Unit / Street / Barangay"
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="label">City</label>
                  <input
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Province</label>
                  <input
                    value={form.province}
                    onChange={e => setForm({ ...form, province: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Position + resume */}
            <div className="card p-6">
              <h3 className="font-semibold text-surface-900 mb-1">Position & resume</h3>
              <p className="text-xs text-surface-500 mb-5">Tell us what you're applying for</p>

              {!selectedJob && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Position applied for *</label>
                    <input
                      value={form.positionApplied}
                      onChange={e => setForm({ ...form, positionApplied: e.target.value })}
                      placeholder="e.g. Registered Nurse"
                      className={`input-field ${errors.positionApplied ? 'border-rose-400' : ''}`}
                    />
                    {errors.positionApplied && <p className="text-2xs text-rose-600 mt-1">{errors.positionApplied}</p>}
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <input
                      value={form.department}
                      onChange={e => setForm({ ...form, department: e.target.value })}
                      placeholder="e.g. Nursing, Admin, Finance"
                      className="input-field"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="label">Expected monthly salary (PHP)</label>
                <input
                  type="number"
                  value={form.expectedSalary}
                  onChange={e => setForm({ ...form, expectedSalary: e.target.value })}
                  placeholder="e.g. 25000"
                  className="input-field"
                />
              </div>

              {/* Resume upload */}
              <div className="mt-5">
                <label className="label">Resume / CV (PDF or Word, max 5MB)</label>

                {!resume ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-surface-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/30 transition-colors text-center group"
                  >
                    <Upload className="w-8 h-8 text-surface-300 group-hover:text-primary-500 mx-auto mb-2 transition-colors" />
                    <div className="text-sm font-medium text-surface-700">Click to upload</div>
                    <div className="text-xs text-surface-500 mt-1">PDF, DOC, DOCX · up to 5MB</div>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-surface-50 border border-surface-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-surface-900 truncate">
                        {resume.name}
                      </div>
                      <div className="text-xs text-surface-500">
                        {(resume.size / 1024).toFixed(0)} KB
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setResume(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="p-2 hover:bg-rose-100 text-surface-500 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  className="hidden"
                />
                {resumeError && (
                  <p className="text-2xs text-rose-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {resumeError}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <label className="label">Additional notes / cover letter</label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Tell us about yourself, your experience, and why you want to join us..."
                  className="input-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit application'
              )}
            </button>

            <p className="text-2xs text-surface-500 text-center">
              By submitting, you consent to {BRAND.name} collecting and processing your information for recruitment purposes.
            </p>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
