'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FileCheck, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const CERT_TYPES = [
  { value: 'certificate_of_employment', label: 'Certificate of Employment' },
  { value: 'coe_with_compensation', label: 'COE with Compensation' },
  { value: 'service_record', label: 'Service Record' },
  { value: 'salary_certification', label: 'Salary Certification' },
  { value: 'good_moral', label: 'Good Moral Certificate' },
  { value: 'work_experience', label: 'Work Experience Certificate' },
  { value: 'other', label: 'Other' },
];

const CERT_STATUSES = ['requested', 'processing', 'released', 'cancelled'];

const statusColor = (s: string) => ({
  requested: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700',
  released: 'bg-green-100 text-green-700', cancelled: 'bg-gray-100 text-gray-600',
}[s] || 'bg-gray-100 text-gray-600');

export default function WorkCertificatesPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employeeId: '', certificateType: 'certificate_of_employment',
    requestDate: new Date().toISOString().split('T')[0],
    purpose: '', addressedTo: '', remarks: '',
  });

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/work-certificates?${params}`);
      setRecords(res.data.data);
      setMeta(res.data.meta);
    } catch { } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/work-certificates', form);
      setShowForm(false);
      fetchRecords(1);
    } catch { } finally { setSubmitting(false); }
  };

  const certLabel = (v: string) => CERT_TYPES.find(t => t.value === v)?.label || v;

  const markReleased = async (id: string) => {
    try {
      await api.put(`/work-certificates/${id}`, {
        status: 'released', releaseDate: new Date().toISOString().split('T')[0],
      });
      fetchRecords(meta.page);
    } catch { }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Certificates</h1>
          <p className="text-sm text-gray-500 mt-1">Manage certificate requests (COE, service records, salary certifications)</p>
        </div>
        <button onClick={() => { api.get('/employees?limit=200').then(r => setEmployees(r.data.data)); setShowForm(true); }}
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">
          <Plus className="w-4 h-4" /> New Request
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee or certificate number..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          {CERT_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Cert #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Purpose</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date Requested</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-brand-700 font-medium">{r.certificateNumber || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.employee?.firstName} {r.employee?.lastName}</div>
                    <div className="text-xs text-gray-500">{r.employee?.employeeId}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{certLabel(r.certificateType)}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate text-xs">{r.purpose || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{r.requestDate ? new Date(r.requestDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === 'processing' && (
                      <button onClick={() => markReleased(r.id)}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-200">
                        Mark Released
                      </button>
                    )}
                    {r.status === 'requested' && (
                      <button onClick={() => api.put(`/work-certificates/${r.id}`, { status: 'processing' }).then(() => fetchRecords(meta.page))}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium hover:bg-blue-200">
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No certificate requests found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">New Certificate Request</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                <select required value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Type *</label>
                <select required value={form.certificateType} onChange={e => setForm(f => ({ ...f, certificateType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {CERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Requested *</label>
                <input type="date" required value={form.requestDate} onChange={e => setForm(f => ({ ...f, requestDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Addressed To</label>
                <input type="text" value={form.addressedTo} onChange={e => setForm(f => ({ ...f, addressedTo: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g., To Whom It May Concern, Embassy of..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <textarea value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g., For visa application, bank loan, etc." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
