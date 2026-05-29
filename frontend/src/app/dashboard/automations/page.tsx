'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Sparkles, Plus, Play, Pause, Trash2, ArrowRight, Zap,
  CheckCircle, XCircle, Info,
} from 'lucide-react';

interface Integration { id: string; name: string; channelType: string; isActive: boolean }
interface EventTypeOpt { value: string; label: string }
interface Rule {
  id: string;
  name: string;
  description?: string;
  trigger: string;
  integrationIds: string[];
  messageTemplate?: string;
  status: 'active' | 'paused' | 'archived';
  triggerCount: number;
  lastTriggeredAt?: string;
}
interface Run {
  id: string;
  ruleId: string;
  event: string;
  success: boolean;
  error?: string;
  responseStatus?: number;
  createdAt: string;
}

const STATUS_BADGE: Record<string, string> = {
  active: 'badge-success',
  paused: 'badge-warning',
  archived: 'badge-neutral',
};

export default function AutomationsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeOpt[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    trigger: '',
    integrationIds: [] as string[],
    messageTemplate: '',
  });

  async function load() {
    setLoading(true);
    try {
      const [r, i, e, rn] = await Promise.all([
        api.get('/automations/rules'),
        api.get('/integrations'),
        api.get('/automations/event-types'),
        api.get('/automations/runs'),
      ]);
      setRules(r.data);
      setIntegrations(i.data);
      setEventTypes(e.data);
      setRuns(rn.data);
    } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (form.integrationIds.length === 0) {
      alert('Select at least one integration');
      return;
    }
    try {
      await api.post('/automations/rules', form);
      setShowAdd(false);
      setForm({ name: '', description: '', trigger: '', integrationIds: [], messageTemplate: '' });
      await load();
    } catch (e: any) { alert(e?.response?.data?.message || 'Failed'); }
  }

  async function toggle(r: Rule) {
    const next = r.status === 'active' ? 'paused' : 'active';
    await api.patch(`/automations/rules/${r.id}/status`, { status: next });
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this automation?')) return;
    await api.delete(`/automations/rules/${id}`);
    await load();
  }

  function integrationName(id: string): string {
    return integrations.find(i => i.id === id)?.name ?? '(deleted)';
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
            <Sparkles className="w-6 h-6 text-primary-600" /> Automations
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            "When X happens, send notification to Y" — automated workflows powered by your integrations
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary" disabled={integrations.length === 0}>
          <Plus className="w-4 h-4" /> New automation
        </button>
      </div>

      {/* Empty state */}
      {integrations.length === 0 && (
        <div className="card p-8 text-center">
          <Zap className="w-12 h-12 text-surface-200 mx-auto mb-3" />
          <h3 className="font-semibold text-surface-900 mb-1">Add an integration first</h3>
          <p className="text-sm text-surface-500 mb-4">
            You need a Slack/Teams/Webhook connection before you can route events to it
          </p>
          <a href="/dashboard/integrations" className="btn-primary inline-flex">
            Add integration <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Rules list */}
      {integrations.length > 0 && (
        <div className="space-y-3">
          {loading && <div className="text-center py-12 text-surface-400">Loading...</div>}
          {!loading && rules.length === 0 && (
            <div className="card p-8 text-center">
              <Sparkles className="w-10 h-10 text-surface-200 mx-auto mb-3" />
              <p className="text-surface-700 font-medium mb-1">No automations yet</p>
              <p className="text-xs text-surface-500 mb-4">
                Try: "When a PRC license expires → notify HR Slack"
              </p>
              <button onClick={() => setShowAdd(true)} className="btn-primary inline-flex">
                <Plus className="w-4 h-4" /> Create first automation
              </button>
            </div>
          )}
          {rules.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-surface-900">{r.name}</h3>
                    <span className={`${STATUS_BADGE[r.status]} capitalize`}>{r.status}</span>
                    {r.triggerCount > 0 && (
                      <span className="text-2xs text-surface-500">
                        triggered {r.triggerCount}× · last {r.lastTriggeredAt ? new Date(r.lastTriggeredAt).toLocaleString() : 'never'}
                      </span>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-sm text-surface-600 mb-3">{r.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-surface-700 flex-wrap">
                    <span className="badge-info">
                      WHEN {eventTypes.find(e => e.value === r.trigger)?.label ?? r.trigger}
                    </span>
                    <ArrowRight className="w-3 h-3 text-surface-300" />
                    <span className="badge-neutral">
                      NOTIFY {r.integrationIds.map(integrationName).join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => toggle(r)} className="btn-ghost text-xs" title={r.status === 'active' ? 'Pause' : 'Activate'}>
                    {r.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(r.id)} className="btn-ghost text-xs hover:text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent run log */}
      {runs.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-surface-50 border-b border-surface-200">
            <h3 className="font-semibold text-sm text-surface-900">Recent executions</h3>
            <p className="text-xs text-surface-500 mt-0.5">Last 100 automation runs</p>
          </div>
          <table className="table-modern">
            <thead>
              <tr>
                <th>When</th>
                <th>Event</th>
                <th>Status</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 10).map(r => (
                <tr key={r.id}>
                  <td className="text-xs text-surface-500">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="font-mono text-xs">{r.event}</td>
                  <td>
                    {r.success ? (
                      <span className="badge-success"><CheckCircle className="w-3 h-3" /> Success</span>
                    ) : (
                      <span className="badge-danger"><XCircle className="w-3 h-3" /> Failed</span>
                    )}
                  </td>
                  <td className="text-xs">
                    {r.responseStatus && <span className="font-mono">{r.responseStatus}</span>}
                    {r.error && <span className="text-rose-600 ml-2">{r.error.slice(0, 60)}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form onSubmit={create} onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="font-semibold text-surface-900">New automation</h3>

            <div>
              <label className="label">Name *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder='e.g. "License expiry alerts to HR"' className="input-field" />
            </div>

            <div>
              <label className="label">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What does this automation do?" className="input-field" />
            </div>

            <div>
              <label className="label">When this event happens *</label>
              <select required value={form.trigger} onChange={e => setForm({ ...form, trigger: e.target.value })} className="input-field">
                <option value="">Select an event...</option>
                <optgroup label="Licenses">
                  {eventTypes.filter(e => e.value.startsWith('license')).map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </optgroup>
                <optgroup label="Employees">
                  {eventTypes.filter(e => e.value.startsWith('employee') || e.value.startsWith('contract')).map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </optgroup>
                <optgroup label="Leave">
                  {eventTypes.filter(e => e.value.startsWith('leave')).map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </optgroup>
                <optgroup label="Discipline">
                  {eventTypes.filter(e => e.value.startsWith('nte') || e.value.startsWith('disciplinary')).map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </optgroup>
                <optgroup label="Shifts">
                  {eventTypes.filter(e => e.value.startsWith('shift')).map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </optgroup>
                <optgroup label="Payroll">
                  {eventTypes.filter(e => e.value.startsWith('payroll') || e.value.startsWith('bonus')).map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </optgroup>
                <optgroup label="Exit">
                  {eventTypes.filter(e => e.value.startsWith('exit')).map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </optgroup>
              </select>
            </div>

            <div>
              <label className="label">Send to these integrations * (pick at least one)</label>
              <div className="space-y-2 border border-surface-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                {integrations.map(i => (
                  <label key={i.id} className="flex items-center gap-3 cursor-pointer hover:bg-surface-50 px-2 py-1.5 rounded">
                    <input
                      type="checkbox"
                      checked={form.integrationIds.includes(i.id)}
                      onChange={e => {
                        setForm(f => ({
                          ...f,
                          integrationIds: e.target.checked
                            ? [...f.integrationIds, i.id]
                            : f.integrationIds.filter(x => x !== i.id),
                        }));
                      }}
                    />
                    <span className="text-sm">{i.name}</span>
                    <span className="text-2xs uppercase text-surface-500">{i.channelType}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Message template (optional)</label>
              <textarea
                rows={3}
                value={form.messageTemplate}
                onChange={e => setForm({ ...form, messageTemplate: e.target.value })}
                placeholder="Use {{employeeName}}, {{licenseType}}, etc."
                className="input-field font-mono text-xs"
              />
              <div className="flex items-start gap-1.5 text-2xs text-surface-500 mt-1.5">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                Available: {`{{employeeName}}, {{licenseType}}, {{licenseNumber}}, {{dueDate}}, {{leaveCode}}, {{totalDays}}, {{shiftDate}}`}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary">Create automation</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
