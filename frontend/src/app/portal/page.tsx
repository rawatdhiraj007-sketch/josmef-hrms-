'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plane, DollarSign, Clock, AlertCircle } from 'lucide-react';

interface MeInfo {
  firstName: string;
  lastName: string;
  position?: string;
  department?: string;
  employmentStatus?: string;
  dateHired?: string;
  contractEndDate?: string;
}

interface Balance {
  leaveType: { code: string; name: string };
  entitled: number;
  used: number;
  remaining: number;
}

interface LeaveReq {
  id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  leaveType: { code: string };
}

export default function PortalHome() {
  const [me, setMe] = useState<MeInfo | null>(null);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [requests, setRequests] = useState<LeaveReq[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [m, b, r] = await Promise.all([
          api.get('/portal/me'),
          api.get('/portal/leave/balances'),
          api.get('/portal/leave/requests'),
        ]);
        setMe(m.data);
        setBalances(b.data);
        setRequests(r.data.rows.slice(0, 5));
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load portal');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <div className="font-semibold text-amber-900">Portal unavailable</div>
          <div className="text-sm text-amber-700 mt-1">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {me?.firstName}!</h1>
        <p className="text-rose-100 mt-1">
          {me?.position} {me?.department && `· ${me.department}`}
        </p>
      </div>

      {/* Leave balances */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Plane className="w-5 h-5 text-rose-600" /> Leave Balances ({new Date().getFullYear()})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {balances.map(b => (
            <div key={b.leaveType.code} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-xs text-gray-500 uppercase">{b.leaveType.code}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {b.remaining}<span className="text-base text-gray-400 font-normal"> / {b.entitled}</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{b.leaveType.name}</div>
            </div>
          ))}
        </div>
        <Link href="/portal/leave" className="inline-block mt-3 text-sm text-rose-600 hover:text-rose-700 font-medium">
          File a leave request →
        </Link>
      </div>

      {/* Recent leaves */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Leave Requests</h2>
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {requests.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">No leave requests yet</div>
          )}
          {requests.map(r => (
            <div key={r.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  {r.leaveType?.code} · {Number(r.totalDays)} day{Number(r.totalDays) > 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                r.status === 'approved' ? 'bg-green-100 text-green-700' :
                r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                r.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
              }`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <QuickLink href="/portal/payslips" icon={DollarSign} label="My Payslips" />
        <QuickLink href="/portal/attendance" icon={Clock} label="My Attendance" />
        <QuickLink href="/portal/profile" icon={Plane} label="Profile" />
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link href={href} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-rose-300 hover:shadow-sm transition">
      <Icon className="w-6 h-6 text-rose-600 mb-2" />
      <div className="font-medium text-gray-900">{label}</div>
    </Link>
  );
}
