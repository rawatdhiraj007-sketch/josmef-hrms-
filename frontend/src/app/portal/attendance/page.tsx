'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Clock } from 'lucide-react';

interface Att {
  id: string;
  date: string;
  type: string;
  timeIn?: string;
  timeOut?: string;
  hoursWorked?: number;
  lateMinutes?: number;
  undertimeMinutes?: number;
  remarks?: string;
}

export default function PortalAttendancePage() {
  const [rows, setRows] = useState<Att[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/portal/attendance', { params: { month } })
      .then(r => { setRows(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [month]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Clock className="w-6 h-6 text-rose-600" /> My Attendance</h1>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Time In</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Time Out</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Hours</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Late</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading...</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No records for {month}</td></tr>}
            {rows.map(a => (
              <tr key={a.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">{new Date(a.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 capitalize">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    a.type === 'present' ? 'bg-green-100 text-green-700' :
                    a.type === 'late' ? 'bg-amber-100 text-amber-700' :
                    a.type === 'absent' ? 'bg-red-100 text-red-700' :
                    a.type === 'leave' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                  }`}>{a.type}</span>
                </td>
                <td className="px-4 py-3 text-gray-700">{a.timeIn || '—'}</td>
                <td className="px-4 py-3 text-gray-700">{a.timeOut || '—'}</td>
                <td className="px-4 py-3 text-right">{Number(a.hoursWorked || 0).toFixed(1)}</td>
                <td className="px-4 py-3 text-right text-amber-600">{Number(a.lateMinutes || 0)}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
