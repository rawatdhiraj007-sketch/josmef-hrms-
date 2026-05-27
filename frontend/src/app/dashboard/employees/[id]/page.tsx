'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Employee, Document201, DocumentCategory } from '@/types/employee';
import {
  ArrowLeft, Pencil, Mail, Phone, Briefcase, Calendar, MapPin,
  Shield, FileText, Upload, CheckCircle, Trash2, ExternalLink,
  Archive, BookOpen, X, Loader2,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  probationary: 'bg-amber-100 text-amber-700', regular: 'bg-green-100 text-green-700',
  resigned: 'bg-gray-100 text-gray-500', terminated: 'bg-red-100 text-red-700',
  end_of_contract: 'bg-orange-100 text-orange-700', awol: 'bg-red-100 text-red-600',
};

const SEPARATION_REASONS = [
  'resigned', 'terminated', 'end_of_contract', 'retired', 'awol', 'redundancy', 'retrenchment', 'death', 'other'
];

export default function ViewEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<Employee | null>(null);
  const [docs, setDocs] = useState<Document201[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'profile' | '201file'>('profile');
  const [catFilter, setCatFilter] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveForm, setArchiveForm] = useState({
    separationReason: 'resigned',
    dateSeparated: new Date().toISOString().split('T')[0],
    separationDetails: '',
    finalPay: '',
    remarks: '',
  });

  useEffect(() => {
    Promise.all([
      api.get(`/employees/${params.id}`),
      api.get(`/documents/employee/${params.id}`),
    ])
      .then(([empRes, docRes]) => {
        setData(empRes.data);
        setDocs(docRes.data);
      })
      .catch(() => alert('Not found'))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleArchive(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm('Archive this employee as a Former Employee? This action will mark them as separated.')) return;
    setArchiving(true);
    try {
      await api.post(`/employees/${params.id}/archive`, {
        ...archiveForm,
        finalPay: archiveForm.finalPay ? Number(archiveForm.finalPay) : 0,
      });
      setShowArchive(false);
      router.push('/dashboard/former-employees');
    } catch { alert('Archive failed.'); } finally { setArchiving(false); }
  }

  async function handleDeleteDoc(docId: string) {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setDocs(docs.filter((d) => d.id !== docId));
    } catch { alert('Failed'); }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-red-500">Not found</div>;

  const filteredDocs = catFilter ? docs.filter((d) => d.category === catFilter) : docs;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100"><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
          <div>
            <p className="text-xs text-gray-400 font-mono">{data.employeeId}</p>
            <h1 className="text-2xl font-bold text-gray-900">{data.firstName} {data.middleName} {data.lastName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[data.employmentStatus]}`}>
                {data.employmentStatus.replace(/_/g, ' ')}
              </span>
              <span className="text-sm text-gray-500">{data.position} — {data.department}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/dashboard/employees/${data.id}/201`)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            <BookOpen className="w-4 h-4" /> 201 File
          </button>
          <button
            onClick={() => setShowArchive(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
          >
            <Archive className="w-4 h-4" /> Archive
          </button>
          <button onClick={() => router.push(`/dashboard/employees/${data.id}/edit`)} className="btn-primary flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 mb-6">
        <button onClick={() => setTab('profile')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${tab === 'profile' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-surface-100'}`}>
          Profile
        </button>
        <button onClick={() => setTab('201file')}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${tab === '201file' ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-surface-100'}`}>
          <FileText className="w-4 h-4" /> 201 File ({docs.length})
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Personal Information">
            <Row icon={Mail} label="Email" value={data.email} />
            <Row icon={Phone} label="Mobile" value={data.mobile} />
            <Row label="Telephone" value={data.telephone} />
            <Row icon={Calendar} label="Birthday" value={data.dateOfBirth?.split('T')[0]} />
            <Row label="Gender" value={data.gender} />
            <Row label="Civil Status" value={data.civilStatus} />
            <Row label="Nationality" value={data.nationality} />
          </Section>

          <Section title="Address">
            <Row icon={MapPin} label="Present" value={data.presentAddress} />
            <Row icon={MapPin} label="Permanent" value={data.permanentAddress} />
            <Row label="City" value={[data.city, data.province, data.zipCode].filter(Boolean).join(', ')} />
          </Section>

          <Section title="Government IDs">
            <Row icon={Shield} label="SSS" value={data.sssNumber} />
            <Row label="PhilHealth" value={data.philhealthNumber} />
            <Row label="Pag-IBIG" value={data.pagibigNumber} />
            <Row label="TIN" value={data.tinNumber} />
          </Section>

          <Section title="Employment">
            <Row icon={Briefcase} label="Position" value={data.position} />
            <Row label="Department" value={data.department} />
            <Row label="Branch" value={data.branch} />
            <Row label="Client" value={data.client} />
            <Row icon={Calendar} label="Date Hired" value={data.dateHired?.split('T')[0]} />
            <Row label="Regularized" value={data.dateRegularized?.split('T')[0]} />
            <Row label="Contract End" value={data.contractEndDate?.split('T')[0]} />
            <Row label="Type" value={data.employmentType} />
          </Section>

          <Section title="Compensation">
            <Row label="Basic Salary" value={`₱${Number(data.basicSalary).toLocaleString()}`} />
            <Row label="Daily Rate" value={`₱${Number(data.dailyRate).toLocaleString()}`} />
            <Row label="Allowance" value={`₱${Number(data.allowance).toLocaleString()}`} />
          </Section>

          <Section title="Emergency Contact">
            <Row label="Name" value={data.emergencyContactName} />
            <Row label="Relation" value={data.emergencyContactRelation} />
            <Row icon={Phone} label="Phone" value={data.emergencyContactPhone} />
          </Section>
        </div>
      )}

      {/* Archive Modal */}
      {showArchive && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Archive Employee</h2>
              <button onClick={() => setShowArchive(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleArchive} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Separation Reason *</label>
                <select required value={archiveForm.separationReason}
                  onChange={e => setArchiveForm(f => ({ ...f, separationReason: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {SEPARATION_REASONS.map(r => <option key={r} value={r} className="capitalize">{r.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Separated</label>
                <input type="date" value={archiveForm.dateSeparated}
                  onChange={e => setArchiveForm(f => ({ ...f, dateSeparated: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Final Pay (₱)</label>
                <input type="number" value={archiveForm.finalPay}
                  onChange={e => setArchiveForm(f => ({ ...f, finalPay: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details / Remarks</label>
                <textarea value={archiveForm.separationDetails}
                  onChange={e => setArchiveForm(f => ({ ...f, separationDetails: e.target.value }))}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Additional details about the separation..." />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                This will create a Former Employee record (FMR-YYYY-NNN) and mark the employee as separated.
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowArchive(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={archiving} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {archiving ? <><Loader2 className="w-4 h-4 animate-spin" /> Archiving...</> : 'Confirm Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 201 File Tab */}
      {tab === '201file' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="input-field w-56">
              <option value="">All Categories</option>
              {Object.values(DocumentCategory).map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, (x) => x.toUpperCase())}</option>
              ))}
            </select>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="card p-12 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredDocs.map((d) => (
                <div key={d.id} className="card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{d.documentName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="px-2 py-0.5 bg-surface-100 rounded">{d.category.replace(/_/g, ' ')}</span>
                        {d.documentDate && <span>{d.documentDate.split('T')[0]}</span>}
                        {d.isVerified && <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" />Verified</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {d.fileUrl && (
                      <a href={d.fileUrl} target="_blank" rel="noopener" className="p-2 rounded-lg hover:bg-surface-100 text-gray-500 hover:text-brand-600">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => handleDeleteDoc(d.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="card p-6"><h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2><div className="space-y-3">{children}</div></div>);
}
function Row({ icon: Icon, label, value }: { icon?: any; label: string; value?: string }) {
  return (<div className="flex items-start gap-3">
    {Icon ? <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" /> : <div className="w-4" />}
    <div><p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p><p className="text-gray-800">{value || '-'}</p></div>
  </div>);
}
