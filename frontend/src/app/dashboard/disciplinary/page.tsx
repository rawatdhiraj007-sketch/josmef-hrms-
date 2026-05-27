'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Shield, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const DISC_TYPES = ['verbal_warning', 'written_warning', 'suspension', 'demotion', 'termination'];
const DISC_STATUSES = ['open', 'resolved', 'appealed', 'dismissed'];

const typeLabel = (t: string) => ({
  verbal_warning: 'Verbal Warning', written_warning: 'Written Warning',
  suspension: 'Suspension', demotion: 'Demotion', termination: 'Termination',
}[t] || t);

const typeColor = (t: string) => ({
  verbal_warning: 'bg-yellow-100 text-yellow-700',
  written_warning: 'bg-orange-100 text-orange-700',
  suspension: 'bg-red-100 text-red-700',
  demotion: 'bg-purple-100 text-purple-700',
  termination: 'bg-red-200 text-red-800',
}[t] || 'bg-gray-100 text-gray-700');

const statusColor = (s: string) => ({
  open: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700',
  appealed: 'bg-yellow-100 text-yellow-700', dismissed: 'bg-gray-100 text-gray-600',
}[s] || 'bg-gray-100 text-gray-600');

export default function DisciplinaryPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employeeId: '', type: 'written_warning', incidentDate: '', offense: '',
    description: '', actionTaken: '', suspensionDays: '', issuedBy: '', remarks: '',
  });

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (typeFilter) params.set('type', typeFilter);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/disciplinary?${params}`);
      setRecords(res.data.data);
      setMeta(res.data.meta);
    } catch { } finally { setLoading(false); }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => { fetchRecords(1); }, [fetchRecords]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?limit=200');
      setEmployees(res.data.data);
    } catch { }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/disciplinary', {
        ...form,
        suspensionDays: form.suspensionDays ? Number(form.suspensionDays) : undefined,
      });
      setShowForm(false);
      fetchRecords(1);
    } catch { } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Disciplinary Actions</h1>
          <p className="text-sm text-gray-500 mt-1">Track warnings, suspensions, and corrective actions</p>
        </div>
        <button onClick={() => { fetchEmployees(); setShowForm(true); }} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">
          <Plus className="w-4 h-4" /> Add Record
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee or offense..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All Types</option>
          {DISC_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          {DISC_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Offense</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Incident Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.employee?.firstName} {r.employee?.lastName}</div>
                    <div className="text-xs text-gray-500">{r.employee?.employeeId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor(r.type)}`}>{typeLabel(r.type)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{r.offense}</td>
                  <td className="px-4 py-3 text-gray-600">{r.incidentDate ? new Date(r.incidentDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(r.status)}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-gray-500">No disciplinary records found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Add Disciplinary Record</h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {DISC_TYPES.map(t => <option key={t} value={t}>{typeLabel(t)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Incident Date *</label>
                  <input type="date" required value={form.incidentDate} onChange={e => setForm(f => ({ ...f, incidentDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offense *</label>
                <input type="text" required value={form.offense} onChange={e => setForm(f => ({ ...f, offense: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g., Tardiness, Insubordination" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Detailed description of the incident..." />
              </div>
              {form.type === 'suspension' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Suspension Days</label>
                  <input type="number" value={form.suspensionDays} onChange={e => setForm(f => ({ ...f, suspensionDays: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Number of days" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issued By</label>
                <input type="text" value={form.issuedBy} onChange={e => setForm(f => ({ ...f, issuedBy: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Name of officer" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
