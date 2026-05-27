'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ExitClearance as EC } from '@/types/exit-clearance';
import {
  ArrowLeft, CheckCircle, Circle, Calendar, User, Briefcase, Loader2,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function ExitClearanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<EC | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState<string | null>(null);

  function loadData() {
    api.get(`/exit-clearance/${params.id}`)
      .then((res) => setData(res.data))
      .catch(() => alert('Not found'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [params.id]);

  async function handleClear(itemId: string) {
    setClearing(itemId);
    try {
      await api.post('/exit-clearance/clear-item', { clearanceItemId: itemId });
      loadData();
    } catch { alert('Failed to clear item'); }
    finally { setClearing(null); }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-red-500">Not found</div>;

  const cleared = data.items?.filter((i) => i.isCleared).length || 0;
  const total = data.items?.length || 0;
  const pct = total > 0 ? Math.round((cleared / total) * 100) : 0;

  // Group items by department
  const grouped: Record<string, typeof data.items> = {};
  data.items?.forEach((item) => {
    if (!grouped[item.department]) grouped[item.department] = [];
    grouped[item.department].push(item);
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-surface-100">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {data.employee?.lastName}, {data.employee?.firstName}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[data.status]}`}>
              {data.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {data.employee?.position} — {data.employee?.department}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400 uppercase">Separation</p>
              <p className="font-medium text-gray-900">{data.separationType.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400 uppercase">Last Day</p>
              <p className="font-medium text-gray-900">{data.lastWorkingDay?.split('T')[0]}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400 uppercase">Progress</p>
              <p className="font-medium text-gray-900">{cleared}/{total} ({pct}%)</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400 uppercase">Final Pay</p>
              <p className="font-medium text-gray-900">₱{Number(data.finalPay || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">Overall Clearance Progress</p>
          <p className="text-sm font-bold text-gray-900">{pct}%</p>
        </div>
        <div className="h-3 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-brand-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Reason */}
      {data.reason && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Reason for Separation</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{data.reason}</p>
        </div>
      )}

      {/* Clearance Checklist grouped by department */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([dept, items]) => (
          <div key={dept} className="card overflow-hidden">
            <div className="bg-surface-50 px-5 py-3 border-b border-surface-200">
              <h3 className="font-semibold text-gray-900">{dept}</h3>
              <p className="text-xs text-gray-400">
                {items.filter((i) => i.isCleared).length}/{items.length} cleared
              </p>
            </div>
            <div className="divide-y divide-surface-100">
              {items.map((item) => (
                <div key={item.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {item.isCleared ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm ${item.isCleared ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {item.requirement}
                      </p>
                      {item.isCleared && item.clearedAt && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Cleared on {new Date(item.clearedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  {!item.isCleared && (
                    <button
                      onClick={() => handleClear(item.id)}
                      disabled={clearing === item.id}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {clearing === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Clear
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
