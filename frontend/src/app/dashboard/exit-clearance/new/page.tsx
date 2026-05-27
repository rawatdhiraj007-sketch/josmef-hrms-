'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { SeparationType } from '@/types/exit-clearance';
import { ArrowLeft, Save, Loader2, Search } from 'lucide-react';

export default function NewExitClearancePage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    employeeId: '',
    separationType: 'resignation',
    lastWorkingDay: '',
    resignationDate: new Date().toISOString().split('T')[0],
    effectiveDate: '',
    reason: '',
    remarks: '',
  });
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (search.length >= 2) {
      api.get('/employees', { params: { search, limit: 10, employmentStatus: 'regular' } })
        .then((res) => setEmployees(res.data.data))
        .catch(() => {});
    } else {
      setEmployees([]);
    }
  }, [search]);

  function selectEmployee(emp: any) {
    setSelectedEmp(emp);
    setForm({ ...form, employeeId: emp.id });
    setSearch('');
    setEmployees([]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employeeId) { setError('Please select an employee'); return; }
    setSubmitting(true); setError('');
    try {
      await api.post('/exit-clearance', form);
      router.push('/dashboard/exit-clearance');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed');
    } finally { setSubmitting(false); }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100"><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
        <h1 className="text-2xl font-bold text-gray-900">New Exit Clearance</h1>
      </div>
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Search */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Employee</h2>
          {selectedEmp ? (
            <div className="flex items-center justify-between p-4 bg-brand-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{selectedEmp.lastName}, {selectedEmp.firstName}</p>
                <p className="text-sm text-gray-500">{selectedEmp.employeeId} — {selectedEmp.position} — {selectedEmp.department}</p>
              </div>
              <button type="button" onClick={() => { setSelectedEmp(null); setForm({ ...form, employeeId: '' }); }}
                className="text-sm text-red-600 hover:underline">Change</button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search employee by name or ID..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
              {employees.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {employees.map((emp) => (
                    <button key={emp.id} type="button" onClick={() => selectEmployee(emp)}
                      className="w-full text-left px-4 py-3 hover:bg-surface-50 border-b border-surface-100 last:border-0">
                      <p className="font-medium text-gray-900">{emp.lastName}, {emp.firstName}</p>
                      <p className="text-xs text-gray-500">{emp.employeeId} — {emp.position}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Separation Details */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Separation Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Separation Type *</label>
              <select name="separationType" value={form.separationType}
                onChange={(e) => setForm({ ...form, separationType: e.target.value })} className="input-field" required>
                {Object.values(SeparationType).map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Resignation Date</label>
              <input type="date" value={form.resignationDate}
                onChange={(e) => setForm({ ...form, resignationDate: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Working Day *</label>
              <input type="date" value={form.lastWorkingDay}
                onChange={(e) => setForm({ ...form, lastWorkingDay: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Effective Date</label>
              <input type="date" value={form.effectiveDate}
                onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3} className="input-field" placeholder="Reason for separation..." />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg border border-surface-300 text-gray-700 hover:bg-surface-100">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Create Clearance
          </button>
        </div>
      </form>
    </div>
  );
}
