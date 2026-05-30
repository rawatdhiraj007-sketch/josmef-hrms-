'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles, X, Send, Loader2, MessageCircle, ExternalLink, ChevronRight,
} from 'lucide-react';
import { useAi } from '@/hooks/useAi';
import { matchIntent, SUGGESTED_QUERIES, type IntentMatch } from '@/lib/ai';
import { recordAiUse } from '@/lib/aiCredits';

type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; intent?: IntentMatch };

/**
 * Floating AI Assistant — drop-in. Includes a launcher button (bottom-right),
 * a slide-in drawer with a chat-style UI, and intent-based responses powered
 * entirely by the rule-based engine in /lib/ai.
 *
 * Mount once at the top of an authenticated section (e.g. inside the
 * AiProvider). Hidden on small screens by default to avoid clashing with the
 * mobile portal bottom nav; the assistant can be opened from the AI page.
 */
export default function AiAssistant() {
  const { data, loading, refresh, loadedAt } = useAi();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m NextNova AI. Ask me about employees, licenses, leaves, training, or compliance — or pick a suggestion below.',
    },
  ]);

  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, thinking, open]);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || !data) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setThinking(true);
    // Display-only credit counter — see /lib/aiCredits.ts
    recordAiUse();
    // Simulate a small delay so the "thinking" feels real
    window.setTimeout(() => {
      const intent = matchIntent(q, data);
      if (intent) {
        setMessages((m) => [...m, { role: 'assistant', content: intent.response, intent }]);
      } else {
        setMessages((m) => [...m, {
          role: 'assistant',
          content:
            'I\'m not sure how to answer that yet. Try asking about expiring licenses, pending leaves, new hires, or training completion.',
        }]);
      }
      setThinking(false);
    }, 400);
  }

  return (
    <>
      {/* ── Floating launcher button ──
         z-[80] so it sits ABOVE the mobile sidebar (z-50) and any sticky
         action bars (z-30). The button is always visible until the drawer
         is open. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open NextNova AI Assistant"
        className={`
          fixed z-[80] bottom-5 right-5 sm:bottom-6 sm:right-6
          h-14 w-14 rounded-full
          bg-gradient-to-br from-primary-600 to-accent-600
          text-white shadow-[0_8px_32px_rgba(99,102,241,0.45)]
          flex items-center justify-center
          hover:scale-105 active:scale-95
          ring-4 ring-white/40
          transition-transform duration-200
          focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300/60
          ${open ? 'opacity-0 pointer-events-none' : ''}
        `}
      >
        <Sparkles className="w-5 h-5" />
        <span aria-hidden className="absolute inset-0 rounded-full bg-primary-500/40 animate-pulse-ring pointer-events-none" />
        <span aria-hidden className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-white" />
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[85] bg-surface-900/30 backdrop-blur-sm animate-fade-in"
        />
      )}

      {/* ── Drawer ── */}
      <aside
        role="dialog"
        aria-label="NextNova AI Assistant"
        className={`
          fixed z-[90] right-0 top-0 h-full w-full sm:w-[420px]
          bg-white border-l border-surface-200 shadow-[0_0_60px_rgba(0,0,0,0.15)]
          flex flex-col
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
        `}
      >
        {/* Header */}
        <header className="px-4 py-3 border-b border-surface-100 flex items-center gap-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
          <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold tracking-tight">NextNova AI</div>
            <div className="text-2xs text-white/70">
              {loading ? 'Loading data…' : loadedAt ? `Synced ${formatRelative(loadedAt)}` : 'Ready'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Conversation */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-surface-50/40">
          {messages.map((m, i) => (
            <Message key={i} message={m} onGo={(href) => { setOpen(false); router.push(href); }} />
          ))}
          {thinking && (
            <div className="flex items-center gap-2 text-xs text-surface-500 px-3">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Thinking…
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <div className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Try asking</div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  disabled={!data}
                  className="text-2xs px-2.5 py-1.5 rounded-lg bg-white border border-surface-200 hover:border-primary-300 hover:bg-primary-50 text-surface-700 hover:text-primary-700 transition-colors disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="px-3 py-3 border-t border-surface-100 bg-white"
        >
          <div className="flex items-end gap-2 bg-surface-50 border border-surface-200 rounded-2xl px-3 py-2 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-200 transition-all">
            <MessageCircle className="w-4 h-4 text-surface-400 mt-2 flex-shrink-0" />
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder={data ? 'Ask anything about your business…' : 'Loading…'}
              disabled={!data || thinking}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-surface-400 max-h-32"
            />
            <button
              type="submit"
              disabled={!input.trim() || !data || thinking}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary-600 to-accent-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-glow transition-all"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-2xs text-surface-400">Advisory only · Press Esc to close</span>
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="text-2xs text-primary-700 hover:underline disabled:opacity-50"
            >
              Refresh data
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

// ─── Single message bubble ────────────────────────────────
function Message({ message, onGo }: { message: ChatMessage; onGo: (href: string) => void }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-gradient-to-br from-primary-600 to-accent-600 text-white px-3 py-2 rounded-2xl rounded-br-md text-sm shadow-soft">
          {message.content}
        </div>
      </div>
    );
  }
  // assistant
  return (
    <div className="flex gap-2">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-200/40 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-primary-600" />
      </div>
      <div className="max-w-[85%] flex-1 min-w-0">
        <div className="bg-white border border-surface-200 px-3 py-2 rounded-2xl rounded-tl-md text-sm text-surface-800 shadow-soft">
          {message.content}
        </div>
        {message.intent?.results && message.intent.results.length > 0 && (
          <ul className="mt-2 space-y-1">
            {message.intent.results.map((r, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => r.href && onGo(r.href)}
                  disabled={!r.href}
                  className="w-full text-left px-3 py-2 rounded-xl bg-white border border-surface-200 hover:border-primary-300 hover:bg-primary-50/40 transition-colors flex items-center gap-2 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-900 truncate">{r.title}</div>
                    {r.subtitle && <div className="text-2xs text-surface-500 truncate">{r.subtitle}</div>}
                  </div>
                  {r.href && (
                    <ChevronRight className="w-3.5 h-3.5 text-surface-300 group-hover:text-primary-600 transition-colors" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        {message.intent?.href && (
          <button
            type="button"
            onClick={() => onGo(message.intent!.href!)}
            className="mt-2 text-2xs font-medium text-primary-700 hover:text-primary-900 inline-flex items-center gap-1"
          >
            Open page <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function formatRelative(d: Date): string {
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  return d.toLocaleTimeString();
}
