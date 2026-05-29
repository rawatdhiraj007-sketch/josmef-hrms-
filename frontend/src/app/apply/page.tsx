'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';
import { BRAND } from '@/lib/brand';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ApplyPage() {
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; number?: string; message?: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required';
    if (!form.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
    if (!form.gender) e.gender = 'Gender is required';
    if (!form.positionApplied.trim()) e.positionApplied = 'Position applied is required';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/applicants/public/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          expectedSalary: form.expectedSalary ? Number(form.expectedSalary) : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, number: data.applicantNumber });
      } else {
        setResult({ success: false, message: data.message || 'Submission failed. Please try again.' });
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = 'text', opts?: { required?: boolean; options?: string[] }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {opts?.required && <span className="text-red-500">*</span>}
      </label>
      {opts?.options ? (
        <select
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors[key] ? 'border-red-400' : 'border-gray-300'}`}
        >
          <option value="">Select {label}</option>
          {opts.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors[key] ? 'border-red-400' : 'border-gray-300'}`}
          placeholder={label}
        />
      )}
      {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
    </div>
  );

  if (result?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for your interest in {BRAND.name}. Your application has been received.
          </p>
          {result.number && (
            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-brand-700 font-medium">Your Application Reference Number</p>
              <p className="text-2xl font-bold text-brand-800 tracking-wide mt-1">{result.number}</p>
              <p className="text-xs text-brand-600 mt-1">Please save this number for future reference</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Our HR team will review your application and contact you within 3-5 business days.
          </p>
          <button
            onClick={() => { setResult(null); setForm({ firstName: '', middleName: '', lastName: '', email: '', mobile: '', dateOfBirth: '', gender: '', address: '', city: '', province: '', positionApplied: '', department: '', expectedSalary: '', notes: '', sourceChannel: 'Online Portal' }); }}
            className="mt-6 w-full bg-brand-600 text-white py-2.5 rounded-lg font-medium hover:bg-brand-700 transition-colors"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-violet-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo
              size={64}
              textClassName="text-2xl text-gray-900"
              taglineClassName="text-xs text-gray-500"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Job Application</h2>
          <p className="text-gray-600 mt-2">Fill out this form to apply for a position. All fields marked with <span className="text-red-500">*</span> are required.</p>
        </div>

        {result && !result.success && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{result.message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {field('firstName', 'First Name', 'text', { required: true })}
              {field('middleName', 'Middle Name')}
              {field('lastName', 'Last Name', 'text', { required: true })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {field('email', 'Email Address', 'email', { required: true })}
              {field('mobile', 'Mobile Number', 'tel', { required: true })}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {field('dateOfBirth', 'Date of Birth', 'date', { required: true })}
              {field('gender', 'Gender', 'text', { required: true, options: ['Male', 'Female', 'Prefer not to say'] })}
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">Address</h3>
            <div className="space-y-4">
              {field('address', 'Street Address')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field('city', 'City')}
                {field('province', 'Province')}
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-5">Application Details</h3>
            <div className="space-y-4">
              {field('positionApplied', 'Position Applied For', 'text', { required: true })}
              {field('department', 'Preferred Department', 'text', { options: ['Operations', 'Finance', 'Human Resources', 'IT', 'Admin', 'Sales', 'Marketing', 'Security'] })}
              {field('expectedSalary', 'Expected Monthly Salary (PHP)', 'number')}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes / Cover Letter</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={4}
                  placeholder="Tell us about yourself, your experience, and why you want to join us..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Application...
              </>
            ) : 'Submit Application'}
          </button>

          <p className="text-center text-xs text-gray-500">
            By submitting this form, you consent to {BRAND.name} collecting and processing your personal information for recruitment purposes.
          </p>
        </form>
      </div>
    </div>
  );
}
