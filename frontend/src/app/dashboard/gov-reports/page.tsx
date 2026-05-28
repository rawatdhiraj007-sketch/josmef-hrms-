'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { FileBarChart, Download, Eye } from 'lucide-react';
import Cookies from 'js-cookie';

const REPORTS = [
  { key: 'sss-r3', name: 'SSS R-3', desc: 'Monthly contribution report for Social Security System', period: 'month' },
  { key: 'philhealth-rf1', name: 'PhilHealth RF-1', desc: 'Monthly premium remittance report', period: 'month' },
  { key: 'pagibig-mcrf', name: 'Pag-IBIG MCRF', desc: 'Member Contribution Remittance Form', period: 'month' },
  { key: 'bir-2316', name: 'BIR 2316', desc: 'Annual Certificate of Compensation Payment / Tax Withheld', period: 'year' },
  { key: 'bir-alphalist', name: 'BIR Alphalist 7.1', desc: 'Annual list of employees, taxes, exemptions', period: 'year' },
];

export default function GovReportsPage() {
  const [selected, setSelected] = useState(REPORTS[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadPreview() {
    setLoading(true);
    try {
      const params: any = { year };
      if (selected.period === 'month') params.month = month;
      const r = await api.get(`/gov-reports/${selected.key}`, { params });
      setPreview(r.data);
    } catch {
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    const token = Cookies.get('token');
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const url = selected.period === 'month'
      ? `${baseURL}/gov-reports/${selected.key}?year=${year}&month=${month}&format=csv`
      : `${baseURL}/gov-reports/${selected.key}?year=${year}&format=csv`;
    // Use fetch with auth header, then save as blob
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = selected.period === 'month'
          ? `${selected.key}-${year}-${String(month).padStart(2, '0')}.csv`
          : `${selected.key}-${year}.csv`;
        a.click();
      });
  }

  const cols = preview?.rows?.[0] ? Object.keys(preview.rows[0]) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileBarChart className="w-6 h-6 text-rose-600" /> Government Compliance Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">Philippine statutory reports — SSS, PhilHealth, Pag-IBIG, BIR</p>
      </div>

      {/* Report selector */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {REPORTS.map(r => (
          <button
            key={r.key}
            onClick={() => { setSelected(r); setPreview(null); }}
            className={`text-left p-4 rounded-xl border-2 transition ${
              selected.key === r.key ? 'border-rose-500 bg-rose-50' : 'border-gray-200 bg-white hover:border-rose-200'
            }`}
          >
            <div className="font-semibold text-gray-900">{r.name}</div>
            <div className="text-xs text-gray-500 mt-1">{r.desc}</div>
          </button>
        ))}
      </div>

      {/* Period selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-32"
          />
        </div>
        {selected.period === 'month' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Month</label>
            <select
              value={month}
              onChange={e => setMonth(Number(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
            >
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) =>
                <option key={i} value={i + 1}>{m}</option>
              )}
            </select>
          </div>
        )}
        <button
          onClick={loadPreview}
          disabled={loading}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Eye className="w-4 h-4" /> {loading ? 'Loading...' : 'Preview'}
        </button>
        <button
          onClick={downloadCSV}
          className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download CSV
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div>
              <div className="font-semibold">{preview.form}</div>
              <div className="text-xs text-gray-500">Period: {preview.period} · {preview.rows?.length || 0} rows</div>
            </div>
          </div>
          {preview.rows?.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No payroll data for this period</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {cols.map(c => <th key={c} className="text-left px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      {cols.map(c => (
                        <td key={c} className="px-3 py-2 whitespace-nowrap">
                          {typeof row[c] === 'number' || /\d/.test(String(row[c]))
                            ? row[c]
                            : row[c] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                {preview.totals && (
                  <tfoot className="bg-rose-50 font-semibold">
                    <tr>
                      <td colSpan={cols.length} className="px-3 py-3 text-right">
                        TOTAL: {Object.entries(preview.totals).map(([k, v]: any) =>
                          `${k}=₱${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        ).join('  ·  ')}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
