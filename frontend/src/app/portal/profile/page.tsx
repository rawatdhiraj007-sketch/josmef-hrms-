'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { User } from 'lucide-react';

export default function PortalProfilePage() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    api.get('/portal/me').then(r => setMe(r.data));
  }, []);

  if (!me) return <div className="text-center py-8 text-gray-400">Loading...</div>;

  const fields = [
    ['Employee ID', me.employeeId],
    ['First Name', me.firstName],
    ['Middle Name', me.middleName],
    ['Last Name', me.lastName],
    ['Email', me.email],
    ['Mobile', me.mobile],
    ['Position', me.position],
    ['Department', me.department],
    ['Employment Status', me.employmentStatus],
    ['Date Hired', me.dateHired ? new Date(me.dateHired).toLocaleDateString() : '—'],
    ['Contract End', me.contractEndDate ? new Date(me.contractEndDate).toLocaleDateString() : '—'],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-rose-600" /> My Profile</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {fields.map(([label, value]) => (
            <div key={label}>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
              <div className="text-gray-900 font-medium mt-0.5">{value || '—'}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6 pt-6 border-t border-gray-100">
          To update your information, please contact HR.
        </p>
      </div>
    </div>
  );
}
