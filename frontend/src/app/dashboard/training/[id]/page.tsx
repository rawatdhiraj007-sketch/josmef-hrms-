'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, GraduationCap, ExternalLink, UserPlus, Award } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description?: string;
  provider: string;
  category: string;
  url?: string;
  externalId?: string;
  durationMinutes: number;
  isMandatory: boolean;
  issuesCertificate: boolean;
  skills?: string[];
}

interface Enrollment {
  id: string;
  status: string;
  dueDate?: string;
  startedAt?: string;
  completedAt?: string;
  progressPercent: number;
  score?: number;
  certificateNumber?: string;
  employee: { id: string; firstName: string; lastName: string; employeeId: string };
}

interface Employee { id: string; firstName: string; lastName: string; employeeId: string }

const STATUS_COLORS: Record<string, string> = {
  assigned: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
};

export default function CourseDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [dueDate, setDueDate] = useState('');

  async function load() {
    const [c, e] = await Promise.all([
      api.get(`/training/courses/${id}`),
      api.get('/training/enrollments', { params: { courseId: id } }),
    ]);
    setCourse(c.data);
    setEnrollments(e.data);
  }

  useEffect(() => { if (id) load(); }, [id]);

  async function openAssign() {
    if (employees.length === 0) {
      const r = await api.get('/employees', { params: { limit: 500 } });
      setEmployees(r.data.rows || r.data);
    }
    setShowAssign(true);
  }

  async function submitAssign() {
    await api.post('/training/assign', {
      courseId: id,
      employeeIds: Array.from(picked),
      dueDate: dueDate || undefined,
    });
    setShowAssign(false);
    setPicked(new Set());
    setDueDate('');
    await load();
  }

  if (!course) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  const assignedSet = new Set(enrollments.map(e => e.employee.id));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/training" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-rose-600" /> {course.title}
            </h1>
            <div className="flex gap-2 mt-2">
              <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-medium capitalize">{course.provider}</span>
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium capitalize">{course.category.replace('_', ' ')}</span>
              {course.isMandatory && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-medium">Mandatory</span>}
              {course.issuesCertificate && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"><Award className="w-3 h-3" /> Certificate</span>}
            </div>
          </div>
          {course.url && (
            <a href={course.url} target="_blank" rel="noopener noreferrer"
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> Open in {course.provider}
            </a>
          )}
        </div>
        {course.description && <p className="text-sm text-gray-700">{course.description}</p>}
        {course.skills && course.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {course.skills.map(s => (
              <span key={s} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{s}</span>
            ))}
          </div>
        )}
      </div>

      {/* Enrollments */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Enrollments ({enrollments.length})</h2>
        <button onClick={openAssign} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Assign Employees
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Employee</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Progress</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Score</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Due Date</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-gray-400">No employees enrolled yet</td></tr>
            )}
            {enrollments.map(e => (
              <tr key={e.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{e.employee.firstName} {e.employee.lastName}</div>
                  <div className="text-xs text-gray-500">{e.employee.employeeId}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[e.status]}`}>
                    {e.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${e.progressPercent}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{e.progressPercent}%</div>
                </td>
                <td className="px-4 py-3">{e.score ? `${e.score}%` : '—'}</td>
                <td className="px-4 py-3 text-gray-700">{e.dueDate ? new Date(e.dueDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  {e.certificateNumber ? (
                    <span className="font-mono text-xs text-amber-700 flex items-center gap-1"><Award className="w-3 h-3" /> {e.certificateNumber}</span>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAssign(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-semibold">Assign Employees</h3>
              <p className="text-xs text-gray-500 mt-1">Pick employees to enroll in "{course.title}"</p>
            </div>
            <div className="p-5 border-b border-gray-200">
              <label className="block text-sm font-medium mb-1">Due Date (optional)</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {employees.map(emp => {
                const isAssigned = assignedSet.has(emp.id);
                const isPicked = picked.has(emp.id);
                return (
                  <label key={emp.id}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer ${isAssigned ? 'opacity-40' : 'hover:bg-gray-50'}`}>
                    <input type="checkbox" checked={isPicked} disabled={isAssigned}
                      onChange={e => {
                        setPicked(prev => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(emp.id); else next.delete(emp.id);
                          return next;
                        });
                      }} />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{emp.firstName} {emp.lastName}</div>
                      <div className="text-xs text-gray-500">{emp.employeeId}{isAssigned ? ' · already enrolled' : ''}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={() => setShowAssign(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button onClick={submitAssign} disabled={picked.size === 0}
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                Enroll {picked.size} employee{picked.size === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
