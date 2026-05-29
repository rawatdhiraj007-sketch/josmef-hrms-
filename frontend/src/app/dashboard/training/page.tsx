'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { GraduationCap, Plus, ExternalLink, Users, Award, CheckCircle, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description?: string;
  provider: string;
  category: string;
  url?: string;
  thumbnailUrl?: string;
  durationMinutes: number;
  isMandatory: boolean;
  issuesCertificate: boolean;
  skills?: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  clinical: 'bg-blue-100 text-blue-700',
  compliance: 'bg-amber-100 text-amber-700',
  leadership: 'bg-purple-100 text-purple-700',
  soft_skills: 'bg-pink-100 text-pink-700',
  technical: 'bg-emerald-100 text-emerald-700',
  safety: 'bg-red-100 text-red-700',
  onboarding: 'bg-indigo-100 text-indigo-700',
  other: 'bg-gray-100 text-gray-700',
};

export default function TrainingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [summary, setSummary] = useState({ totalCourses: 0, totalEnrollments: 0, completed: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [graphyStatus, setGraphyStatus] = useState<{ configured: boolean; baseUrl: string; webhookSecretSet: boolean } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [c, s, g] = await Promise.all([
        api.get('/training/courses'),
        api.get('/training/summary'),
        api.get('/training/graphy/status').catch(() => null),
      ]);
      setCourses(c.data);
      setSummary(s.data);
      if (g) setGraphyStatus(g.data);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-rose-600" /> Training & Development
          </h1>
          <p className="text-gray-500 text-sm mt-1">Course catalog powered by Graphy and other providers</p>
        </div>
        <Link href="/dashboard/training/new" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Course
        </Link>
      </div>

      {/* Graphy connection status */}
      {graphyStatus && (
        graphyStatus.configured ? (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <span className="font-medium text-green-800">Graphy connected</span>
              <span className="text-green-700 ml-2">{graphyStatus.baseUrl}</span>
              {!graphyStatus.webhookSecretSet && (
                <span className="ml-3 text-amber-600">· Webhook secret not set</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-medium text-amber-800">Graphy not connected</span>
              <span className="text-amber-700 ml-2">Add <code className="bg-amber-100 px-1 rounded">GRAPHY_API_KEY</code> to your backend <code className="bg-amber-100 px-1 rounded">.env</code> to enable sync & SSO</span>
            </div>
          </div>
        )
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active Courses" value={summary.totalCourses} icon={GraduationCap} color="text-rose-600" />
        <StatCard label="Total Enrollments" value={summary.totalEnrollments} icon={Users} color="text-blue-600" />
        <StatCard label="In Progress" value={summary.inProgress} icon={Users} color="text-amber-600" />
        <StatCard label="Completed" value={summary.completed} icon={Award} color="text-green-600" />
      </div>

      {/* Course grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : courses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">No courses yet</p>
          <p className="text-xs text-gray-400 mb-4">Add courses from Graphy, internal training, or external platforms</p>
          <Link href="/dashboard/training/new" className="inline-flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Plus className="w-4 h-4" /> Add first course
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => (
            <Link key={c.id} href={`/dashboard/training/${c.id}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-rose-300 hover:shadow-md transition">
              {c.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.thumbnailUrl} alt={c.title} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-rose-100 via-pink-100 to-violet-100 flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-rose-300" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 leading-tight">{c.title}</h3>
                  {c.isMandatory && <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-medium uppercase">Required</span>}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${CATEGORY_COLORS[c.category] || ''}`}>
                    {c.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">{c.provider}</span>
                </div>
                {c.description && <p className="text-xs text-gray-600 line-clamp-2 mb-2">{c.description}</p>}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{c.durationMinutes ? `${c.durationMinutes} min` : 'Self-paced'}</span>
                  {c.url && <ExternalLink className="w-3 h-3" />}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <Icon className={`w-5 h-5 ${color} mb-2`} />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500 uppercase">{label}</div>
    </div>
  );
}
