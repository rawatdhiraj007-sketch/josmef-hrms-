'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ExitClearance as EC } from '@/types/exit-clearance';
import {
  ArrowLeft, CheckCircle, Circle, Calendar, User, Briefcase, Loader2,
  PenTool, Trash2, Save, X,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

// ─── Signature Pad Component ────────────────────────────────────────────────
function SignaturePad({
  label,
  existingSignature,
  signedAt,
  signedBy,
  onSave,
  onClear,
  loading,
}: {
  label: string;
  existingSignature?: string;
  signedAt?: string;
  signedBy?: string;
  onSave: (dataUrl: string, signerName?: string) => void;
  onClear: () => void;
  loading?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [editing, setEditing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
    setIsDrawing(true);
    setHasDrawn(true);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    lastPos.current = pos;
  }, [isDrawing]);

  const stopDraw = useCallback(() => setIsDrawing(false), []);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl, signerName || undefined);
    setEditing(false);
    clearCanvas();
    setSignerName('');
  }

  // ─── Already signed view ──────────────────────────────────────────────────
  if (existingSignature && !editing) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-green-700">{label} — Signed</span>
          </div>
          <button
            onClick={onClear}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Clear
          </button>
        </div>
        <img src={existingSignature} alt="signature" className="max-h-20 border border-green-200 rounded bg-white p-1" />
        <div className="mt-1 text-xs text-gray-400">
          {signedBy && <span>Signed by: {signedBy} • </span>}
          {signedAt && <span>{new Date(signedAt).toLocaleString()}</span>}
        </div>
      </div>
    );
  }

  // ─── Pad view ─────────────────────────────────────────────────────────────
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </div>
        {hasDrawn && (
          <button onClick={clearCanvas} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
      {label.includes('HR') && (
        <input
          type="text"
          placeholder="HR Officer name (optional)"
          value={signerName}
          onChange={e => setSignerName(e.target.value)}
          className="w-full mb-2 border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        />
      )}
      <canvas
        ref={canvasRef}
        width={480}
        height={120}
        className="w-full border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <p className="text-xs text-gray-400 mt-1 mb-3">Draw your signature above</p>
      <button
        onClick={handleSave}
        disabled={!hasDrawn || loading}
        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Signature
      </button>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ExitClearanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<EC | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState<string | null>(null);
  const [signingSaving, setSigningSaving] = useState<'employee' | 'hr' | null>(null);

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

  async function handleSign(signerType: 'employee' | 'hr', signatureData: string, signerName?: string) {
    setSigningSaving(signerType);
    try {
      const res = await api.patch(`/exit-clearance/${params.id}/sign`, {
        signerType, signatureData, signerName,
      });
      setData(prev => prev ? { ...prev, ...res.data } : res.data);
    } catch { alert('Failed to save signature'); }
    finally { setSigningSaving(null); }
  }

  async function handleClearSignature(signerType: 'employee' | 'hr') {
    setSigningSaving(signerType);
    try {
      const res = await api.delete(`/exit-clearance/${params.id}/sign/${signerType}`);
      setData(prev => prev ? { ...prev, ...res.data } : res.data);
    } catch { alert('Failed to clear signature'); }
    finally { setSigningSaving(null); }
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!data) return <div className="text-center py-12 text-red-500">Not found</div>;

  const cleared = data.items?.filter((i) => i.isCleared).length || 0;
  const total = data.items?.length || 0;
  const pct = total > 0 ? Math.round((cleared / total) * 100) : 0;

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
      <div className="space-y-4 mb-8">
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

      {/* E-Signatures Section */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <PenTool className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">E-Signatures</h2>
        </div>
        <p className="text-sm text-gray-500 mb-5">
          Both the employee and HR representative must sign to complete the exit clearance process.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SignaturePad
            label="Employee Signature"
            existingSignature={(data as any).employeeSignature}
            signedAt={(data as any).employeeSignedAt}
            onSave={(dataUrl) => handleSign('employee', dataUrl)}
            onClear={() => handleClearSignature('employee')}
            loading={signingSaving === 'employee'}
          />
          <SignaturePad
            label="HR Representative Signature"
            existingSignature={(data as any).hrSignature}
            signedAt={(data as any).hrSignedAt}
            signedBy={(data as any).hrSignedBy}
            onSave={(dataUrl, name) => handleSign('hr', dataUrl, name)}
            onClear={() => handleClearSignature('hr')}
            loading={signingSaving === 'hr'}
          />
        </div>
        {(data as any).employeeSignature && (data as any).hrSignature && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium">
            <CheckCircle className="w-4 h-4" />
            Both parties have signed. Exit clearance is fully executed.
          </div>
        )}
      </div>
    </div>
  );
}
