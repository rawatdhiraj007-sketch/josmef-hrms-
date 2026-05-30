'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Trainee } from '@/types/trainee';
import {
  Pencil, Mail, Phone, Briefcase, Calendar, MapPin, Award, Users,
  Loader2, User, History, FileText, MessageSquare, StickyNote,
  GraduationCap, CheckCircle, XCircle, Inbox, ArrowRight, ClipboardList,
} from 'lucide-react';

import { Button, Badge, Card, Modal, Input, Select, Tabs, useToast } from '@/components/ui';
import {
  DetailHeader, InfoRow, Timeline, StickyActionBar, type TimelineEvent,
} from '@/components/detail';

const STATUS_VARIANT: Record<string, 'info' | 'success' | 'danger' | 'neutral' | 'warning'> = {
  ongoing:        'info',
  completed:      'success',
  failed:         'danger',
  dropped:        'neutral',
  for_deployment: 'warning',
  deployed:       'success',
};

export default function ViewTraineePage() {
  const params = useParams();
  const router = useRouter();
  const toast  = useToast();

  const [data, setData] = useState<Trainee | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>('overview');

  const [showPromote, setShowPromote] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [promoteForm, setPromoteForm] = useState({
    dateHired: new Date().toISOString().split('T')[0],
    position: '', department: '', branch: '',
    basicSalary: '', dailyRate: '', allowance: '',
    dateOfBirth: '', gender: '',
  });

  useEffect(() => {
    api.get(`/trainees/${params.id}`)
      .then((res) => {
        setData(res.data);
        setPromoteForm((f) => ({
          ...f,
          position: res.data.positionApplied || '',
          department: res.data.department || '',
        }));
      })
      .catch(() => toast.error('Trainee not found'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handlePromote(e: React.FormEvent) {
    e.preventDefault();
    setPromoting(true);
    try {
      const res = await api.post(`/trainees/${params.id}/promote`, {
        ...promoteForm,
        basicSalary: promoteForm.basicSalary ? Number(promoteForm.basicSalary) : undefined,
        dailyRate:   promoteForm.dailyRate   ? Number(promoteForm.dailyRate)   : undefined,
        allowance:   promoteForm.allowance   ? Number(promoteForm.allowance)   : undefined,
      });
      setShowPromote(false);
      toast.success('Promoted to Employee', 'New Employee ID generated.');
      router.push(`/dashboard/employees/${res.data.employee.id}`);
    } catch {
      toast.error('Promotion failed', 'Please check all required fields.');
    } finally {
      setPromoting(false);
    }
  }

  const activity: TimelineEvent[] = useMemo(() => {
    if (!data) return [];
    const events: TimelineEvent[] = [];
    if ((data as any).createdAt) {
      events.push({
        id: 'created', icon: Users, variant: 'info',
        title: 'Added to trainee roster',
        timestamp: (data as any).createdAt,
      });
    }
    if (data.trainingStartDate) {
      events.push({
        id: 'training-start', icon: GraduationCap, variant: 'brand',
        title: 'Training started',
        description: data.trainingProgram || 'Onboarding program',
        timestamp: data.trainingStartDate,
      });
    }
    if (data.trainingEndDate) {
      const isPast = new Date(data.trainingEndDate) < new Date();
      events.push({
        id: 'training-end', icon: CheckCircle, variant: isPast ? 'success' : 'info',
        title: isPast ? 'Training completed' : 'Training end scheduled',
        timestamp: data.trainingEndDate,
      });
    }
    if (data.status === 'failed' || data.status === 'dropped') {
      events.push({
        id: `status-${data.status}`, icon: XCircle, variant: 'danger',
        title: data.status === 'failed' ? 'Failed training' : 'Dropped from program',
        timestamp: (data as any).updatedAt,
      });
    }
    if (data.deploymentDate) {
      events.push({
        id: 'deployed', icon: MapPin, variant: 'success',
        title: 'Deployed',
        description: data.deploymentSite,
        timestamp: data.deploymentDate,
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
        <p className="text-rose-600 text-sm">Trainee not found</p>
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mt-3">Go back</Button>
      </div>
    );
  }

  const fullName = [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ');
  const refNumber = (data as any).traineeNumber;
  const canPromote = !['deployed', 'failed', 'dropped'].includes(data.status);

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
            {canPromote && (
              <Button
                variant="success" size="sm"
                leftIcon={<Users className="w-3.5 h-3.5" />}
                onClick={() => setShowPromote(true)}
              >
                Promote to Employee
              </Button>
            )}
            <Button
              variant="primary" size="sm"
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
              onClick={() => router.push(`/dashboard/trainees/${data.id}/edit`)}
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
                    <User className="w-4 h-4 text-primary-600" /> Personal Info
                  </h2>
                  <div className="space-y-3">
                    <InfoRow icon={Mail}      label="Email"      value={data.email} />
                    <InfoRow icon={Phone}     label="Mobile"     value={data.mobile} mono />
                    <InfoRow icon={Briefcase} label="Position"   value={data.positionApplied} />
                    <InfoRow                  label="Department" value={data.department} />
                  </div>
                </Card>

                <Card>
                  <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary-600" /> Training Details
                  </h2>
                  <div className="space-y-3">
                    <InfoRow                 label="Program"     value={data.trainingProgram} />
                    <InfoRow icon={MapPin}   label="Location"    value={data.trainingLocation} />
                    <InfoRow                 label="Trainer"     value={data.trainer} />
                    <InfoRow icon={Calendar} label="Start"       value={data.trainingStartDate?.split('T')[0]} />
                    <InfoRow icon={Calendar} label="End"         value={data.trainingEndDate?.split('T')[0]} />
                    <InfoRow icon={Award}    label="Exam Score"  value={data.examScore != null ? String(data.examScore) : undefined} mono />
                    <InfoRow icon={Award}    label="Performance" value={data.performanceRating != null ? String(data.performanceRating) : undefined} mono />
                  </div>
                </Card>

                <Card>
                  <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" /> Deployment
                  </h2>
                  <div className="space-y-3">
                    <InfoRow icon={Calendar} label="Date" value={data.deploymentDate?.split('T')[0]} />
                    <InfoRow icon={MapPin}   label="Site" value={data.deploymentSite} />
                  </div>
                </Card>
              </div>
            )}

            {/* ── DOCUMENTS ── (placeholder — no doc API for trainees yet) */}
            {active === 'documents' && (
              <Card>
                <div className="py-16 text-center">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-surface-300" />
                  <p className="text-sm font-medium text-surface-700">No trainee documents</p>
                  <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
                    Training certificates and supporting docs will appear here once attached.
                  </p>
                  {canPromote && (
                    <Button
                      variant="ghost" size="sm" className="mt-4"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => setShowPromote(true)}
                    >
                      Promote to Employee to start a 201 File
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
                  emptyDescription="Training milestones, status changes, and deployment will appear here."
                />
              </Card>
            )}

            {/* ── NOTES ── */}
            {active === 'notes' && (
              <Card>
                <h2 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-600" /> Remarks
                </h2>
                {data.remarks ? (
                  <div className="px-4 py-3 rounded-xl bg-surface-50 border border-surface-100">
                    <p className="text-sm text-surface-800 whitespace-pre-wrap leading-relaxed">{data.remarks}</p>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <StickyNote className="w-10 h-10 mx-auto mb-3 text-surface-300" />
                    <p className="text-sm font-medium text-surface-700">No remarks yet</p>
                    <p className="text-xs text-surface-500 mt-1">Add training notes by editing this trainee.</p>
                    <Button
                      variant="ghost" size="sm" className="mt-4"
                      leftIcon={<Pencil className="w-3.5 h-3.5" />}
                      onClick={() => router.push(`/dashboard/trainees/${data.id}/edit`)}
                    >
                      Add remarks
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
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/trainees')}>Back to list</Button>
            {canPromote && (
              <Button
                variant="success" size="sm"
                leftIcon={<Users className="w-3.5 h-3.5" />}
                onClick={() => setShowPromote(true)}
              >
                Promote
              </Button>
            )}
            <Button
              variant="primary" size="sm"
              leftIcon={<Pencil className="w-3.5 h-3.5" />}
              onClick={() => router.push(`/dashboard/trainees/${data.id}/edit`)}
            >
              Edit
            </Button>
          </>
        }
      />

      {/* Promote Modal */}
      <Modal
        open={showPromote}
        onClose={() => setShowPromote(false)}
        title="Promote to Employee"
        description="Move this trainee into your regular employee roster. An Employee ID (EMP-YYYY-NNN) will be auto-generated."
        size="lg"
      >
        <form onSubmit={handlePromote} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date" label="Date Hired" required
              value={promoteForm.dateHired}
              onChange={(e) => setPromoteForm((f) => ({ ...f, dateHired: e.target.value }))}
            />
            <Input
              type="date" label="Date of Birth" required
              value={promoteForm.dateOfBirth}
              onChange={(e) => setPromoteForm((f) => ({ ...f, dateOfBirth: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Position" required
              value={promoteForm.position}
              onChange={(e) => setPromoteForm((f) => ({ ...f, position: e.target.value }))}
            />
            <Input
              label="Department" required
              value={promoteForm.department}
              onChange={(e) => setPromoteForm((f) => ({ ...f, department: e.target.value }))}
            />
          </div>

          <Select
            label="Gender" required
            value={promoteForm.gender}
            onChange={(e) => setPromoteForm((f) => ({ ...f, gender: e.target.value }))}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>

          <Input
            label="Branch" placeholder="Branch / Site"
            value={promoteForm.branch}
            onChange={(e) => setPromoteForm((f) => ({ ...f, branch: e.target.value }))}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input type="number" label="Basic Salary (₱)" placeholder="0"
              value={promoteForm.basicSalary}
              onChange={(e) => setPromoteForm((f) => ({ ...f, basicSalary: e.target.value }))} />
            <Input type="number" label="Daily Rate (₱)" placeholder="0"
              value={promoteForm.dailyRate}
              onChange={(e) => setPromoteForm((f) => ({ ...f, dailyRate: e.target.value }))} />
            <Input type="number" label="Allowance (₱)" placeholder="0"
              value={promoteForm.allowance}
              onChange={(e) => setPromoteForm((f) => ({ ...f, allowance: e.target.value }))} />
          </div>

          <div className="px-4 py-3 rounded-xl bg-info-50 border border-blue-200 bg-blue-50 text-blue-800 text-xs">
            An Employee ID (EMP-YYYY-NNN) will be auto-generated. The trainee will be marked as &quot;deployed&quot;.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-100">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowPromote(false)}>Cancel</Button>
            <Button type="submit" variant="success" size="sm" loading={promoting}>
              {promoting ? 'Promoting…' : 'Promote to Employee'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
