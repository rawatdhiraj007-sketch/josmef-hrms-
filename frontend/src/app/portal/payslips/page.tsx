'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { DollarSign, Download } from 'lucide-react';

interface Payslip {
  id: string;
  periodStart?: string;
  periodEnd?: string;
  cutoff?: string;
  basicPay?: string | number;
  grossPay?: string | number;
  netPay?: string | number;
  totalDeductions?: string | number;
}

function formatPHP(n: any) {
  const v = Number(n) || 0;
  return '₱' + v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PortalPayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/portal/payslips').then(r => {
      setPayslips(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><DollarSign className="w-6 h-6 text-rose-600" /> My Payslips</h1>
        <p className="text-gray-500 text-sm mt-1">Your salary history and earnings breakdown</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Period</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Cutoff</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Basic Pay</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Gross Pay</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Deductions</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Net Pay</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="py-8 text-center text-gray-400">Loading...</td></tr>}
            {!loading && payslips.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-gray-400">No payslips yet</td></tr>
            )}
            {payslips.map(p => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  {p.periodStart && p.periodEnd
                    ? `${new Date(p.periodStart).toLocaleDateString()} – ${new Date(p.periodEnd).toLocaleDateString()}`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-gray-700">{p.cutoff || '—'}</td>
                <td className="px-4 py-3 text-right">{formatPHP(p.basicPay)}</td>
                <td className="px-4 py-3 text-right">{formatPHP(p.grossPay)}</td>
                <td className="px-4 py-3 text-right text-red-600">{formatPHP(p.totalDeductions)}</td>
                <td className="px-4 py-3 text-right font-bold text-green-700">{formatPHP(p.netPay)}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-rose-600 hover:text-rose-700"
                    onClick={() => window.print()}
                    title="Print"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
