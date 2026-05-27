'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Employee, EmploymentStatus } from '@/types/employee';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';

interface Props { employee?: Employee; mode: 'create' | 'edit'; }

const defaults: Record<string, string> = {
  employeeId: '', firstName: '', middleName: '', lastName: '', suffix: '',
  email: '', mobile: '', telephone: '', dateOfBirth: '', gender: '', civilStatus: '',
  nationality: 'Filipino', religion: '', presentAddress: '', permanentAddress: '',
  city: '', province: '', zipCode: '',
  sssNumber: '', philhealthNumber: '', pagibigNumber: '', tinNumber: '',
  position: '', department: '', branch: '', client: '',
  dateHired: new Date().toISOString().split('T')[0], dateRegularized: '',
  contractEndDate: '', dateSeparated: '', employmentStatus: 'probationary',
  employmentType: 'Full-time', payrollType: '',
  basicSalary: '0', dailyRate: '0', allowance: '0',
  emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',
  remarks: '',
};

export default function EmployeeForm({ employee, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    employee ? {
      ...defaults, ...employee,
      dateOfBirth: employee.dateOfBirth?.split('T')[0] || '',
      dateHired: employee.dateHired?.split('T')[0] || '',
      dateRegularized: employee.dateRegularized?.split('T')[0] || '',
      contractEndDate: employee.contractEndDate?.split('T')[0] || '',
      dateSeparated: employee.dateSeparated?.split('T')[0] || '',
      basicSalary: employee.basicSalary?.toString() || '0',
      dailyRate: employee.dailyRate?.toString() || '0',
      allowance: employee.allowance?.toString() || '0',
    } : defaults,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  function h(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError('');
    const payload = {
      ...form,
      basicSalary: parseFloat(form.basicSalary) || 0,
      dailyRate: parseFloat(form.dailyRate) || 0,
      allowance: parseFloat(form.allowance) || 0,
      dateRegularized: form.dateRegularized || undefined,
      contractEndDate: form.contractEndDate || undefined,
      dateSeparated: form.dateSeparated || undefined,
    };
    try {
      if (mode === 'create') await api.post('/employees', payload);
      else await api.put(`/employees/${employee!.id}`, payload);
      router.push('/dashboard/employees');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save');
    } finally { setSubmitting(false); }
  }

  const tabs = ['Personal', 'Address', 'Government', 'Employment', 'Compensation', 'Emergency'];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100"><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
        <h1 className="text-2xl font-bold text-gray-900">{mode === 'create' ? 'Add Employee' : 'Edit Employee'}</h1>
      </div>
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === i ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-surface-100'}`}
          >{t}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal */}
        <div className={`card p-6 mb-6 ${tab !== 0 ? 'hidden' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <F label="Employee ID *" name="employeeId" v={form.employeeId} c={h} required />
            <F label="First Name *" name="firstName" v={form.firstName} c={h} required />
            <F label="Middle Name" name="middleName" v={form.middleName} c={h} />
            <F label="Last Name *" name="lastName" v={form.lastName} c={h} required />
            <F label="Suffix" name="suffix" v={form.suffix} c={h} />
            <F label="Email *" name="email" type="email" v={form.email} c={h} required />
            <F label="Mobile *" name="mobile" v={form.mobile} c={h} required />
            <F label="Telephone" name="telephone" v={form.telephone} c={h} />
            <F label="Date of Birth *" name="dateOfBirth" type="date" v={form.dateOfBirth} c={h} required />
            <Sel label="Gender *" name="gender" v={form.gender} c={h} opts={['Male','Female']} required />
            <Sel label="Civil Status" name="civilStatus" v={form.civilStatus} c={h} opts={['Single','Married','Widowed','Separated']} />
            <F label="Nationality" name="nationality" v={form.nationality} c={h} />
          </div>
        </div>

        {/* Address */}
        <div className={`card p-6 mb-6 ${tab !== 1 ? 'hidden' : ''}`}>
          <div className="grid grid-cols-1 gap-4">
            <F label="Present Address" name="presentAddress" v={form.presentAddress} c={h} />
            <F label="Permanent Address" name="permanentAddress" v={form.permanentAddress} c={h} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <F label="City" name="city" v={form.city} c={h} />
              <F label="Province" name="province" v={form.province} c={h} />
              <F label="Zip Code" name="zipCode" v={form.zipCode} c={h} />
            </div>
          </div>
        </div>

        {/* Government */}
        <div className={`card p-6 mb-6 ${tab !== 2 ? 'hidden' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="SSS Number" name="sssNumber" v={form.sssNumber} c={h} />
            <F label="PhilHealth Number" name="philhealthNumber" v={form.philhealthNumber} c={h} />
            <F label="Pag-IBIG Number" name="pagibigNumber" v={form.pagibigNumber} c={h} />
            <F label="TIN Number" name="tinNumber" v={form.tinNumber} c={h} />
          </div>
        </div>

        {/* Employment */}
        <div className={`card p-6 mb-6 ${tab !== 3 ? 'hidden' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <F label="Position *" name="position" v={form.position} c={h} required />
            <F label="Department *" name="department" v={form.department} c={h} required />
            <F label="Branch" name="branch" v={form.branch} c={h} />
            <F label="Client" name="client" v={form.client} c={h} />
            <F label="Date Hired *" name="dateHired" type="date" v={form.dateHired} c={h} required />
            <F label="Date Regularized" name="dateRegularized" type="date" v={form.dateRegularized} c={h} />
            <F label="Contract End" name="contractEndDate" type="date" v={form.contractEndDate} c={h} />
            <F label="Date Separated" name="dateSeparated" type="date" v={form.dateSeparated} c={h} />
            <Sel label="Status" name="employmentStatus" v={form.employmentStatus} c={h}
              opts={Object.values(EmploymentStatus)} />
            <Sel label="Type" name="employmentType" v={form.employmentType} c={h}
              opts={['Full-time','Part-time','Contractual','Project-based','Seasonal']} />
            <F label="Payroll Type" name="payrollType" v={form.payrollType} c={h} />
          </div>
        </div>

        {/* Compensation */}
        <div className={`card p-6 mb-6 ${tab !== 4 ? 'hidden' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <F label="Basic Salary" name="basicSalary" type="number" v={form.basicSalary} c={h} />
            <F label="Daily Rate" name="dailyRate" type="number" v={form.dailyRate} c={h} />
            <F label="Allowance" name="allowance" type="number" v={form.allowance} c={h} />
          </div>
        </div>

        {/* Emergency */}
        <div className={`card p-6 mb-6 ${tab !== 5 ? 'hidden' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <F label="Contact Name" name="emergencyContactName" v={form.emergencyContactName} c={h} />
            <F label="Relationship" name="emergencyContactRelation" v={form.emergencyContactRelation} c={h} />
            <F label="Phone" name="emergencyContactPhone" v={form.emergencyContactPhone} c={h} />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks</label>
            <textarea name="remarks" value={form.remarks} onChange={h} rows={3} className="input-field" />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg border border-surface-300 text-gray-700 hover:bg-surface-100">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {mode === 'create' ? 'Save' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
}

function F({ label, name, v, c, type = 'text', required = false }: any) {
  return (<div><label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <input type={type} name={name} value={v} onChange={c} className="input-field" required={required} /></div>);
}
function Sel({ label, name, v, c, opts, required = false }: any) {
  return (<div><label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <select name={name} value={v} onChange={c} className="input-field" required={required}>
      <option value="">Select</option>
      {opts.map((o: string) => <option key={o} value={o}>{o.replace(/_/g, ' ').replace(/\b\w/g, (x: string) => x.toUpperCase())}</option>)}
    </select></div>);
}
