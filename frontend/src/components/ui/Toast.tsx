'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type Variant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  variant: Variant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  show: (toast: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const VARIANT_STYLE = {
  success: { icon: CheckCircle2, bar: 'bg-emerald-500', glow: 'shadow-[0_0_24px_rgba(16,185,129,0.2)]' },
  error:   { icon: XCircle,      bar: 'bg-rose-500',    glow: 'shadow-[0_0_24px_rgba(244,63,94,0.2)]' },
  warning: { icon: AlertTriangle, bar: 'bg-amber-500',  glow: 'shadow-[0_0_24px_rgba(245,158,11,0.2)]' },
  info:    { icon: Info,         bar: 'bg-primary-500', glow: 'shadow-[0_0_24px_rgba(99,102,241,0.2)]' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const show = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const t: Toast = { duration: 4000, ...toast, id };
    setToasts(prev => [...prev, t]);
    if (t.duration && t.duration > 0) {
      setTimeout(() => dismiss(id), t.duration);
    }
  }, [dismiss]);

  const helpers = {
    show,
    success: (title: string, description?: string) => show({ variant: 'success', title, description }),
    error:   (title: string, description?: string) => show({ variant: 'error',   title, description }),
    warning: (title: string, description?: string) => show({ variant: 'warning', title, description }),
    info:    (title: string, description?: string) => show({ variant: 'info',    title, description }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={helpers}>
      {children}
      {/* ── Toast viewport (top-right) ── */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const v = VARIANT_STYLE[t.variant];
          const Icon = v.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto bg-white border border-surface-200 rounded-xl shadow-card-hover ${v.glow} overflow-hidden animate-slide-up flex`}
              role="status"
            >
              <div className={`w-1 flex-shrink-0 ${v.bar}`} />
              <div className="flex-1 px-4 py-3 flex gap-3 items-start min-w-0">
                <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${t.variant === 'success' ? 'text-emerald-500' : t.variant === 'error' ? 'text-rose-500' : t.variant === 'warning' ? 'text-amber-500' : 'text-primary-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-900 truncate">{t.title}</div>
                  {t.description && (
                    <div className="text-xs text-surface-500 mt-0.5 line-clamp-2">{t.description}</div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="text-surface-400 hover:text-surface-700 -mr-1 flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe noop fallback
    const noop = () => {};
    return {
      show: noop, success: noop, error: noop, warning: noop, info: noop, dismiss: noop,
    } as ToastContextType;
  }
  return ctx;
}
