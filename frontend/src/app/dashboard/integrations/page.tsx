'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  Zap, Plus, Trash2, Send, CheckCircle, XCircle, Slack, MessageSquare,
  Webhook, MessageCircle, AlertCircle, ToggleLeft, ToggleRight,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  channelType: 'slack' | 'teams' | 'webhook' | 'discord' | 'email';
  webhookUrl: string;
  isActive: boolean;
  lastDeliveredAt?: string;
  lastError?: string;
  deliveryCount: number;
  errorCount: number;
  createdAt: string;
}

const CHANNEL_META: Record<string, { name: string; icon: any; color: string; bg: string; help: string; example: string }> = {
  slack: {
    name: 'Slack',
    icon: Slack,
    color: 'text-[#4A154B]',
    bg: 'bg-[#4A154B]/10',
    help: 'Slack admin → Apps → Incoming Webhooks → Create webhook → Copy URL',
    example: 'https://hooks.slack.com/services/T00000/B00000/XXXXX',
  },
  teams: {
    name: 'Microsoft Teams',
    icon: MessageSquare,
    color: 'text-[#5059C9]',
    bg: 'bg-[#5059C9]/10',
    help: 'Channel ⋯ → Connectors → Incoming Webhook → Create → Copy URL',
    example: 'https://outlook.office.com/webhook/...',
  },
  discord: {
    name: 'Discord',
    icon: MessageCircle,
    color: 'text-[#5865F2]',
    bg: 'bg-[#5865F2]/10',
    help: 'Server Settings → Integrations → Webhooks → New Webhook → Copy URL',
    example: 'https://discord.com/api/webhooks/...',
  },
  webhook: {
    name: 'Generic Webhook',
    icon: Webhook,
    color: 'text-violet-600',
    bg: 'bg-violet-100',
    help: 'Any HTTP endpoint that accepts POST with JSON. Use secret for HMAC signature.',
    example: 'https://api.yourapp.com/josmef-events',
  },
  email: {
    name: 'Email',
    icon: AlertCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    help: 'SMTP-based — set SMTP_* env vars on backend.',
    example: 'alerts@yourcompany.com',
  },
};

export default function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', channelType: 'slack', webhookUrl: '', authToken: '' });
  const [testing, setTesting] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try { const r = await api.get('/integrations'); setItems(r.data); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/integrations', form);
      setShowAdd(false);
      setForm({ name: '', channelType: 'slack', webhookUrl: '', authToken: '' });
      await load();
    } catch (e: any) { alert(e?.response?.data?.message || 'Failed'); }
  }

  async function test(id: string) {
    setTesting(id);
    try {
      await api.post(`/integrations/${id}/test`);
      alert('✅ Test message sent! Check your channel.');
      await load();
    } catch (e: any) {
      alert('❌ Failed: ' + (e?.response?.data?.message || e.message));
      await load();
    } finally { setTesting(null); }
  }

  async function toggle(item: Integration) {
    await api.put(`/integrations/${item.id}`, { isActive: !item.isActive });
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this integration? All rules using it will stop firing.')) return;
    await api.delete(`/integrations/${id}`);
    await load();
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2 tracking-tight">
            <Zap className="w-6 h-6 text-primary-600" /> Integrations
          </h1>
          <p className="text-sm text-surface-500 mt-1">
            Connect Slack, Teams, Discord, or any webhook — then route events via Automations
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add integration
        </button>
      </div>

      {/* Channel discovery cards (when empty) */}
      {!loading && items.length === 0 && (
        <div className="card p-8 text-center">
          <Zap className="w-12 h-12 text-surface-200 mx-auto mb-3" />
          <h3 className="font-semibold text-surface-900 mb-1">No integrations yet</h3>
          <p className="text-sm text-surface-500 mb-6 max-w-md mx-auto">
            Connect your team's chat or any webhook to receive automated alerts when licenses expire,
            shifts get assigned, leaves are filed, and more.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {Object.entries(CHANNEL_META).filter(([k]) => k !== 'email').map(([type, meta]) => {
              const Icon = meta.icon;
              return (
                <button
                  key={type}
                  onClick={() => { setForm(f => ({ ...f, channelType: type })); setShowAdd(true); }}
                  className="card p-4 hover:border-primary-300 hover:shadow-card transition cursor-pointer text-center"
                >
                  <div className={`w-10 h-10 mx-auto rounded-lg ${meta.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <div className="text-sm font-medium">{meta.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Integration list */}
      {items.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map(i => {
            const meta = CHANNEL_META[i.channelType];
            const Icon = meta.icon;
            return (
              <div key={i.id} className="card p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-surface-900 flex items-center gap-2">
                      {i.name}
                      {i.isActive ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-surface-300" />
                      )}
                    </div>
                    <div className="text-xs text-surface-500 capitalize">{meta.name}</div>
                  </div>
                  <button onClick={() => toggle(i)} className="text-surface-400 hover:text-primary-600">
                    {i.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>

                <div className="bg-surface-50 rounded-lg px-3 py-2 text-2xs font-mono text-surface-500 truncate mb-3">
                  {i.webhookUrl.slice(0, 50)}…
                </div>

                <div className="flex gap-3 text-xs text-surface-500 mb-4">
                  <span>🚀 {i.deliveryCount} delivered</span>
                  {i.errorCount > 0 && <span className="text-rose-600">⚠️ {i.errorCount} errors</span>}
                  {i.lastDeliveredAt && (
                    <span>last: {new Date(i.lastDeliveredAt).toLocaleString()}</span>
                  )}
                </div>

                {i.lastError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-2 rounded mb-3">
                    {i.lastError.slice(0, 100)}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-surface-100">
                  <button
                    onClick={() => test(i.id)}
                    disabled={testing === i.id || !i.isActive}
                    className="btn-secondary text-xs flex-1"
                  >
                    <Send className="w-3 h-3" /> {testing === i.id ? 'Sending...' : 'Send test'}
                  </button>
                  <button onClick={() => remove(i.id)} className="btn-ghost text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <form
            onSubmit={create}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4"
          >
            <div>
              <h3 className="font-semibold text-surface-900">Add integration</h3>
              <p className="text-xs text-surface-500 mt-1">
                Connect a channel that will receive notifications from JOSMEF
              </p>
            </div>

            <div>
              <label className="label">Channel type</label>
              <select
                value={form.channelType}
                onChange={e => setForm({ ...form, channelType: e.target.value })}
                className="input-field"
              >
                <option value="slack">Slack</option>
                <option value="teams">Microsoft Teams</option>
                <option value="discord">Discord</option>
                <option value="webhook">Generic Webhook</option>
              </select>
            </div>

            <div>
              <label className="label">Name</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. HR Team Slack #hr-alerts"
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Webhook URL</label>
              <input
                required
                type="url"
                value={form.webhookUrl}
                onChange={e => setForm({ ...form, webhookUrl: e.target.value })}
                placeholder={CHANNEL_META[form.channelType]?.example}
                className="input-field font-mono text-xs"
              />
              <p className="text-2xs text-surface-500 mt-1">{CHANNEL_META[form.channelType]?.help}</p>
            </div>

            {form.channelType === 'webhook' && (
              <div>
                <label className="label">Secret (optional, for HMAC-SHA256 signature)</label>
                <input
                  value={form.authToken}
                  onChange={e => setForm({ ...form, authToken: e.target.value })}
                  placeholder="random-secret-string"
                  className="input-field font-mono text-xs"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-surface-100">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary">Add integration</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
