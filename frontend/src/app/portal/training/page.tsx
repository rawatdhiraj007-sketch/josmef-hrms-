'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  GraduationCap, ExternalLink, Award, PlayCircle, CheckCircle,
  Clock, Loader2, BookOpen,
} from 'lucide-react';

import { Badge, Card, Button, useToast } from '@/components/ui';

interface Enrollment {
  id: string;
  status: string;
  progressPercent: number;
  score?: number;
  dueDate?: string;
  certificateNumber?: string;
  certificateUrl?: string;
  course: {
    id: string;
    title: string;
    description?: string;
    provider: string;
    category: string;
    url?: string;
    durationMinutes: number;
    isMandatory: boolean;
    issuesCertificate: boolean;
  };
}

export default function PortalTrainingPage() {
  const toast = useToast();
  const [items, setItems] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get('/portal/trainings');
      setItems(r.data);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function startCourse(e: Enrollment) {
    try {
      if (e.status === 'assigned') {
        await api.patch(`/training/enrollments/${e.id}`, { status: 'in_progress', progressPercent: 1 });
      }
      if (e.course.url) window.open(e.course.url, '_blank');
      await load();
    } catch {
      toast.error('Could not start course');
    }
  }

  async function markComplete(e: Enrollment) {
    if (!confirm('Mark this course as completed?')) return;
    try {
      await api.patch(`/training/enrollments/${e.id}`, { status: 'completed', progressPercent: 100 });
      toast.success('Course marked complete');
      await load();
    } catch {
      toast.error('Could not mark complete');
    }
  }

  const active    = items.filter((i) => i.status !== 'completed');
  const completed = items.filter((i) => i.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft">
            <GraduationCap className="w-4 h-4 text-white" />
          </span>
          My Trainings
        </h1>
        <p className="text-sm text-surface-500 mt-1 ml-11">Courses assigned to you</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="In Progress" value={active.filter((e) => e.status === 'in_progress').length} tone="brand" />
        <StatCard label="Assigned"    value={active.filter((e) => e.status === 'assigned').length}    tone="warning" />
        <StatCard label="Completed"   value={completed.length}                                         tone="success" />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-surface-400 text-sm gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      )}

      {!loading && items.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <GraduationCap className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-surface-700">No courses assigned</p>
            <p className="text-xs text-surface-500 mt-1">Contact HR for training opportunities</p>
          </div>
        </Card>
      )}

      {active.length > 0 && (
        <section>
          <h2 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3">In Progress / Pending</h2>
          <div className="space-y-3">
            {active.map((e) => (
              <CourseCard key={e.id} e={e} onStart={() => startCourse(e)} onComplete={() => markComplete(e)} />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3">Completed</h2>
          <div className="space-y-3">
            {completed.map((e) => (
              <CourseCard key={e.id} e={e} onStart={() => startCourse(e)} onComplete={() => {}} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CourseCard({
  e, onStart, onComplete,
}: { e: Enrollment; onStart: () => void; onComplete: () => void }) {
  const isCompleted = e.status === 'completed';
  return (
    <Card padding="md">
      <div className="flex flex-col md:flex-row md:items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 text-primary-600 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-surface-900">{e.course.title}</h3>
            {e.course.isMandatory && <Badge variant="danger" size="sm">Required</Badge>}
            {isCompleted && <Badge variant="success" size="sm" dot>Completed</Badge>}
          </div>
          <div className="text-2xs text-surface-500 flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            <span className="capitalize">{e.course.provider}</span>
            <span aria-hidden className="text-surface-300">·</span>
            <span className="capitalize">{e.course.category.replace('_', ' ')}</span>
            {e.course.durationMinutes > 0 && (
              <>
                <span aria-hidden className="text-surface-300">·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.course.durationMinutes} min</span>
              </>
            )}
            {e.dueDate && (
              <>
                <span aria-hidden className="text-surface-300">·</span>
                <span>Due {new Date(e.dueDate).toLocaleDateString()}</span>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
              style={{ width: `${e.progressPercent}%` }}
            />
          </div>
          <div className="text-2xs text-surface-400 mt-1 tabular-nums">{e.progressPercent}% complete</div>

          {e.certificateNumber && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <Award className="w-3.5 h-3.5 flex-shrink-0" />
              Certificate: <span className="font-mono font-medium">{e.certificateNumber}</span>
            </div>
          )}
        </div>

        <div className="flex md:flex-col gap-2 flex-shrink-0">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              <CheckCircle className="w-4 h-4" /> Completed
            </span>
          ) : (
            <>
              <Button
                size="sm"
                leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
                rightIcon={e.course.url ? <ExternalLink className="w-3 h-3" /> : undefined}
                onClick={onStart}
              >
                {e.status === 'assigned' ? 'Start' : 'Continue'}
              </Button>
              <Button size="sm" variant="secondary" onClick={onComplete}>
                Mark Done
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function StatCard({
  label, value, tone,
}: {
  label: string; value: number; tone: 'brand' | 'warning' | 'success';
}) {
  const COLOR: Record<typeof tone, string> = {
    brand:   'text-primary-700',
    warning: 'text-amber-600',
    success: 'text-emerald-600',
  };
  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-4 text-center shadow-card">
      <div className={`text-2xl font-bold tabular-nums ${COLOR[tone]}`}>{value}</div>
      <div className="text-2xs text-surface-500 mt-1 uppercase tracking-wider font-medium">{label}</div>
    </div>
  );
}
