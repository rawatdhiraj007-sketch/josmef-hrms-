'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, User, Briefcase, DollarSign, Shield, FileWarning,
  AlertTriangle, FileCheck, Loader2, BadgeCheck, Banknote
} from 'lucide-react';
import api from '@/lib/api';

export default function EmployeeTwoOnePage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [disciplinary, setDisciplinary] = useState<any[]>([]);
  const [nte, setNte] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadAll = async () => {
      setLoading(true);
      try {
        const [empRes, loansRes, discRes, nteRes, incRes, certRes, payRes] = await Promise.all([
          api.get(`/employees/${id}`),
          api.get(`/loans?employeeId=${id}&limit=50`),
          api.get(`/disciplinary?employeeId=${id}&limit=50`),
          api.get(`/nte?employeeId=${id}&limit=50`),
          api.get(`/incident-reports?involvedEmployeeId=${id}&limit=50`),
          api.get(`/work-certificates?employeeId=${id}&limit=50`),
          api.get(`/payroll?employeeId=${id}&limit=12`),
        ]);
        setEmployee(empRes.data);
        setLoans(loansRes.data.data);
        setDisciplinary(discRes.data.data);
        setNte(nteRes.data.data);
        setIncidents(incRes.data.data);
        setCertificates(certRes.data.data);
        setPayroll(payRes.data.data);
      } catch { } finally { setLoading(false); }
    };
    loadAll();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!employee) return <div className="p-6 text-gray-500">Employee not found.</div>;

  const fmt = (v: number) => `₱${Number(v || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
  const fmtDate = (d: any) => d ? new Date(d).toLocaleDateString('en-PH') : '-';
  const totalLoan = loans.filter(l => l.status === 'active').reduce((s, l) => s + Number(l.outstandingBalance || 0), 0);

  const SectionCard = ({ title, icon: Icon, children, count }: any) => (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 text-brand-600" />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {count !== undefined && (
          <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">{count}</span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push(`/dashboard/employees/${id}`)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Employee
        </button>
      </div>

      {/* Employee Identity */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-white/20 text-white text-sm font-mono px-3 py-1 rounded-lg">{employee.employeeId}</span>
              <span className="bg-white/20 text-white text-sm px-3 py-1 rounded-lg capitalize">{employee.employmentStatus?.replace('_', ' ')}</span>
            </div>
            <h1 className="text-3xl font-bold mt-2">
              {employee.firstName} {employee.middleName ? employee.middleName + ' ' : ''}{employee.lastName}{employee.suffix ? ` ${employee.suffix}` : ''}
            </h1>
            <p className="text-brand-200 mt-1">{employee.position} · {employee.department}</p>
            {employee.branch && <p className="text-brand-200 text-sm">{employee.branch}</p>}
          </div>
          <div className="text-right">
            <div className="text-brand-200 text-sm">Date Hired</div>
            <div className="text-white font-semibold">{fmtDate(employee.dateHired)}</div>
            <div className="text-brand-200 text-sm mt-3">Basic Salary</div>
            <div className="text-white font-semibold">{fmt(employee.basicSalary)}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Loans', value: `${loans.filter(l => l.status === 'active').length}`, sub: `${fmt(totalLoan)} outstanding`, color: 'text-orange-600' },
          { label: 'Disciplinary Records', value: disciplinary.length, sub: `${disciplinary.filter(d => d.status === 'open').length} open`, color: 'text-red-600' },
          { label: 'NTE Records', value: nte.length, sub: `${nte.filter(n => n.status === 'issued').length} pending reply`, color: 'text-yellow-600' },
          { label: 'Incidents', value: incidents.length, sub: `${incidents.filter(i => i.status !== 'closed').length} open`, color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm font-medium text-gray-900 mt-1">{stat.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <SectionCard title="Personal Information" icon={User}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Date of Birth', fmtDate(employee.dateOfBirth)],
              ['Gender', employee.gender],
              ['Civil Status', employee.civilStatus],
              ['Nationality', employee.nationality],
              ['Mobile', employee.mobile],
              ['Email', employee.email],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-xs text-gray-500">{label}</dt>
                <dd className="text-gray-900 font-medium mt-0.5">{value || '-'}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        {/* Government IDs */}
        <SectionCard title="Government IDs" icon={BadgeCheck}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['SSS Number', employee.sssNumber],
              ['PhilHealth Number', employee.philhealthNumber],
              ['Pag-IBIG Number', employee.pagibigNumber],
              ['TIN', employee.tinNumber],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-xs text-gray-500">{label}</dt>
                <dd className="text-gray-900 font-medium mt-0.5 font-mono text-xs">{value || '-'}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      </div>

      {/* Loans */}
      <SectionCard title="Loans" icon={Banknote} count={loans.length}>
        {loans.length === 0 ? <p className="text-gray-500 text-sm">No loan records.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left pb-2 text-xs text-gray-500 font-medium">Type</th>
              <th className="text-right pb-2 text-xs text-gray-500 font-medium">Principal</th>
              <th className="text-right pb-2 text-xs text-gray-500 font-medium">Outstanding</th>
              <th className="text-right pb-2 text-xs text-gray-500 font-medium">Monthly</th>
              <th className="text-center pb-2 text-xs text-gray-500 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loans.map(l => (
                <tr key={l.id}>
                  <td className="py-2 text-gray-700">{l.loanType?.replace('_', ' ')}</td>
                  <td className="py-2 text-right text-gray-700">{fmt(l.principalAmount)}</td>
                  <td className="py-2 text-right font-medium text-gray-900">{fmt(l.outstandingBalance)}</td>
                  <td className="py-2 text-right text-gray-700">{fmt(l.monthlyAmortization)}</td>
                  <td className="py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${l.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{l.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Disciplinary */}
      <SectionCard title="Disciplinary Actions" icon={Shield} count={disciplinary.length}>
        {disciplinary.length === 0 ? <p className="text-gray-500 text-sm">No disciplinary records.</p> : (
          <div className="space-y-3">
            {disciplinary.map(d => (
              <div key={d.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full capitalize">{d.type?.replace('_', ' ')}</span>
                    <p className="text-sm font-medium text-gray-900 mt-2">{d.offense}</p>
                    <p className="text-xs text-gray-500 mt-1">Incident: {fmtDate(d.incidentDate)}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${d.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{d.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* NTE */}
      <SectionCard title="Notice to Explain (NTE)" icon={FileWarning} count={nte.length}>
        {nte.length === 0 ? <p className="text-gray-500 text-sm">No NTE records.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left pb-2 text-xs text-gray-500">NTE #</th>
              <th className="text-left pb-2 text-xs text-gray-500">Subject</th>
              <th className="text-left pb-2 text-xs text-gray-500">Date Issued</th>
              <th className="text-left pb-2 text-xs text-gray-500">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {nte.map(n => (
                <tr key={n.id}>
                  <td className="py-2 font-mono text-xs text-brand-700">{n.nteNumber || '-'}</td>
                  <td className="py-2 text-gray-700">{n.subject}</td>
                  <td className="py-2 text-gray-600">{fmtDate(n.dateIssued)}</td>
                  <td className="py-2"><span className="capitalize text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{n.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Incident Reports */}
      <SectionCard title="Incident Reports" icon={AlertTriangle} count={incidents.length}>
        {incidents.length === 0 ? <p className="text-gray-500 text-sm">No incident reports.</p> : (
          <div className="space-y-3">
            {incidents.map(i => (
              <div key={i.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{i.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Date: {fmtDate(i.incidentDate)} · Report: {i.reportNumber}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${i.severity === 'critical' ? 'bg-red-100 text-red-700' : i.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>{i.severity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Work Certificates */}
      <SectionCard title="Work Certificates" icon={FileCheck} count={certificates.length}>
        {certificates.length === 0 ? <p className="text-gray-500 text-sm">No certificate requests.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left pb-2 text-xs text-gray-500">Cert #</th>
              <th className="text-left pb-2 text-xs text-gray-500">Type</th>
              <th className="text-left pb-2 text-xs text-gray-500">Date Requested</th>
              <th className="text-left pb-2 text-xs text-gray-500">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {certificates.map(c => (
                <tr key={c.id}>
                  <td className="py-2 font-mono text-xs text-brand-700">{c.certificateNumber || '-'}</td>
                  <td className="py-2 text-gray-700 text-xs">{c.certificateType?.replace('_', ' ')}</td>
                  <td className="py-2 text-gray-600">{fmtDate(c.requestDate)}</td>
                  <td className="py-2"><span className={`capitalize text-xs px-2 py-0.5 rounded-full ${c.status === 'released' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Recent Payroll */}
      <SectionCard title="Recent Payroll (Last 12 periods)" icon={DollarSign} count={payroll.length}>
        {payroll.length === 0 ? <p className="text-gray-500 text-sm">No payroll records.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left pb-2 text-xs text-gray-500">Pay Period</th>
              <th className="text-right pb-2 text-xs text-gray-500">Gross</th>
              <th className="text-right pb-2 text-xs text-gray-500">Deductions</th>
              <th className="text-right pb-2 text-xs text-gray-500">Net Pay</th>
              <th className="text-center pb-2 text-xs text-gray-500">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {payroll.map(p => (
                <tr key={p.id}>
                  <td className="py-2 text-gray-700">{p.payPeriod?.replace('_', ' to ')}</td>
                  <td className="py-2 text-right text-gray-700">{fmt(p.grossPay)}</td>
                  <td className="py-2 text-right text-gray-700">{fmt(p.totalDeductions)}</td>
                  <td className="py-2 text-right font-semibold text-gray-900">{fmt(p.netPay)}</td>
                  <td className="py-2 text-center">
                    <span className={`capitalize text-xs px-2 py-0.5 rounded-full ${p.status === 'released' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
