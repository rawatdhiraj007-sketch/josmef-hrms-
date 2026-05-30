'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Applicant } from '@/types/applicant';
import {
  Pencil, Mail, Phone, MapPin, Briefcase, Calendar, GraduationCap, Loader2,
  User, History, FileText, MessageSquare, StickyNote, UserPlus, ClipboardList,
  DollarSign, CheckCircle, XCircle, Inbox, ArrowRight,
} from 'lucide-react';

import { Button, Badge, Card, Modal, Input, Textarea, Tabs, useToast } from '@/components/ui';
import {
  DetailHeader, InfoRow, Timeline, StickyActionBar, type TimelineEvent,
} from '@/components/detail';

const STATUS_VARIANT: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'neutral' | 'brand'> = {
  new:              'info',
  screening:        'warning',
  interview:        'brand',
  exam:             'brand',
  for_requirements: 'warning',
  approved:         'success',
  rejected:         'danger',
  pooled:           'neutral',
  withdrawn:        'neutral',
};

export default function ViewApplicantPage() {
  const params = useParams();
  const router = useRouter();
  const toast  = useToast();

  const [data, setData] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('overview');

  const [showConvert, setShowConvert] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertForm, setConvertForm] = useState({
    trainingStartDate: new Date().toISOString().split('T')[0],
    trainingProgram: '', trainingLocation: '', trainer: '',
  });

  useEffect(() => {
    api.get(`/applicants/${params.id}`)
      .then((res) => setData(res.data))
      .catch(() => toast.error('Applicant not found'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setConverting(true);
    try {
      const res = await api.post(`/trainees/from-applicant/${data!.id}`, convertForm);
      setShowConvert(false);
      toast.success('Converted to Trainee');
      router.push(`/dashboard/trainees/${res.data.id}`);
    } catch {
      toast.error('Conversion failed', 'The applicant may already be a trainee.');
    } finally {
      setConverting(false);
    }
  }

  // ── Activity derived from entity data ──
  const activity: TimelineEvent[] = useMemo(() => {
    if (!data) return [];
    const events: TimelineEvent[] = [];
    if ((data as any).createdAt) {
      events.push({
        id: 'created', icon: UserPlus, variant: 'info',
        title: 'Application received',
        description: `Applied for ${data.positionApplied}.`,
        timestamp: (data as any).createdAt,
      });
    }
    if (data.applicationDate) {
      events.push({
        id: 'app-date', icon: ClipboardList, variant: 'brand',
        title: 'Application logged',
        timestamp: data.applicationDate,
      });
    }
    if (data.interviewDate) {
      const isPast = new Date(data.interviewDate) < new Date();
      events.push({
        id: 'interview', icon: User, variant: isPast ? 'success' : 'warning',
        title: isPast ? 'Interview held' : 'Interview scheduled',
        timestamp: data.interviewDate,
      });
    }
    if (data.status === 'approved') {
      events.push({
        id: 'status-approved', icon: CheckCircle, variant: 'success',
        title: 'Approved',
        timestamp: (data as any).updatedAt,
      });
    }
    if (data.status === 'rejected') {
      events.push({
        id: 'status-rejected', icon: XCircle, variant: 'danger',
        title: 'Rejected',
        timestamp: (data as any).updatedAt,
      });
    }
    if ((data as any).updatedAt && (data as any).updatedAt !== (data as any).createdAt) {
      events.push({
        id: 'updated', icon: History, variant: 'neutral',
        title: 'Profile updated',
        timestamp: (data as any).updatedAt,
      });
    }
    return events;
  }, [data]);

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
        <p className="text-rose-600 text-sm">Applicant not found</p>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mt-3">Go back</Button>
      </div>
    );
  }

  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
  const refNumber = (data as any).applicantNumber;
  const canConvert = data.status !== 'rejected' && data.status !== 'withdrawn';

  return (
    <div className="space-y-5 pb-24">
      <DetailHeader
        eyebrow={refNumber}
        title={fullName}
        avatarName={fullName}
        subtitle={
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-surface-400" />
            <span>{data.positionApplied}{data.department ? ` · ${data.department}` : ''}</span>
          </div>
        }
        badge={
          <Badge variant={STATUS_VARIANT[data.status] ?? 'neutral'} dot>
            {data.status.replace(/_/g, ' ')}
          </Badge>
        }
        actions={
          <>
            {canConvert && (
              <Button
                variant="success" size="sm"
                leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
                onClick={() => setShowConvert(true)}
              >
                Convert to Trainee
              </Button>
            )}
            <Button
              variant="primary" size="sm"
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
              onClick={() => router.push(`/dashboard/applicants/${data.id}/edit`)}
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
          { value: 'documents', label: 'Documents', icon: FileText },
          { value: 'activity',  label: 'Activity',  icon: History, count: activity.length },
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
                    <InfoRow icon={Mail}     label="Email"         value={data.email} />
                    <InfoRow icon={Phone}    label="Mobile"        value={data.mobile} mono />
                    <InfoRow icon={Calendar} label="Date of Birth" value={data.dateOfBirth?.split('T')[0]} />
                    <InfoRow                 label="Gender"        value={data.gender} />
                    <InfoRow icon={MapPin}   label="Address"
                      value={[data.address, data.city, data.province, data.zipCode].filter(Boolean).join(', ')}
                    />
                  </div>
                </Card>

                <Card>
                  <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary-600" /> Application Details
                  </h2>
                  <div className="space-y-3">
                    <InfoRow icon={Briefcase} label="Position"         value={data.positionApplied} />
                    <InfoRow                  label="Department"       value={data.department} />
                    <InfoRow                  label="Source"           value={data.sourceChannel} />
                    <InfoRow icon={Calendar}  label="Application Date" value={data.applicationDate?.split('T')[0]} />
                    <InfoRow icon={Calendar}  label="Interview Date"   value={data.interviewDate?.split('T')[0]} />
                    <InfoRow icon={DollarSign} label="Expected Salary"
                      value={data.expectedSalary ? `₱${Number(data.expectedSalary).toLocaleString()}` : undefined}
                      mono
                    />
                    <InfoRow                  label="Referred By"      value={data.referredBy} />
                  </div>
                </Card>
              </div>
            )}

            {/* ── DOCUMENTS ── (placeholder — no doc API yet for applicants) */}
            {active === 'documents' && (
              <Card>
                <div className="py-16 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-surface-300" />
                  <p className="text-sm font-medium text-surface-700">No applicant documents</p>
                  <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
                    Resumes and supporting documents will be available here once attached during the application process.
                  </p>
                  {canConvert && (
                    <Button
                      variant="ghost" size="sm" className="mt-4"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => setShowConvert(true)}
                    >
                      Convert to Trainee to start a 201 File
                    </Button>
                  )}
                </div>
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
                  emptyDescription="Application milestones — screening, interviews, status changes — will show here."
                />
              </Card>
            )}

            {/* ── NOTES ── */}
            {active === 'notes' && (
              <Card>
                <h2 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-600" /> Notes
                </h2>
                {data.notes ? (
                  <div className="px-4 py-3 rounded-xl bg-surface-50 border border-surface-100">
                    <p className="text-sm text-surface-800 whitespace-pre-wrap leading-relaxed">{data.notes}</p>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <StickyNote className="w-10 h-10 mx-auto mb-3 text-surface-300" />
                    <p className="text-sm font-medium text-surface-700">No notes yet</p>
                    <p className="text-xs text-surface-500 mt-1">Add interview notes or screening observations by editing this applicant.</p>
                    <Button
                      variant="ghost" size="sm" className="mt-4"
                      leftIcon={<Pencil className="w-3.5 h-3.5" />}
                      onClick={() => router.push(`/dashboard/applicants/${data.id}/edit`)}
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

      <StickyActionBar
        hideOnMobile
        context={
          <div className="flex items-center gap-2 text-xs text-surface-500">
            <Inbox className="w-3.5 h-3.5" />
            <span>{fullName}</span>
            <Badge variant={STATUS_VARIANT[data.status] ?? 'neutral'} size="sm">
              {data.status.replace(/_/g, ' ')}
            </Badge>
          </div>
        }
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/applicants')}>
              Back to list
            </Button>
            {canConvert && (
              <Button
                variant="success" size="sm"
                leftIcon={<GraduationCap className="w-3.5 h-3.5" />}
                onClick={() => setShowConvert(true)}
              >
                Convert
              </Button>
            )}
            <Button
              variant="primary" size="sm"
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
              onClick={() => router.push(`/dashboard/applicants/${data.id}/edit`)}
            >
              Edit
            </Button>
          </>
        }
      />

      {/* Convert Modal */}
      <Modal
        open={showConvert}
        onClose={() => setShowConvert(false)}
        title="Convert to Trainee"
        description="Move this applicant into the training pipeline."
        size="md"
      >
        <form onSubmit={handleConvert} className="space-y-4">
          <Input
            type="date" label="Training Start Date" required
            value={convertForm.trainingStartDate}
            onChange={(e) => setConvertForm((f) => ({ ...f, trainingStartDate: e.target.value }))}
          />
          <Input
            label="Training Program"
            placeholder="e.g., Basic Security Training"
            value={convertForm.trainingProgram}
            onChange={(e) => setConvertForm((f) => ({ ...f, trainingProgram: e.target.value }))}
          />
          <Input
            label="Training Location"
            placeholder="Location / Venue"
            value={convertForm.trainingLocation}
            onChange={(e) => setConvertForm((f) => ({ ...f, trainingLocation: e.target.value }))}
          />
          <Input
            label="Trainer"
            placeholder="Trainer name"
            value={convertForm.trainer}
            onChange={(e) => setConvertForm((f) => ({ ...f, trainer: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowConvert(false)}>Cancel</Button>
            <Button type="submit" variant="success" size="sm" loading={converting}>
              {converting ? 'Converting…' : 'Convert to Trainee'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
