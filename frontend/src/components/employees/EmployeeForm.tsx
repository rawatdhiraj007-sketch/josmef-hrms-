'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Employee, EmploymentStatus } from '@/types/employee';
import {
  ArrowLeft, User, MapPin, FileBadge, Briefcase, DollarSign, ShieldAlert,
  RotateCcw, Trash2,
} from 'lucide-react';

import { Button, Input, Select, Textarea, Tabs, useToast } from '@/components/ui';
import { FormSection, FormGrid, FormActions } from '@/components/form';
import type { SaveState } from '@/components/form';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { validate, required as req, email as emailRule, Errors } from '@/lib/validation';

interface Props { employee?: Employee; mode: 'create' | 'edit'; }

type FormShape = Record<string, string>;

const defaults: FormShape = {
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
  const toast = useToast();

  // Initial values from existing employee (edit) or defaults (create)
  const initial: FormShape = employee ? {
    ...defaults, ...employee,
    dateOfBirth: employee.dateOfBirth?.split('T')[0] || '',
    dateHired: employee.dateHired?.split('T')[0] || '',
    dateRegularized: employee.dateRegularized?.split('T')[0] || '',
    contractEndDate: employee.contractEndDate?.split('T')[0] || '',
    dateSeparated: employee.dateSeparated?.split('T')[0] || '',
    basicSalary: employee.basicSalary?.toString() || '0',
    dailyRate: employee.dailyRate?.toString() || '0',
    allowance: employee.allowance?.toString() || '0',
  } as FormShape : defaults;

  // Auto-save draft to localStorage (per-entity key — separate drafts for new vs each edited employee)
  const draftKey = `nn:draft:employee:${employee?.id ?? 'new'}`;
  const {
    values: form, setValues, setField, clearDraft, hasDraft, isDirty, lastSavedAt,
  } = useFormDraft<FormShape>({ key: draftKey, initial });

  const [submitting, setSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [serverError, setServerError] = useState<string>('');
  const [errors, setErrors] = useState<Errors<FormShape>>({});
  const [tab, setTab] = useState('personal');

  // Warn on navigation if dirty + not submitting
  useUnsavedChangesWarning(isDirty && !submitting);

  function set<K extends keyof FormShape>(k: K, v: FormShape[K]) {
    setField(k, v);
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validateAll(): boolean {
    const e = validate(form, {
      employeeId: [req()],
      firstName:  [req()],
      lastName:   [req()],
      email:      [req(), emailRule()],
      mobile:     [req()],
      dateOfBirth: [req()],
      gender:     [req()],
      position:   [req()],
      department: [req()],
      dateHired:  [req()],
    });
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // Jump to the first tab containing an error
      const fieldToTab: Record<string, string> = {
        employeeId: 'personal', firstName: 'personal', lastName: 'personal', email: 'personal',
        mobile: 'personal', dateOfBirth: 'personal', gender: 'personal',
        position: 'employment', department: 'employment', dateHired: 'employment',
      };
      const firstField = Object.keys(e)[0];
      const targetTab = fieldToTab[firstField];
      if (targetTab) setTab(targetTab);
      toast.error('Check the highlighted fields', 'Some required fields are missing or invalid.');
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validateAll()) return;

    setSubmitting(true);
    setSaveState('saving');

    const payload: any = {
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
      clearDraft();
      setSaveState('saved');
      toast.success(mode === 'create' ? 'Employee added' : 'Changes saved');
      router.push('/dashboard/employees');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const message = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to save';
      setServerError(message);
      setSaveState('error');
      toast.error('Save failed', message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    if (isDirty) {
      const ok = window.confirm('Discard unsaved changes?');
      if (!ok) return;
    }
    router.back();
  }

  function handleResetDraft() {
    const ok = window.confirm('Discard the auto-saved draft and start fresh?');
    if (!ok) return;
    clearDraft();
    setValues(initial);
    setErrors({});
    toast.info('Draft discarded');
  }

  return (
    <div className="space-y-5 pb-20">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-colors flex-shrink-0"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight truncate">
              {mode === 'create' ? 'Add Employee' : 'Edit Employee'}
            </h1>
            {mode === 'edit' && employee && (
              <p className="text-xs text-surface-500 truncate">{employee.firstName} {employee.lastName} · {employee.employeeId}</p>
            )}
          </div>
        </div>

        {hasDraft && mode === 'create' && (
          <Button
            type="button" variant="ghost" size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={handleResetDraft}
          >
            Discard draft
          </Button>
        )}
      </div>

      {serverError && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {hasDraft && mode === 'create' && lastSavedAt && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-800 text-xs flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restored from draft saved {new Date(lastSavedAt).toLocaleString()}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'personal',     label: 'Personal',     icon: User },
            { value: 'address',      label: 'Address',      icon: MapPin },
            { value: 'government',   label: 'Government',   icon: FileBadge },
            { value: 'employment',   label: 'Employment',   icon: Briefcase },
            { value: 'compensation', label: 'Compensation', icon: DollarSign },
            { value: 'emergency',    label: 'Emergency',    icon: ShieldAlert },
          ]}
        >
          {(activeTab) => (<>
          {activeTab === 'personal' && (
            <FormSection title="Personal Information" description="Identity and contact details" icon={User}>
              <FormGrid cols={3}>
                <Input label="Employee ID"   required value={form.employeeId}  onChange={(e) => set('employeeId',  e.target.value)} error={errors.employeeId} />
                <Input label="First Name"    required value={form.firstName}   onChange={(e) => set('firstName',   e.target.value)} error={errors.firstName} />
                <Input label="Middle Name"            value={form.middleName}  onChange={(e) => set('middleName',  e.target.value)} />
                <Input label="Last Name"     required value={form.lastName}    onChange={(e) => set('lastName',    e.target.value)} error={errors.lastName} />
                <Input label="Suffix"                 value={form.suffix}      onChange={(e) => set('suffix',      e.target.value)} />
                <Input label="Email" type="email" required value={form.email}  onChange={(e) => set('email',       e.target.value)} error={errors.email} />
                <Input label="Mobile"        required value={form.mobile}      onChange={(e) => set('mobile',      e.target.value)} error={errors.mobile} />
                <Input label="Telephone"              value={form.telephone}   onChange={(e) => set('telephone',   e.target.value)} />
                <Input label="Date of Birth" required type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} error={errors.dateOfBirth} />
                <Select label="Gender" required value={form.gender} onChange={(e) => set('gender', e.target.value)} error={errors.gender}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </Select>
                <Select label="Civil Status" value={form.civilStatus} onChange={(e) => set('civilStatus', e.target.value)}>
                  <option value="">Select</option>
                  {['Single', 'Married', 'Widowed', 'Separated'].map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
                <Input label="Nationality" value={form.nationality} onChange={(e) => set('nationality', e.target.value)} />
              </FormGrid>
            </FormSection>
          )}

          {activeTab === 'address' && (
            <FormSection title="Address" description="Present and permanent residence" icon={MapPin}>
              <FormGrid cols={1}>
                <Input label="Present Address"  value={form.presentAddress}  onChange={(e) => set('presentAddress', e.target.value)} />
                <Input label="Permanent Address" value={form.permanentAddress} onChange={(e) => set('permanentAddress', e.target.value)} />
              </FormGrid>
              <FormGrid cols={3} className="mt-4">
                <Input label="City"     value={form.city}     onChange={(e) => set('city',     e.target.value)} />
                <Input label="Province" value={form.province} onChange={(e) => set('province', e.target.value)} />
                <Input label="Zip Code" value={form.zipCode}  onChange={(e) => set('zipCode',  e.target.value)} />
              </FormGrid>
            </FormSection>
          )}

          {activeTab === 'government' && (
            <FormSection title="Government IDs" description="PH statutory contributions" icon={FileBadge}>
              <FormGrid cols={2}>
                <Input label="SSS Number"        value={form.sssNumber}        onChange={(e) => set('sssNumber',        e.target.value)} />
                <Input label="PhilHealth Number" value={form.philhealthNumber} onChange={(e) => set('philhealthNumber', e.target.value)} />
                <Input label="Pag-IBIG Number"   value={form.pagibigNumber}    onChange={(e) => set('pagibigNumber',    e.target.value)} />
                <Input label="TIN Number"        value={form.tinNumber}        onChange={(e) => set('tinNumber',        e.target.value)} />
              </FormGrid>
            </FormSection>
          )}

          {activeTab === 'employment' && (
            <FormSection title="Employment" description="Role, status, and key dates" icon={Briefcase}>
              <FormGrid cols={3}>
                <Input  label="Position"   required value={form.position}   onChange={(e) => set('position',   e.target.value)} error={errors.position} />
                <Input  label="Department" required value={form.department} onChange={(e) => set('department', e.target.value)} error={errors.department} />
                <Input  label="Branch"              value={form.branch}     onChange={(e) => set('branch',     e.target.value)} />
                <Input  label="Client"              value={form.client}     onChange={(e) => set('client',     e.target.value)} />
                <Input  label="Date Hired"     required type="date" value={form.dateHired}        onChange={(e) => set('dateHired',        e.target.value)} error={errors.dateHired} />
                <Input  label="Date Regularized"        type="date" value={form.dateRegularized}  onChange={(e) => set('dateRegularized',  e.target.value)} />
                <Input  label="Contract End"            type="date" value={form.contractEndDate}  onChange={(e) => set('contractEndDate',  e.target.value)} />
                <Input  label="Date Separated"          type="date" value={form.dateSeparated}    onChange={(e) => set('dateSeparated',    e.target.value)} />
                <Select label="Status"   value={form.employmentStatus} onChange={(e) => set('employmentStatus', e.target.value)}>
                  {Object.values(EmploymentStatus).map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                  ))}
                </Select>
                <Select label="Type"     value={form.employmentType} onChange={(e) => set('employmentType', e.target.value)}>
                  {['Full-time', 'Part-time', 'Contractual', 'Project-based', 'Seasonal'].map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
                <Input  label="Payroll Type" value={form.payrollType} onChange={(e) => set('payrollType', e.target.value)} />
              </FormGrid>
            </FormSection>
          )}

          {activeTab === 'compensation' && (
            <FormSection title="Compensation" description="Salary and allowances" icon={DollarSign}>
              <FormGrid cols={3}>
                <Input type="number" label="Basic Salary" value={form.basicSalary} onChange={(e) => set('basicSalary', e.target.value)} />
                <Input type="number" label="Daily Rate"   value={form.dailyRate}   onChange={(e) => set('dailyRate',   e.target.value)} />
                <Input type="number" label="Allowance"    value={form.allowance}   onChange={(e) => set('allowance',   e.target.value)} />
              </FormGrid>
            </FormSection>
          )}

          {activeTab === 'emergency' && (
            <FormSection title="Emergency Contact" description="Who to call in case of emergency" icon={ShieldAlert}>
              <FormGrid cols={3}>
                <Input label="Contact Name"  value={form.emergencyContactName}     onChange={(e) => set('emergencyContactName',     e.target.value)} />
                <Input label="Relationship"  value={form.emergencyContactRelation} onChange={(e) => set('emergencyContactRelation', e.target.value)} />
                <Input label="Phone"         value={form.emergencyContactPhone}    onChange={(e) => set('emergencyContactPhone',    e.target.value)} />
              </FormGrid>
              <div className="mt-4">
                <Textarea label="Remarks" rows={3} value={form.remarks} onChange={(e) => set('remarks', e.target.value)} />
              </div>
            </FormSection>
          )}
          </>)}
        </Tabs>

        <FormActions
          saveState={saveState}
          lastSavedAt={lastSavedAt}
          dirty={isDirty && saveState !== 'saving'}
          onCancel={handleCancel}
          submitting={submitting}
          submitLabel={mode === 'create' ? 'Save Employee' : 'Update Employee'}
        />
      </form>
    </div>
  );
}
