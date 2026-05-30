'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Employee, Document201, DocumentCategory } from '@/types/employee';
import {
  Pencil, Mail, Phone, Briefcase, Calendar, MapPin, Shield, FileText,
  CheckCircle, Trash2, ExternalLink, Archive, BookOpen, Loader2,
  UserPlus, ClipboardList, MessageSquare, History, User, Building2,
  DollarSign, AlertCircle, StickyNote,
} from 'lucide-react';

import { Button, Badge, Card, Modal, Input, Select, Textarea, Tabs, useToast } from '@/components/ui';
import {
  DetailHeader, InfoRow, Timeline, StickyActionBar, type TimelineEvent,
} from '@/components/detail';
import { FilterSelect } from '@/components/data/DataToolbar';
import IfRole from '@/components/auth/IfRole';

// ─── Status → Badge variant mapping (theme-aware) ───
const STATUS_VARIANT: Record<string, 'warning' | 'success' | 'neutral' | 'danger' | 'info'> = {
  probationary:    'warning',
  regular:         'success',
  resigned:        'neutral',
  terminated:      'danger',
  end_of_contract: 'warning',
  awol:            'danger',
};

const SEPARATION_REASONS = [
  'resigned', 'terminated', 'end_of_contract', 'retired',
  'awol', 'redundancy', 'retrenchment', 'death', 'other',
];

