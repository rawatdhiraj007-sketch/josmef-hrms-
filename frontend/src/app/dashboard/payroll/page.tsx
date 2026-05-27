'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { PayrollRecord, ListResponse } from '@/types/attendance';
import {
  DollarSign, Play, ChevronLeft, ChevronRight, Eye, X,
  Calendar, CheckCircle, Loader2,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  processing: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  released: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function PayrollPage() {
  const [data, setData] = useState<PayrollRecord[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genFrom, setGenFrom] = useState('');
  const [genTo, setGenTo] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get<ListResponse<PayrollRecord>>('/payroll', { params });
      setData(res.data.data);
      setMeta(res.data.meta);
    } catch { /* */ } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleGenerate() {
    if (!genFrom || !genTo) return;
    setGenerating(true);
    try {
      await api.post('/payroll/generate', { payDateFrom: genFrom, payDateTo: genTo });
      setShowGenerate(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate');
    } finally { setGenerating(false); }
  }

  const fmt = (n: number) => `₱${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">{meta.total} records</p>
        </div>
        <button onClick={() => setShowGenerate(true)} className="btn-primary flex items-center gap-2 w-fit">
          <Play className="w-5 h-5" /> Generate Payroll
        </button>
      </div>

      {/* Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Generate Payroll</h2>
              <button onClick={() => setShowGenerate(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay Period From</label>
                <input type="date" value={genFrom} onChange={(e) => setGenFrom(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pay Period To</label>
                <input type="date" value={genTo} onChange={(e) => setGenTo(e.target.value)} className="input-field" />
              </div>
              <button onClick={handleGenerate} disabled={generating || !genFrom || !genTo} className="btn-primary w-full flex items-center justify-center gap-2">
                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                {generating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Payslip</h2>
              <button onClick={() => setSelectedPayslip(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="border-b border-surface-200 pb-3 mb-4">
              <p className="font-bold text-gray-900">{selectedPayslip.employee?.lastName}, {selectedPayslip.employee?.firstName}</p>
              <p className="text-sm text-gray-500">{selectedPayslip.employee?.position} — {selectedPayslip.employee?.department}</p>
              <p className="text-xs text-gray-400 mt-1">Period: {selectedPayslip.payDateFrom?.split('T')[0]} to {selectedPayslip.payDateTo?.split('T')[0]}</p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
              <p className="text-gray-500">Days Worked</p><p className="text-right font-medium">{Number(selectedPayslip.daysWorked)}</p>
              <p className="text-gray-500">Days Absent</p><p className="text-right font-medium">{Number(selectedPayslip.daysAbsent)}</p>
              <p className="text-gray-500">OT Hours</p><p className="text-right font-medium">{Number(selectedPayslip.totalOvertimeHours).toFixed(1)}</p>
              <p className="text-gray-500">Late (min)</p><p className="text-right font-medium">{Number(selectedPayslip.totalLateMinutes).toFixed(0)}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-green-700 mb-2 uppercase">Earnings</p>
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <p className="text-gray-600">Basic Pay</p><p className="text-right">{fmt(selectedPayslip.basicPay)}</p>
                <p className="text-gray-600">Overtime</p><p className="text-right">{fmt(selectedPayslip.overtimePay)}</p>
                <p className="text-gray-600">Holiday</p><p className="text-right">{fmt(selectedPayslip.holidayPay)}</p>
                <p className="text-gray-600">Allowance</p><p className="text-right">{fmt(selectedPayslip.allowance)}</p>
                <p className="font-semibold text-gray-900 pt-1 border-t">Gross Pay</p><p className="text-right font-semibold pt-1 border-t">{fmt(selectedPayslip.grossPay)}</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-red-700 mb-2 uppercase">Deductions</p>
              <div className="grid grid-cols-2 gap-y-1 text-sm">
                <p className="text-gray-600">SSS</p><p className="text-right">{fmt(selectedPayslip.sssContribution)}</p>
                <p className="text-gray-600">PhilHealth</p><p className="text-right">{fmt(selectedPayslip.philhealthContribution)}</p>
                <p className="text-gray-600">Pag-IBIG</p><p className="text-right">{fmt(selectedPayslip.pagibigContribution)}</p>
                <p className="text-gray-600">Tax</p><p className="text-right">{fmt(selectedPayslip.withholdingTax)}</p>
                <p className="text-gray-600">Late</p><p className="text-right">{fmt(selectedPayslip.lateDeduction)}</p>
                <p className="text-gray-600">Absent</p><p className="text-right">{fmt(selectedPayslip.absentDeduction)}</p>
                <p className="font-semibold text-gray-900 pt-1 border-t">Total</p><p className="text-right font-semibold pt-1 border-t">{fmt(selectedPayslip.totalDeductions)}</p>
              </div>
            </div>

            <div className="bg-brand-50 rounded-lg p-4 text-center">
              <p className="text-xs text-brand-600 uppercase font-semibold">Net Pay</p>
              <p className="text-3xl font-bold text-brand-700">{fmt(selectedPayslip.netPay)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-48">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="approved">Approved</option>
          <option value="released">Released</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Employee</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Period</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Gross</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Deductions</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Net Pay</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No payroll records</td></tr>
              ) : data.map((p) => (
                <tr key={p.id} className="border-b border-surface-100 hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{p.employee?.lastName}, {p.employee?.firstName}</p>
                    <p className="text-xs text-gray-400">{p.employee?.department}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs hidden md:table-cell">
                    {p.payDateFrom?.split('T')[0]} — {p.payDateTo?.split('T')[0]}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 hidden md:table-cell">{fmt(p.grossPay)}</td>
                  <td className="px-4 py-3 text-right text-red-600 hidden lg:table-cell">{fmt(p.totalDeductions)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(p.netPay)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || 'bg-gray-100'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelectedPayslip(p)} className="p-2 rounded-lg hover:bg-surface-100 text-gray-500 hover:text-brand-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200">
            <p className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchData(meta.page - 1)} disabled={meta.page <= 1} className="p-2 rounded-lg border border-surface-200 hover:bg-surface-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => fetchData(meta.page + 1)} disabled={meta.page >= meta.totalPages} className="p-2 rounded-lg border border-surface-200 hover:bg-surface-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
