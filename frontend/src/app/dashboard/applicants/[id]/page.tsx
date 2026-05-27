'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Applicant } from '@/types/applicant';
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Briefcase, Calendar, GraduationCap, X, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  screening: 'bg-yellow-100 text-yellow-700',
  interview: 'bg-purple-100 text-purple-700',
  exam: 'bg-indigo-100 text-indigo-700',
  for_requirements: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  pooled: 'bg-gray-100 text-gray-600',
  withdrawn: 'bg-gray-100 text-gray-400',
};

export default function ViewApplicantPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConvert, setShowConvert] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertForm, setConvertForm] = useState({
    trainingStartDate: new Date().toISOString().split('T')[0],
    trainingProgram: '', trainingLocation: '', trainer: '',
  });

  useEffect(() => {
    api.get(`/applicants/${params.id}`)
      .then((res) => setData(res.data))
      .catch(() => alert('Not found'))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setConverting(true);
    try {
      const res = await api.post(`/trainees/from-applicant/${data!.id}`, convertForm);
      setShowConvert(false);
      router.push(`/dashboard/trainees/${res.data.id}`);
    } catch { alert('Conversion failed. The applicant may already be a trainee.'); } finally { setConverting(false); }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-red-500">Not found</div>;

  return (
    <div>
      {showConvert && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Convert to Trainee</h2>
              <button onClick={() => setShowConvert(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleConvert} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Start Date *</label>
                <input type="date" required value={convertForm.trainingStartDate}
                  onChange={e => setConvertForm(f => ({ ...f, trainingStartDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Program</label>
                <input type="text" value={convertForm.trainingProgram}
                  onChange={e => setConvertForm(f => ({ ...f, trainingProgram: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g., Basic Security Training" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Training Location</label>
                <input type="text" value={convertForm.trainingLocation}
                  onChange={e => setConvertForm(f => ({ ...f, trainingLocation: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Location / Venue" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trainer</label>
                <input type="text" value={convertForm.trainer}
                  onChange={e => setConvertForm(f => ({ ...f, trainer: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Trainer name" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowConvert(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={converting} className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {converting ? <><Loader2 className="w-4 h-4 animate-spin" /> Converting...</> : 'Convert to Trainee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            {(data as any).applicantNumber && (
              <p className="text-xs font-mono text-brand-600 font-medium">{(data as any).applicantNumber}</p>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {data.firstName} {data.middleName} {data.lastName}
            </h1>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[data.status]}`}>
              {data.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.status !== 'rejected' && data.status !== 'withdrawn' && (
            <button
              onClick={() => setShowConvert(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              <GraduationCap className="w-4 h-4" /> Convert to Trainee
            </button>
          )}
          <button
            onClick={() => router.push(`/dashboard/applicants/${data.id}/edit`)}
            className="btn-primary flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-3">
            <InfoRow icon={Mail} label="Email" value={data.email} />
            <InfoRow icon={Phone} label="Mobile" value={data.mobile} />
            <InfoRow icon={Calendar} label="Date of Birth" value={data.dateOfBirth?.split('T')[0]} />
            <InfoRow label="Gender" value={data.gender} />
            <InfoRow icon={MapPin} label="Address" value={[data.address, data.city, data.province, data.zipCode].filter(Boolean).join(', ')} />
          </div>
        </div>

        {/* Application Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
          <div className="space-y-3">
            <InfoRow icon={Briefcase} label="Position" value={data.positionApplied} />
            <InfoRow label="Department" value={data.department} />
            <InfoRow label="Source" value={data.sourceChannel} />
            <InfoRow label="Application Date" value={data.applicationDate?.split('T')[0]} />
            <InfoRow label="Interview Date" value={data.interviewDate?.split('T')[0]} />
            <InfoRow label="Expected Salary" value={data.expectedSalary ? `₱${Number(data.expectedSalary).toLocaleString()}` : '-'} />
            <InfoRow label="Referred By" value={data.referredBy} />
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="card p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon?: any; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      {!Icon && <div className="w-4" />}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-gray-800">{value || '-'}</p>
      </div>
    </div>
  );
}
