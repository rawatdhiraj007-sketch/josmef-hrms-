'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BarChart3, TrendingUp, Users, Plane, Clock, Building2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface Overview {
  trend: { month: string; headcount: number }[];
  cost: { month: string; gross: number; net: number; tax: number }[];
  leave: { code: string; name: string; daysApproved: number; daysPending: number; requestCount: number }[];
  attendance: { type: string; count: number }[];
  dept: { department: string; headcount: number }[];
  funnel: { status: string; count: number }[];
}

const COLORS = ['#e11d48', '#ec4899', '#a855f7', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading analytics...</div>;
  if (!data) return <div className="text-center py-20 text-gray-400">Failed to load data</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-rose-600" /> Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">Real-time HR metrics and trends</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Headcount trend */}
        <ChartCard title="Headcount Trend" icon={Users} subtitle="Last 12 months">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="headcount" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Payroll cost */}
        <ChartCard title="Payroll Cost" icon={TrendingUp} subtitle="Gross, Net, Tax by month">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.cost}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v: any) => `₱${Number(v).toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="gross" fill="#e11d48" name="Gross" />
              <Bar dataKey="net" fill="#10b981" name="Net" />
              <Bar dataKey="tax" fill="#f59e0b" name="Tax" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Leave usage */}
        <ChartCard title="Leave Usage This Year" icon={Plane} subtitle="By leave type (days approved)">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.leave} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="code" tick={{ fontSize: 11 }} width={50} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="daysApproved" fill="#ec4899" name="Approved Days" />
              <Bar dataKey="daysPending" fill="#fbbf24" name="Pending Days" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Attendance this month */}
        <ChartCard title="Attendance Breakdown" icon={Clock} subtitle="This month">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.attendance}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(e: any) => `${e.type} (${e.count})`}
                labelLine={false}
                fontSize={11}
              >
                {data.attendance.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Department */}
        <ChartCard title="Department Distribution" icon={Building2} subtitle="Active employees">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.dept} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="department" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="headcount" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Applicant funnel */}
        <ChartCard title="Applicant Funnel" icon={Users} subtitle="Current pipeline">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data.funnel}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(e: any) => `${e.status} (${e.count})`}
                labelLine={false}
                fontSize={11}
              >
                {data.funnel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, subtitle, children }: { title: string; icon: any; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-rose-600" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}
