'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, DollarSign, ChevronDown, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const LOAN_TYPES = ['sss', 'pagibig', 'company', 'cash_advance', 'other'];
const LOAN_STATUSES = ['active', 'fully_paid', 'cancelled', 'defaulted'];

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [form, setForm] = useState({
    employeeId: '', loanType: 'company', principalAmount: '', monthlyAmortization: '',
    loanDate: '', firstPaymentDate: '', termMonths: '', interestRate: '', purpose: '',
    loanReference: '', remarks: '',
  });

  const fetchLoans = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('loanType', typeFilter);
      const res = await api.get(`/loans?${params}`);
      setLoans(res.data.data);
      setMeta(res.data.meta);
    } catch { } finally { setLoading(false); }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => { fetchLoans(1); }, [fetchLoans]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?limit=200');
      setEmployees(res.data.data);
    } catch { }
  };

  const openForm = () => { fetchEmployees(); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/loans', {
        ...form,
        principalAmount: Number(form.principalAmount),
        monthlyAmortization: form.monthlyAmortization ? Number(form.monthlyAmortization) : undefined,
        termMonths: form.termMonths ? Number(form.termMonths) : undefined,
        interestRate: form.interestRate ? Number(form.interestRate) : undefined,
      });
      setShowForm(false);
      fetchLoans(1);
    } catch { } finally { setSubmitting(false); }
  };

  const formatCurrency = (v: number) => `₱${Number(v).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  const formatType = (t: string) => ({ sss: 'SSS Loan', pagibig: 'Pag-IBIG Loan', company: 'Company Loan', cash_advance: 'Cash Advance', other: 'Other' }[t] || t);
  const statusColor = (s: string) => ({ active: 'bg-green-100 text-green-700', fully_paid: 'bg-blue-100 text-blue-700', cancelled: 'bg-gray-100 text-gray-600', defaulted: 'bg-red-100 text-red-700' }[s] || 'bg-gray-100 text-gray-600');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          <p className="text-sm text-gray-500 mt-1">Manage employee loans — SSS, Pag-IBIG, company, and cash advances</p>
        </div>
        <button onClick={openForm} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700">
          <Plus className="w-4 h-4" /> Add Loan
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employee or reference..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Types</option>
          {LOAN_TYPES.map(t => <option key={t} value={t}>{formatType(t)}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">All Status</option>
          {LOAN_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Loan Type</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Principal</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Outstanding</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Monthly</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loans.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{l.employee?.firstName} {l.employee?.lastName}</div>
                    <div className="text-xs text-gray-500">{l.employee?.employeeId}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">{formatType(l.loanType)}</div>
                    {l.loanReference && <div className="text-xs text-gray-500">{l.loanReference}</div>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(l.principalAmount)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(l.outstandingBalance)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(l.monthlyAmortization)}</td>
                  <td className="px-4 py-3 text-gray-600">{l.loanDate ? new Date(l.loanDate).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(l.status)}`}>
                      {l.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No loans found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{meta.total} total loans</span>
          <div className="flex gap-2">
            <button disabled={meta.page <= 1} onClick={() => fetchLoans(meta.page - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
            <span className="px-3 py-1">{meta.page} / {meta.totalPages}</span>
            <button disabled={meta.page >= meta.totalPages} onClick={() => fetchLoans(meta.page + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {/* Add Loan Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Add New Loan</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                <select required value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type *</label>
                <select required value={form.loanType} onChange={e => setForm(f => ({ ...f, loanType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {LOAN_TYPES.map(t => <option key={t} value={t}>{formatType(t)}</option>)}
                </select>
              </div>
              {['sss', 'pagibig'].includes(form.loanType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Reference #</label>
                  <input type="text" value={form.loanReference} onChange={e => setForm(f => ({ ...f, loanReference: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="SSS/Pag-IBIG reference number" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount (₱) *</label>
                  <input type="number" required value={form.principalAmount} onChange={e => setForm(f => ({ ...f, principalAmount: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Amortization (₱)</label>
                  <input type="number" value={form.monthlyAmortization} onChange={e => setForm(f => ({ ...f, monthlyAmortization: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Date</label>
                  <input type="date" value={form.loanDate} onChange={e => setForm(f => ({ ...f, loanDate: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term (months)</label>
                  <input type="number" value={form.termMonths} onChange={e => setForm(f => ({ ...f, termMonths: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="12" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <textarea value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Purpose of loan..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Loan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
