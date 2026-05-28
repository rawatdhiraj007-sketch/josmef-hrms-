'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { GraduationCap, ExternalLink, Award, PlayCircle, CheckCircle } from 'lucide-react';

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
  const [items, setItems] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const r = await api.get('/portal/trainings');
      setItems(r.data);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function startCourse(e: Enrollment) {
    if (e.status === 'assigned') {
      await api.patch(`/training/enrollments/${e.id}`, { status: 'in_progress', progressPercent: 1 });
    }
    if (e.course.url) {
      window.open(e.course.url, '_blank');
    }
    await load();
  }

  async function markComplete(e: Enrollment) {
    if (!confirm('Mark this course as completed?')) return;
    await api.patch(`/training/enrollments/${e.id}`, { status: 'completed', progressPercent: 100 });
    await load();
  }

  const active = items.filter(i => i.status !== 'completed');
  const completed = items.filter(i => i.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-rose-600" /> My Trainings
        </h1>
        <p className="text-gray-500 text-sm mt-1">Courses assigned to you</p>
      </div>

      {loading && <div className="text-center py-12 text-gray-400">Loading...</div>}

      {!loading && items.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No courses assigned</p>
          <p className="text-xs text-gray-400 mt-1">Contact HR for training opportunities</p>
        </div>
      )}

      {active.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3">In Progress / Pending</h2>
          <div className="space-y-3">
            {active.map(e => <Card key={e.id} e={e} onStart={() => startCourse(e)} onComplete={() => markComplete(e)} />)}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase mb-3">Completed</h2>
          <div className="space-y-3">
            {completed.map(e => <Card key={e.id} e={e} onStart={() => startCourse(e)} onComplete={() => {}} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ e, onStart, onComplete }: { e: any; onStart: () => void; onComplete: () => void }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-900">{e.course.title}</h3>
          {e.course.isMandatory && <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase">Required</span>}
        </div>
        <div className="text-xs text-gray-500 flex gap-3 mb-2">
          <span className="capitalize">{e.course.provider}</span>
          <span className="capitalize">{e.course.category.replace('_', ' ')}</span>
          {e.course.durationMinutes > 0 && <span>{e.course.durationMinutes} min</span>}
          {e.dueDate && <span>Due {new Date(e.dueDate).toLocaleDateString()}</span>}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-rose-500 h-2 rounded-full transition-all" style={{ width: `${e.progressPercent}%` }}></div>
        </div>
        {e.certificateNumber && (
          <div className="mt-2 text-xs text-amber-700 flex items-center gap-1">
            <Award className="w-3 h-3" /> Certificate: <span className="font-mono">{e.certificateNumber}</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 md:flex-col">
        {e.status === 'completed' ? (
          <span className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Completed
          </span>
        ) : (
          <>
            <button onClick={onStart}
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4" /> {e.status === 'assigned' ? 'Start' : 'Continue'}
              {e.course.url && <ExternalLink className="w-3 h-3" />}
            </button>
            <button onClick={onComplete}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium">
              Mark Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
