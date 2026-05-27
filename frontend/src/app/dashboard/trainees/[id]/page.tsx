'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Trainee } from '@/types/trainee';
import { ArrowLeft, Pencil, Mail, Phone, Briefcase, Calendar, MapPin, Award, Users, X, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  ongoing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  dropped: 'bg-gray-100 text-gray-500',
  for_deployment: 'bg-amber-100 text-amber-700',
  deployed: 'bg-emerald-100 text-emerald-700',
};

export default function ViewTraineePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<Trainee | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPromote, setShowPromote] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [promoteForm, setPromoteForm] = useState({
    dateHired: new Date().toISOString().split('T')[0],
    position: '', department: '', branch: '',
    basicSalary: '', dailyRate: '', allowance: '',
    dateOfBirth: '', gender: '',
  });

  useEffect(() => {
    api.get(`/trainees/${params.id}`)
      .then((res) => {
        setData(res.data);
        setPromoteForm(f => ({
          ...f,
          position: res.data.positionApplied || '',
          department: res.data.department || '',
        }));
      })
      .catch(() => alert('Not found'))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handlePromote(e: React.FormEvent) {
    e.preventDefault();
    setPromoting(true);
    try {
      const res = await api.post(`/trainees/${params.id}/promote`, {
        ...promoteForm,
        basicSalary: promoteForm.basicSalary ? Number(promoteForm.basicSalary) : undefined,
        dailyRate: promoteForm.dailyRate ? Number(promoteForm.dailyRate) : undefined,
        allowance: promoteForm.allowance ? Number(promoteForm.allowance) : undefined,
      });
      setShowPromote(false);
      router.push(`/dashboard/employees/${res.data.employee.id}`);
    } catch { alert('Promotion failed. Please check all required fields.'); } finally { setPromoting(false); }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-red-500">Not found</div>;

  return (
    <div>
      {/* Promote Modal */}
      {showPromote && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Promote to Employee</h2>
              <button onClick={() => setShowPromote(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handlePromote} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Hired *</label>
                  <input type="date" required value={promoteForm.dateHired}
                    onChange={e => setPromoteForm(f => ({ ...f, dateHired: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input type="date" required value={promoteForm.dateOfBirth}
                    onChange={e => setPromoteForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                  <input type="text" required value={promoteForm.position}
                    onChange={e => setPromoteForm(f => ({ ...f, position: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <input type="text" required value={promoteForm.department}
                    onChange={e => setPromoteForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select required value={promoteForm.gender}
                  onChange={e => setPromoteForm(f => ({ ...f, gender: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input type="text" value={promoteForm.branch}
                  onChange={e => setPromoteForm(f => ({ ...f, branch: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Branch / Site" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (₱)</label>
                  <input type="number" value={promoteForm.basicSalary}
                    onChange={e => setPromoteForm(f => ({ ...f, basicSalary: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (₱)</label>
                  <input type="number" value={promoteForm.dailyRate}
                    onChange={e => setPromoteForm(f => ({ ...f, dailyRate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allowance (₱)</label>
                  <input type="number" value={promoteForm.allowance}
                    onChange={e => setPromoteForm(f => ({ ...f, allowance: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                An Employee ID (EMP-YYYY-NNN) will be auto-generated. The trainee will be marked as "deployed".
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowPromote(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={promoting} className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {promoting ? <><Loader2 className="w-4 h-4 animate-spin" /> Promoting...</> : 'Promote to Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100"><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
          <div>
            {(data as any).traineeNumber && (
              <p className="text-xs font-mono text-brand-600 font-medium">{(data as any).traineeNumber}</p>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{data.firstName} {data.middleName} {data.lastName}</h1>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[data.status]}`}>{data.status.replace(/_/g, ' ')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!['deployed', 'failed', 'dropped'].includes(data.status) && (
            <button onClick={() => setShowPromote(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              <Users className="w-4 h-4" /> Promote to Employee
            </button>
          )}
          <button onClick={() => router.push(`/dashboard/trainees/${data.id}/edit`)} className="btn-primary flex items-center gap-2"><Pencil className="w-4 h-4" /> Edit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Info</h2>
          <div className="space-y-3">
            <Row icon={Mail} label="Email" value={data.email} />
            <Row icon={Phone} label="Mobile" value={data.mobile} />
            <Row icon={Briefcase} label="Position" value={data.positionApplied} />
            <Row label="Department" value={data.department} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Training Details</h2>
          <div className="space-y-3">
            <Row label="Program" value={data.trainingProgram} />
            <Row icon={MapPin} label="Location" value={data.trainingLocation} />
            <Row label="Trainer" value={data.trainer} />
            <Row icon={Calendar} label="Start" value={data.trainingStartDate?.split('T')[0]} />
            <Row icon={Calendar} label="End" value={data.trainingEndDate?.split('T')[0]} />
            <Row icon={Award} label="Exam Score" value={data.examScore?.toString()} />
            <Row icon={Award} label="Performance" value={data.performanceRating?.toString()} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Deployment</h2>
          <div className="space-y-3">
            <Row icon={Calendar} label="Date" value={data.deploymentDate?.split('T')[0]} />
            <Row icon={MapPin} label="Site" value={data.deploymentSite} />
          </div>
        </div>

        {data.remarks && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Remarks</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{data.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon?: any; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3">
      {Icon ? <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /> : <div className="w-4" />}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-gray-800">{value || '-'}</p>
      </div>
    </div>
  );
}
