'use client';

import { useState } from 'react';
import {
  Sparkles, FileText, MessageSquare, Briefcase, ClipboardList,
  Send, Loader2, Copy, Check, BellRing, Lightbulb, Activity, Bot,
  Workflow, Calendar, FileDown, Mail, Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

import { Button, Card, Badge, Tabs, useToast } from '@/components/ui';
import {
  AiAlertList, AiRecommendations, BusinessHealthScore, AiInsightsGrid,
} from '@/components/ai';
import { useAi } from '@/hooks/useAi';
import { hiresThisMonth, separatedThisMonth } from '@/lib/ai';

export default function AiHubPage() {
  const [tab, setTab] = useState('command');

  return (
    <div className="space-y-6 pb-24">
      {/* ── Brand header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight flex items-center gap-2">
              NextNova AI
              <Badge variant="brand" size="sm" dot>Beta</Badge>
            </h1>
            <p className="text-sm text-surface-500">Your HR Manager · Operations Manager · Business Analyst — all in one</p>
          </div>
        </div>
        <Badge variant="info" size="sm">Advisory only</Badge>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'command',     label: 'Command Center', icon: Activity },
          { value: 'briefing',    label: 'Executive Brief', icon: ClipboardList },
          { value: 'automations', label: 'Automations',    icon: Workflow },
          { value: 'chat',        label: 'HR Chat',        icon: MessageSquare },
          { value: 'resume',      label: 'Resume Parser',  icon: FileText },
          { value: 'jd',          label: 'JD Generator',   icon: Briefcase },
          { value: 'review',      label: 'Reviews',        icon: Bot },
        ]}
      >
        {(active) => (
          <>
            {active === 'command'     && <CommandCenter />}
            {active === 'briefing'    && <ExecutiveBriefing />}
            {active === 'automations' && <AutomationsBuilder />}
            {active === 'chat'        && <HrChat />}
            {active === 'resume'      && <ResumeParser />}
            {active === 'jd'          && <JdGenerator />}
            {active === 'review'      && <ReviewGenerator />}
          </>
        )}
      </Tabs>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 1) COMMAND CENTER — health score, alerts, recommendations, insights
// ════════════════════════════════════════════════════════════════
function CommandCenter() {
  const { failed, refresh } = useAi();
  return (
    <div className="space-y-6">
      {failed.length > 0 && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          AI ran with partial data — {failed.length} source{failed.length === 1 ? '' : 's'} unavailable: {failed.join(', ')}.
          {' '}<button onClick={() => refresh()} className="font-semibold underline">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Health score */}
        <Card className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-600" /> Business Health Score
          </h2>
          <BusinessHealthScore />
        </Card>

        {/* Alerts */}
        <Card className="lg:col-span-2" padding="none">
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-primary-600" /> Smart Alerts
            </h2>
            <Badge variant="info" size="sm">Auto-prioritized</Badge>
          </div>
          <AiAlertList />
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary-600" /> Recommended Actions
        </h2>
        <AiRecommendations />
      </Card>

      {/* Smart Insights */}
      <section>
        <h2 className="text-sm font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-600" /> Smart Insights
          <span className="text-2xs text-surface-500 font-normal">— numbers explained</span>
        </h2>
        <AiInsightsGrid />
      </section>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 2) EXECUTIVE BRIEFING — one-click "what happened this month"
// ════════════════════════════════════════════════════════════════
function ExecutiveBriefing() {
  const { data, healthScore, alerts, recommendations, loading } = useAi();
  const toast = useToast();

  if (loading || !data || !healthScore) {
    return (
      <div className="flex items-center justify-center py-20 text-surface-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" /> Generating briefing…
      </div>
    );
  }

  const hires = hiresThisMonth(data.employees);
  const seps  = separatedThisMonth(data.employees);
  const critAlerts = alerts.filter((a) => a.priority === 'critical');
  const highAlerts = alerts.filter((a) => a.priority === 'high');

  const month = new Date().toLocaleString('en-PH', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary-600" /> Executive Brief — {month}
          </h2>
          <p className="text-xs text-surface-500 mt-0.5">Auto-generated summary for owners and managers</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary" size="sm"
            leftIcon={<FileDown className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
          >
            Print / PDF
          </Button>
          <Button
            variant="secondary" size="sm"
            leftIcon={<Mail className="w-3.5 h-3.5" />}
            onClick={() => {
              const subject = encodeURIComponent(`Executive Brief — ${month}`);
              const body = encodeURIComponent(
                `Business Health: ${healthScore.overall}/100 (${healthScore.grade})\n` +
                `New hires: ${hires.length}\nSeparations: ${seps.length}\n` +
                `Critical alerts: ${critAlerts.length}\nHigh alerts: ${highAlerts.length}\n`,
              );
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
              toast.info('Email draft opened');
            }}
          >
            Email
          </Button>
        </div>
      </div>

      <Card>
        <h3 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3">Headline</h3>
        <p className="text-sm leading-relaxed text-surface-800">
          Your business health score is <span className="font-bold tabular-nums">{healthScore.overall}/100 ({healthScore.grade})</span>.
          {' '}This month you welcomed <span className="font-semibold">{hires.length}</span> new hire{hires.length === 1 ? '' : 's'}
          {' '}and processed <span className="font-semibold">{seps.length}</span> separation{seps.length === 1 ? '' : 's'}.
          {' '}There {critAlerts.length === 1 ? 'is' : 'are'} <span className={critAlerts.length > 0 ? 'font-semibold text-rose-700' : ''}>{critAlerts.length} critical</span>
          {' '}and <span className={highAlerts.length > 0 ? 'font-semibold text-amber-700' : ''}>{highAlerts.length} high-priority</span> issue{highAlerts.length === 1 ? '' : 's'} that need attention.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Workforce activity
          </h3>
          <ul className="text-sm text-surface-800 space-y-2">
            <li className="flex items-center justify-between">
              <span>New hires</span>
              <span className="font-bold tabular-nums">{hires.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Separations</span>
              <span className="font-bold tabular-nums">{seps.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Net change</span>
              <span className={`font-bold tabular-nums ${hires.length - seps.length >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {hires.length - seps.length >= 0 ? '+' : ''}{hires.length - seps.length}
              </span>
            </li>
            <li className="flex items-center justify-between border-t border-surface-100 pt-2">
              <span>Active headcount</span>
              <span className="font-bold tabular-nums">{data.employees.filter((e: any) => !e.dateSeparated).length}</span>
            </li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3">Health breakdown</h3>
          <BusinessHealthScore />
        </Card>
      </div>

      <Card padding="none">
        <div className="px-5 py-3 border-b border-surface-100">
          <h3 className="text-2xs font-bold text-surface-500 uppercase tracking-wider">Top alerts</h3>
        </div>
        <AiAlertList limit={5} />
      </Card>

      <Card>
        <h3 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3">Top recommendations</h3>
        <AiRecommendations limit={5} />
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 3) AUTOMATIONS BUILDER — UI for natural-language automation rules
// ════════════════════════════════════════════════════════════════
const AUTOMATION_TEMPLATES = [
  { id: 't1', when: 'employee is hired',                    then: 'send welcome email to employee' },
  { id: 't2', when: 'leave is approved',                    then: 'notify the employee\'s manager' },
  { id: 't3', when: 'a license expires within 30 days',     then: 'send renewal reminder to employee' },
  { id: 't4', when: 'a license expires within 7 days',      then: 'notify HR and the employee' },
  { id: 't5', when: 'training enrollment is overdue',       then: 'send reminder to employee' },
  { id: 't6', when: 'employee is separated',                then: 'initiate exit clearance workflow' },
];

function AutomationsBuilder() {
  const [rules, setRules] = useState<{ id: string; when: string; then: string; enabled: boolean }[]>(
    AUTOMATION_TEMPLATES.slice(0, 4).map((t) => ({ ...t, enabled: true })),
  );
  const [whenText, setWhenText] = useState('');
  const [thenText, setThenText] = useState('');
  const toast = useToast();

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shadow-soft flex-shrink-0">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-surface-900">Automation Builder</h2>
            <p className="text-xs text-surface-500 mt-1">Describe workflows in plain English. Rules are stored locally on this preview; production wiring requires the automation engine to be enabled.</p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3">Create a rule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">When…</label>
            <input
              type="text"
              value={whenText}
              onChange={(e) => setWhenText(e.target.value)}
              placeholder="employee is hired"
              className="w-full bg-white text-surface-900 border border-surface-200 hover:border-surface-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 rounded-lg h-10 px-3.5 text-sm transition-all outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">…then…</label>
            <input
              type="text"
              value={thenText}
              onChange={(e) => setThenText(e.target.value)}
              placeholder="send welcome email"
              className="w-full bg-white text-surface-900 border border-surface-200 hover:border-surface-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 rounded-lg h-10 px-3.5 text-sm transition-all outline-none"
            />
          </div>
        </div>
        <Button
          size="sm" className="mt-3"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          disabled={!whenText.trim() || !thenText.trim()}
          onClick={() => {
            setRules((r) => [...r, { id: Math.random().toString(36).slice(2), when: whenText, then: thenText, enabled: true }]);
            setWhenText(''); setThenText('');
            toast.success('Rule added', 'Stored locally — connect to automation engine to activate.');
          }}
        >
          Add Rule
        </Button>
      </Card>

      <Card padding="none">
        <div className="px-5 py-3 border-b border-surface-100">
          <h3 className="text-2xs font-bold text-surface-500 uppercase tracking-wider">Active rules ({rules.length})</h3>
        </div>
        {rules.length === 0 ? (
          <div className="py-10 text-center text-sm text-surface-500">No rules yet — add one above.</div>
        ) : (
          <ul className="divide-y divide-surface-100">
            {rules.map((r) => (
              <li key={r.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-900">
                    <Badge variant="brand" size="sm">WHEN</Badge>{' '}
                    <span className="font-medium">{r.when}</span>{' '}
                    <Badge variant="success" size="sm">THEN</Badge>{' '}
                    <span className="font-medium">{r.then}</span>
                  </p>
                </div>
                <Badge variant={r.enabled ? 'success' : 'neutral'} size="sm" dot>
                  {r.enabled ? 'Active' : 'Paused'}
                </Badge>
                <button
                  type="button"
                  onClick={() => setRules((rs) => rs.filter((x) => x.id !== r.id))}
                  className="text-2xs text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h3 className="text-2xs font-bold text-surface-500 uppercase tracking-wider mb-3">Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {AUTOMATION_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setRules((r) => [...r, { ...t, enabled: true }]);
                toast.success('Template added');
              }}
              className="text-left p-3 rounded-xl bg-surface-50 border border-surface-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
            >
              <div className="text-xs text-surface-700">
                <span className="font-semibold text-primary-700">When</span> {t.when}<br />
                <span className="font-semibold text-emerald-700">Then</span> {t.then}
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 4) HR CHAT (existing /ai/chat backend) — modernized UI shell
// ════════════════════════════════════════════════════════════════
function HrChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Hi! I\'m your HR knowledge assistant. Ask me about Philippine labor law, HR policies, employee benefits, or any HR-related questions.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { message: userMsg });
      setMessages((m) => [...m, { role: 'assistant', content: res.data.reply }]);
    } catch (err: any) {
      setMessages((m) => [...m, { role: 'assistant', content: err.response?.data?.message?.[0] || 'Failed to get response. Make sure ANTHROPIC_API_KEY is configured.' }]);
    } finally { setLoading(false); }
  }

  return (
    <Card padding="none" className="flex flex-col h-[calc(100vh-320px)] min-h-[400px]">
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-gradient-to-br from-primary-600 to-accent-600 text-white rounded-br-md'
                : 'bg-surface-100 text-surface-800 rounded-bl-md'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-100 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-surface-200 p-4">
        <div className="flex gap-2">
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about labor law, HR policies, benefits…"
            className="flex-1 bg-white border border-surface-200 hover:border-surface-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 rounded-lg h-10 px-3.5 text-sm transition-all outline-none"
            disabled={loading}
          />
          <Button onClick={send} disabled={loading || !input.trim()} leftIcon={<Send className="w-3.5 h-3.5" />}>
            Send
          </Button>
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {['13th month pay rules?', 'Overtime computation?', 'Maternity leave policy?', 'AWOL procedure?'].map((q) => (
            <button key={q} onClick={() => setInput(q)}
              className="text-2xs px-3 py-1.5 rounded-full border border-surface-200 text-surface-500 hover:bg-surface-50 whitespace-nowrap">
              {q}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════
// 5-7) Existing AI tools (Resume / JD / Review) — preserved
// ════════════════════════════════════════════════════════════════
function ResumeParser() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function parse() {
    if (!text.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await api.post('/ai/parse-resume', { resumeText: text });
      setResult(res.data);
    } catch (err: any) {
      setResult({ error: err.response?.data?.message?.[0] || 'Failed. Check API key.' });
    } finally { setLoading(false); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-sm font-semibold text-surface-900 mb-3">Paste Resume Text</h2>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={16}
          className="w-full bg-white border border-surface-200 hover:border-surface-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 rounded-lg px-3.5 py-2.5 text-xs font-mono transition-all outline-none"
          placeholder="Paste the resume content here…" />
        <Button onClick={parse} disabled={loading || !text.trim()} className="mt-4" fullWidth leftIcon={loading ? undefined : <Sparkles className="w-3.5 h-3.5" />} loading={loading}>
          {loading ? 'Parsing…' : 'Parse Resume'}
        </Button>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-surface-900 mb-3">Extracted Data</h2>
        {!result ? (
          <p className="text-surface-400 text-sm py-8 text-center">Paste a resume and click Parse</p>
        ) : result.error ? (
          <p className="text-rose-600 text-sm">{result.error}</p>
        ) : (
          <div className="space-y-4 text-sm max-h-[500px] overflow-y-auto">
            <KvSection title="Personal">
              <KvRow label="Name" value={`${result.firstName || ''} ${result.middleName || ''} ${result.lastName || ''}`} />
              <KvRow label="Email" value={result.email} />
              <KvRow label="Mobile" value={result.mobile} />
              <KvRow label="DOB" value={result.dateOfBirth} />
              <KvRow label="Address" value={[result.address, result.city, result.province].filter(Boolean).join(', ')} />
            </KvSection>
            {result.experience?.length > 0 && (
              <KvSection title="Experience">
                {result.experience.map((ex: any, i: number) => (
                  <div key={i} className="mb-2">
                    <p className="font-medium text-surface-800">{ex.position}</p>
                    <p className="text-surface-500">{ex.company} • {ex.duration}</p>
                  </div>
                ))}
              </KvSection>
            )}
            {result.skills?.length > 0 && (
              <KvSection title="Skills">
                <div className="flex flex-wrap gap-1.5">
                  {result.skills.map((s: string, i: number) => (
                    <Badge key={i} variant="brand" size="sm">{s}</Badge>
                  ))}
                </div>
              </KvSection>
            )}
            <button onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
              className="text-2xs text-primary-700 hover:underline flex items-center gap-1 mt-2">
              <Copy className="w-3 h-3" /> Copy JSON
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

function JdGenerator() {
  const [form, setForm] = useState({ position: '', department: '', requirements: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!form.position) return;
    setLoading(true); setResult('');
    try {
      const res = await api.post('/ai/generate-jd', form);
      setResult(res.data.jobDescription);
    } catch (err: any) {
      setResult('Failed: ' + (err.response?.data?.message?.[0] || 'Check API key'));
    } finally { setLoading(false); }
  }

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-sm font-semibold text-surface-900 mb-4">Job Details</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Position Title *</label>
            <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="w-full bg-white border border-surface-200 hover:border-surface-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 rounded-lg h-10 px-3.5 text-sm outline-none transition-all" placeholder="e.g. Warehouse Supervisor" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Department</label>
            <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full bg-white border border-surface-200 hover:border-surface-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 rounded-lg h-10 px-3.5 text-sm outline-none transition-all" placeholder="e.g. Operations" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Additional Requirements</label>
            <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              className="w-full bg-white border border-surface-200 hover:border-surface-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 rounded-lg px-3.5 py-2.5 text-sm outline-none transition-all" rows={4} placeholder="Any specific skills, certifications, experience…" />
          </div>
          <Button onClick={generate} disabled={loading || !form.position} fullWidth loading={loading} leftIcon={loading ? undefined : <Sparkles className="w-3.5 h-3.5" />}>
            {loading ? 'Generating…' : 'Generate JD'}
          </Button>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-surface-900">Generated JD</h2>
          {result && (
            <button onClick={copy} className="text-2xs text-primary-700 hover:underline flex items-center gap-1">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
        {result ? (
          <div className="prose prose-sm max-w-none max-h-[500px] overflow-y-auto whitespace-pre-wrap text-surface-700 text-sm">{result}</div>
        ) : (
          <p className="text-surface-400 text-sm py-8 text-center">Fill in the details and click Generate</p>
        )}
      </Card>
    </div>
  );
}

function ReviewGenerator() {
  const [form, setForm] = useState({
    employeeName: '', position: '', period: '',
    strengths: '', improvements: '', goals: '',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!form.employeeName || !form.position) return;
    setLoading(true); setResult('');
    try {
      const res = await api.post('/ai/generate-review', form);
      setResult(res.data.review);
    } catch (err: any) {
      setResult('Failed: ' + (err.response?.data?.message?.[0] || 'Check API key'));
    } finally { setLoading(false); }
  }

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const baseInput = 'w-full bg-white border border-surface-200 hover:border-surface-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 rounded-lg h-10 px-3.5 text-sm outline-none transition-all';
  const baseTextarea = baseInput.replace('h-10', '').replace('px-3.5 ', 'px-3.5 py-2.5 ');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <h2 className="text-sm font-semibold text-surface-900 mb-4">Review Details</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1.5">Employee Name *</label>
              <input type="text" value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} className={baseInput} />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-600 mb-1.5">Position *</label>
              <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={baseInput} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Review Period</label>
            <input type="text" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className={baseInput} placeholder="e.g. Jan - Jun 2025" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Strengths / Accomplishments</label>
            <textarea value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} className={baseTextarea} rows={3} placeholder="Key strengths…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Areas for Improvement</label>
            <textarea value={form.improvements} onChange={(e) => setForm({ ...form, improvements: e.target.value })} className={baseTextarea} rows={3} placeholder="Areas needing development…" />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-600 mb-1.5">Goals for Next Period</label>
            <textarea value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} className={baseTextarea} rows={2} placeholder="Goals and targets…" />
          </div>
          <Button onClick={generate} disabled={loading || !form.employeeName || !form.position} fullWidth loading={loading} leftIcon={loading ? undefined : <Sparkles className="w-3.5 h-3.5" />}>
            {loading ? 'Generating…' : 'Generate Review'}
          </Button>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-surface-900">Generated Review</h2>
          {result && (
            <button onClick={copy} className="text-2xs text-primary-700 hover:underline flex items-center gap-1">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
        {result ? (
          <div className="prose prose-sm max-w-none max-h-[500px] overflow-y-auto whitespace-pre-wrap text-surface-700 text-sm">{result}</div>
        ) : (
          <p className="text-surface-400 text-sm py-8 text-center">Fill in the details and click Generate</p>
        )}
      </Card>
    </div>
  );
}

// ─── helpers for parser output ───
function KvSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-2xs font-semibold text-surface-400 uppercase tracking-wider mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
function KvRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-surface-500">{label}</span>
      <span className="text-surface-800 font-medium text-right">{value}</span>
    </div>
  );
}
