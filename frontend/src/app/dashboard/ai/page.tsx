'use client';

import { useState } from 'react';
import api from '@/lib/api';
import {
  Sparkles, FileText, MessageSquare, Briefcase, ClipboardList,
  Send, Loader2, Copy, Check, ArrowRight,
} from 'lucide-react';

const tabs = [
  { id: 'chat', label: 'HR Assistant', icon: MessageSquare },
  { id: 'resume', label: 'Resume Parser', icon: FileText },
  { id: 'jd', label: 'JD Generator', icon: Briefcase },
  { id: 'review', label: 'Performance Review', icon: ClipboardList },
];

export default function AiHubPage() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-brand-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Hub</h1>
            <p className="text-gray-500 text-sm">AI-powered HR tools</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === t.id ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-surface-100'
            }`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'chat' && <HrChat />}
      {activeTab === 'resume' && <ResumeParser />}
      {activeTab === 'jd' && <JdGenerator />}
      {activeTab === 'review' && <ReviewGenerator />}
    </div>
  );
}

/* ─── HR Chat Assistant ─── */
function HrChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: 'assistant', content: 'Hi! I\'m your HR Assistant. Ask me about Philippine labor law, HR policies, employee benefits, or any HR-related questions.' },
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
    <div className="card flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-brand-600 text-white rounded-br-md'
                : 'bg-surface-100 text-gray-800 rounded-bl-md'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-surface-100 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-surface-200 p-4">
        <div className="flex gap-3">
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about labor law, HR policies, benefits..."
            className="input-field flex-1"
            disabled={loading}
          />
          <button onClick={send} disabled={loading || !input.trim()}
            className="btn-primary px-4 flex items-center gap-2">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {['13th month pay rules?', 'Overtime computation?', 'Maternity leave policy?', 'AWOL procedure?'].map((q) => (
            <button key={q} onClick={() => { setInput(q); }}
              className="text-xs px-3 py-1.5 rounded-full border border-surface-200 text-gray-500 hover:bg-surface-50 whitespace-nowrap">
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Resume Parser ─── */
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
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Paste Resume Text</h2>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={16}
          className="input-field font-mono text-xs" placeholder="Paste the resume content here..." />
        <button onClick={parse} disabled={loading || !text.trim()} className="btn-primary mt-4 w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'Parsing...' : 'Parse Resume'}
        </button>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Extracted Data</h2>
        {!result ? (
          <p className="text-gray-400 text-sm py-8 text-center">Paste a resume and click Parse</p>
        ) : result.error ? (
          <p className="text-red-500 text-sm">{result.error}</p>
        ) : (
          <div className="space-y-4 text-sm max-h-[500px] overflow-y-auto">
            <Section title="Personal">
              <Row label="Name" value={`${result.firstName || ''} ${result.middleName || ''} ${result.lastName || ''}`} />
              <Row label="Email" value={result.email} />
              <Row label="Mobile" value={result.mobile} />
              <Row label="DOB" value={result.dateOfBirth} />
              <Row label="Address" value={[result.address, result.city, result.province].filter(Boolean).join(', ')} />
            </Section>
            <Section title="Position">
              <Row label="Applied For" value={result.positionApplied} />
              <Row label="Expected Salary" value={result.expectedSalary} />
            </Section>
            {result.education?.length > 0 && (
              <Section title="Education">
                {result.education.map((ed: any, i: number) => (
                  <div key={i} className="mb-1">
                    <p className="font-medium text-gray-800">{ed.degree}</p>
                    <p className="text-gray-500">{ed.school} {ed.year ? `(${ed.year})` : ''}</p>
                  </div>
                ))}
              </Section>
            )}
            {result.experience?.length > 0 && (
              <Section title="Experience">
                {result.experience.map((ex: any, i: number) => (
                  <div key={i} className="mb-2">
                    <p className="font-medium text-gray-800">{ex.position}</p>
                    <p className="text-gray-500">{ex.company} • {ex.duration}</p>
                    {ex.description && <p className="text-gray-400 text-xs mt-0.5">{ex.description}</p>}
                  </div>
                ))}
              </Section>
            )}
            {result.skills?.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((s: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs">{s}</span>
                  ))}
                </div>
              </Section>
            )}
            {result.summary && (
              <Section title="Summary">
                <p className="text-gray-600">{result.summary}</p>
              </Section>
            )}
            <button onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
              className="text-sm text-brand-600 hover:underline flex items-center gap-1 mt-2">
              <Copy className="w-4 h-4" /> Copy JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── JD Generator ─── */
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
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Position Title *</label>
            <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="input-field" placeholder="e.g. Warehouse Supervisor" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
            <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="input-field" placeholder="e.g. Operations" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Requirements</label>
            <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              className="input-field" rows={4} placeholder="Any specific skills, certifications, experience..." />
          </div>
          <button onClick={generate} disabled={loading || !form.position}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Generating...' : 'Generate JD'}
          </button>
        </div>
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Generated JD</h2>
          {result && (
            <button onClick={copy} className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
        {result ? (
          <div className="prose prose-sm max-w-none max-h-[500px] overflow-y-auto whitespace-pre-wrap text-gray-700">{result}</div>
        ) : (
          <p className="text-gray-400 text-sm py-8 text-center">Fill in the details and click Generate</p>
        )}
      </div>
    </div>
  );
}

/* ─── Performance Review Generator ─── */
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Employee Name *</label>
              <input type="text" value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Position *</label>
              <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Review Period</label>
            <input type="text" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
              className="input-field" placeholder="e.g. Jan - Jun 2025" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Strengths / Accomplishments</label>
            <textarea value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })}
              className="input-field" rows={3} placeholder="Key strengths and accomplishments..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Areas for Improvement</label>
            <textarea value={form.improvements} onChange={(e) => setForm({ ...form, improvements: e.target.value })}
              className="input-field" rows={3} placeholder="Areas needing development..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Goals for Next Period</label>
            <textarea value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })}
              className="input-field" rows={2} placeholder="Goals and targets..." />
          </div>
          <button onClick={generate} disabled={loading || !form.employeeName || !form.position}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Generating...' : 'Generate Review'}
          </button>
        </div>
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Generated Review</h2>
          {result && (
            <button onClick={copy} className="text-sm text-brand-600 hover:underline flex items-center gap-1">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>
        {result ? (
          <div className="prose prose-sm max-w-none max-h-[500px] overflow-y-auto whitespace-pre-wrap text-gray-700">{result}</div>
        ) : (
          <p className="text-gray-400 text-sm py-8 text-center">Fill in the details and click Generate</p>
        )}
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium text-right">{value}</span>
    </div>
  );
}