export default function ViewEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const toast  = useToast();

  const [data, setData] = useState<Employee | null>(null);
  const [docs, setDocs] = useState<Document201[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<string>('overview');
  const [catFilter, setCatFilter] = useState('');

  const [showArchive, setShowArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [archiveForm, setArchiveForm] = useState({
    separationReason: 'resigned',
    dateSeparated: new Date().toISOString().split('T')[0],
    separationDetails: '',
    finalPay: '',
    remarks: '',
  });

  useEffect(() => {
    Promise.all([
      api.get(`/employees/${params.id}`),
      api.get(`/documents/employee/${params.id}`),
    ])
      .then(([empRes, docRes]) => {
        setData(empRes.data);
        setDocs(docRes.data);
      })
      .catch(() => toast.error('Employee not found'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleArchive(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm('Archive this employee as a Former Employee? This action will mark them as separated.')) return;
    setArchiving(true);
    try {
      await api.post(`/employees/${params.id}/archive`, {
        ...archiveForm,
        finalPay: archiveForm.finalPay ? Number(archiveForm.finalPay) : 0,
      });
      setShowArchive(false);
      toast.success('Employee archived', 'Marked as Former Employee.');
      router.push('/dashboard/former-employees');
    } catch {
      toast.error('Archive failed', 'Please try again.');
    } finally {
      setArchiving(false);
    }
  }

  async function handleDeleteDoc(docId: string) {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setDocs((prev) => prev.filter((d) => d.id !== docId));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  }

  // ── Activity derived from entity data (no backend changes) ──
  const activity: TimelineEvent[] = useMemo(() => {
    if (!data) return [];
    const events: TimelineEvent[] = [];
    if ((data as any).createdAt) {
      events.push({
        id: 'created', icon: UserPlus, variant: 'success',
        title: 'Profile created',
        description: 'Employee record added to the system.',
        timestamp: (data as any).createdAt,
      });
    }
    if (data.dateHired) {
      events.push({
        id: 'hired', icon: Briefcase, variant: 'brand',
        title: 'Hired',
        description: `Started as ${data.position}${data.department ? ` in ${data.department}` : ''}.`,
        timestamp: data.dateHired,
      });
    }
    if (data.dateRegularized) {
      events.push({
        id: 'regularized', icon: CheckCircle, variant: 'success',
        title: 'Regularized',
        description: 'Probationary period completed.',
        timestamp: data.dateRegularized,
      });
    }
    if (data.contractEndDate) {
      const isPast = new Date(data.contractEndDate) < new Date();
      events.push({
        id: 'contract', icon: Calendar, variant: isPast ? 'warning' : 'info',
        title: isPast ? 'Contract ended' : 'Contract end scheduled',
        timestamp: data.contractEndDate,
      });
    }
    if (data.dateSeparated) {
      events.push({
        id: 'separated', icon: AlertCircle, variant: 'danger',
        title: 'Separated',
        description: data.employmentStatus.replace(/_/g, ' '),
        timestamp: data.dateSeparated,
      });
    }
    if ((data as any).updatedAt && (data as any).updatedAt !== (data as any).createdAt) {
      events.push({
        id: 'updated', icon: History, variant: 'neutral',
        title: 'Profile updated',
        description: 'Details were edited.',
        timestamp: (data as any).updatedAt,
      });
    }
    // Documents — one event per doc
    docs.forEach((d) => {
      events.push({
        id: `doc-${d.id}`,
        icon: FileText, variant: 'info',
        title: `Document added: ${d.documentName}`,
        description: d.category.replace(/_/g, ' '),
        timestamp: (d as any).createdAt ?? d.documentDate,
        trailing: d.isVerified ? <Badge variant="success" size="sm" dot>Verified</Badge> : undefined,
      });
    });
    return events;
  }, [data, docs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-rose-600 text-sm">Employee not found</p>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mt-3">Go back</Button>
      </div>
    );
  }

  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
  const filteredDocs = catFilter ? docs.filter((d) => d.category === catFilter) : docs;
  const filteredCount = filteredDocs.length;

  return (
    <div className="space-y-5 pb-24">
      <DetailHeader
        eyebrow={data.employeeId}
        title={fullName}
        avatarName={fullName}
        subtitle={
          <div className="flex items-center gap-2 flex-wrap">
            <Briefcase className="w-3.5 h-3.5 text-surface-400" />
            <span>{data.position}{data.department ? ` · ${data.department}` : ''}</span>
          </div>
        }
        badge={
          <Badge variant={STATUS_VARIANT[data.employmentStatus] ?? 'neutral'} dot>
            {data.employmentStatus.replace(/_/g, ' ')}
          </Badge>
        }
        actions={
          <>
            <Button
              variant="secondary" size="sm"
              leftIcon={<BookOpen className="w-3.5 h-3.5" />}
              onClick={() => router.push(`/dashboard/employees/${data.id}/201`)}
            >
              201 File
            </Button>
            <IfRole can="employees.archive">
              <Button
                variant="danger" size="sm"
                leftIcon={<Archive className="w-3.5 h-3.5" />}
                onClick={() => setShowArchive(true)}
              >
                Archive
              </Button>
            </IfRole>
            <Button
              variant="primary" size="sm"
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
              onClick={() => router.push(`/dashboard/employees/${data.id}/edit`)}
            >
              Edit
            </Button>
          </>
        }
      />

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'overview',  label: 'Overview',  icon: User },
          { value: 'documents', label: 'Documents', icon: FileText, count: docs.length },
          { value: 'activity',  label: 'Activity',  icon: History,  count: activity.length },
          { value: 'notes',     label: 'Notes',     icon: StickyNote },
        ]}
      >
        {(active) => (
          <>
            {/* ── OVERVIEW ── */}
            {active === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Card>
                  <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-600" /> Personal Information
                  </h2>
                  <div className="space-y-3">
                    <InfoRow icon={Mail}     label="Email"        value={data.email} />
                    <InfoRow icon={Phone}    label="Mobile"       value={data.mobile} mono />
                    <InfoRow icon={Phone}    label="Telephone"    value={data.telephone} mono />
                    <InfoRow icon={Calendar} label="Birthday"     value={data.dateOfBirth?.split('T')[0]} />
                    <InfoRow                 label="Gender"       value={data.gender} />
                    <InfoRow                 label="Civil Status" value={data.civilStatus} />
                    <InfoRow                 label="Nationality"  value={data.nationality} />
                  </div>
                </Card>

                <Card>
                  <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" /> Address
                  </h2>
                  <div className="space-y-3">
                    <InfoRow icon={MapPin} label="Present"   value={data.presentAddress} />
                    <InfoRow icon={MapPin} label="Permanent" value={data.permanentAddress} />
                    <InfoRow               label="City"      value={[data.city, data.province, data.zipCode].filter(Boolean).join(', ')} />
                  </div>
                </Card>

                <Card>
                  <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary-600" /> Government IDs
                  </h2>
                  <div className="space-y-3">
                    <InfoRow icon={Shield} label="SSS"        value={data.sssNumber}        mono />
                    <InfoRow               label="PhilHealth" value={data.philhealthNumber} mono />
                    <InfoRow               label="Pag-IBIG"   value={data.pagibigNumber}    mono />
                    <InfoRow               label="TIN"        value={data.tinNumber}        mono />
                  </div>
                </Card>

                <Card>
                  <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary-600" /> Employment
                  </h2>
                  <div className="space-y-3">
                    <InfoRow icon={Briefcase} label="Position"    value={data.position} />
                    <InfoRow                  label="Department"  value={data.department} />
                    <InfoRow                  label="Branch"      value={data.branch} />
                    <InfoRow                  label="Client"      value={data.client} />
                    <InfoRow icon={Calendar}  label="Date Hired"  value={data.dateHired?.split('T')[0]} />
                    <InfoRow                  label="Regularized" value={data.dateRegularized?.split('T')[0]} />
                    <InfoRow                  label="Contract End" value={data.contractEndDate?.split('T')[0]} />
                    <InfoRow                  label="Type"        value={data.employmentType} />
                  </div>
                </Card>

                <Card>
                  <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary-600" /> Compensation
                  </h2>
                  <div className="space-y-3">
                    <InfoRow label="Basic Salary" value={fmtPHP(data.basicSalary)} mono />
                    <InfoRow label="Daily Rate"   value={fmtPHP(data.dailyRate)}   mono />
                    <InfoRow label="Allowance"    value={fmtPHP(data.allowance)}   mono />
                  </div>
                </Card>

                <Card>
                  <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary-600" /> Emergency Contact
                  </h2>
                  <div className="space-y-3">
                    <InfoRow              label="Name"     value={data.emergencyContactName} />
                    <InfoRow              label="Relation" value={data.emergencyContactRelation} />
                    <InfoRow icon={Phone} label="Phone"    value={data.emergencyContactPhone} mono />
                  </div>
                </Card>
              </div>
            )}

            {/* ── DOCUMENTS ── */}
            {active === 'documents' && (
              <Card padding="none">
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-surface-100">
                  <h2 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary-600" /> 201 File
                    <span className="text-xs text-surface-500 font-normal">({filteredCount} of {docs.length})</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <FilterSelect value={catFilter} onChange={setCatFilter} ariaLabel="Filter by category">
                      <option value="">All categories</option>
                      {Object.values(DocumentCategory).map((c) => (
                        <option key={c} value={c}>
                          {c.replace(/_/g, ' ').replace(/\b\w/g, (x) => x.toUpperCase())}
                        </option>
                      ))}
                    </FilterSelect>
                    <Button
                      variant="primary" size="sm"
                      leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                      onClick={() => router.push(`/dashboard/employees/${data.id}/201`)}
                    >
                      Manage
                    </Button>
                  </div>
                </div>

                {filteredDocs.length === 0 ? (
                  <div className="py-16 text-center">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-surface-300" />
                    <p className="text-sm font-medium text-surface-700">No documents{catFilter ? ' in this category' : ' uploaded yet'}</p>
                    <p className="text-xs text-surface-500 mt-1">Add files via the 201 File workspace.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-surface-100">
                    {filteredDocs.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-50/60 transition-colors">
                        <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-surface-900 truncate">{d.documentName}</p>
                          <div className="flex items-center gap-2 text-2xs text-surface-500 mt-0.5 flex-wrap">
                            <Badge variant="neutral" size="sm">{d.category.replace(/_/g, ' ')}</Badge>
                            {d.documentDate && <span className="tabular-nums">{d.documentDate.split('T')[0]}</span>}
                            {d.isVerified && (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle className="w-3 h-3" /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {d.fileUrl && (
                            <a
                              href={d.fileUrl} target="_blank" rel="noopener"
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-surface-100 hover:text-primary-600 transition-colors"
                              aria-label="Open"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            type="button" onClick={() => handleDeleteDoc(d.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {/* ── ACTIVITY ── */}
            {active === 'activity' && (
              <Card>
                <h2 className="text-sm font-semibold text-surface-900 mb-5 flex items-center gap-2">
                  <History className="w-4 h-4 text-primary-600" /> Activity History
                </h2>
                <Timeline
                  events={activity}
                  emptyTitle="No activity yet"
                  emptyDescription="Key events like hiring, regularization, and document uploads will appear here."
                />
              </Card>
            )}

            {/* ── NOTES ── */}
            {active === 'notes' && (
              <Card>
                <h2 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-600" /> Notes &amp; Remarks
                </h2>
                {data.remarks ? (
                  <div className="px-4 py-3 rounded-xl bg-surface-50 border border-surface-100">
                    <p className="text-sm text-surface-800 whitespace-pre-wrap leading-relaxed">{data.remarks}</p>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <StickyNote className="w-10 h-10 mx-auto mb-3 text-surface-300" />
                    <p className="text-sm font-medium text-surface-700">No notes yet</p>
                    <p className="text-xs text-surface-500 mt-1">Add notes by editing this employee.</p>
                    <Button
                      variant="ghost" size="sm" className="mt-4"
                      leftIcon={<Pencil className="w-3.5 h-3.5" />}
                      onClick={() => router.push(`/dashboard/employees/${data.id}/edit`)}
                    >
                      Add notes
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </Tabs>

      {/* Sticky action bar — keeps actions in reach on long pages */}
      <StickyActionBar
        hideOnMobile
        context={
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{fullName}</span>
            <Badge variant={STATUS_VARIANT[data.employmentStatus] ?? 'neutral'} size="sm">
              {data.employmentStatus.replace(/_/g, ' ')}
            </Badge>
          </div>
        }
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/employees')}>Back to list</Button>
            <Button
              variant="secondary" size="sm"
              leftIcon={<BookOpen className="w-3.5 h-3.5" />}
              onClick={() => router.push(`/dashboard/employees/${data.id}/201`)}
            >
              201 File
            </Button>
            <Button
              variant="primary" size="sm"
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
              onClick={() => router.push(`/dashboard/employees/${data.id}/edit`)}
            >
              Edit
            </Button>
          </>
        }
      />

      {/* Archive Modal — uses new design system */}
      <Modal
        open={showArchive}
        onClose={() => setShowArchive(false)}
        title="Archive Employee"
        description="Convert this employee into a Former Employee record."
        size="md"
      >
        <form onSubmit={handleArchive} className="space-y-4">
          <Select
            label="Separation Reason" required
            value={archiveForm.separationReason}
            onChange={(e) => setArchiveForm((f) => ({ ...f, separationReason: e.target.value }))}
          >
            {SEPARATION_REASONS.map((r) => (
              <option key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
            ))}
          </Select>

          <Input
            type="date" label="Date Separated"
            value={archiveForm.dateSeparated}
            onChange={(e) => setArchiveForm((f) => ({ ...f, dateSeparated: e.target.value }))}
          />

          <Input
            type="number" label="Final Pay (₱)" placeholder="0.00"
            value={archiveForm.finalPay}
            onChange={(e) => setArchiveForm((f) => ({ ...f, finalPay: e.target.value }))}
          />

          <Textarea
            label="Details / Remarks" rows={3}
            placeholder="Additional details about the separation…"
            value={archiveForm.separationDetails}
            onChange={(e) => setArchiveForm((f) => ({ ...f, separationDetails: e.target.value }))}
          />

          <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            This will create a Former Employee record (FMR-YYYY-NNN) and mark the employee as separated.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowArchive(false)}>Cancel</Button>
            <Button type="submit" variant="danger" size="sm" loading={archiving}>
              {archiving ? 'Archiving…' : 'Confirm Archive'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function fmtPHP(n: any): string {
  const num = Number(n);
  if (!isFinite(num) || num === 0) return '—';
  return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}
