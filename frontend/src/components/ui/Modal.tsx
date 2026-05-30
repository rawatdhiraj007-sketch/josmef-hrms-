'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Drawer side; if set, renders as side drawer instead of centered modal */
  drawer?: 'right' | 'left' | 'bottom';
  /** Bottom action bar */
  footer?: ReactNode;
  /** Disable closing on backdrop click */
  staticBackdrop?: boolean;
  children: ReactNode;
}

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
} as const;

const DRAWER_SIZES = {
  right:  'right-0 top-0 h-full max-w-md w-full !rounded-r-none animate-slide-in-right',
  left:   'left-0 top-0 h-full max-w-md w-full !rounded-l-none animate-slide-in-left',
  bottom: 'left-0 right-0 bottom-0 max-h-[85vh] !rounded-b-none animate-slide-in-bottom',
} as const;

export default function Modal({
  open, onClose, title, description,
  size = 'md', drawer, footer, staticBackdrop, children,
}: ModalProps) {
  // ── Esc to close + lock body scroll ──
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !staticBackdrop) onClose(); };
    document.addEventListener('keydown', onKey);
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = orig;
    };
  }, [open, onClose, staticBackdrop]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      onClick={() => !staticBackdrop && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface-900/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative bg-white rounded-2xl shadow-[0_20px_50px_-10px_rgb(0_0_0_/_0.25)]
          w-full overflow-hidden
          ${drawer ? `fixed ${DRAWER_SIZES[drawer]}` : `${SIZES[size]} animate-scale-in`}
        `}
      >
        {/* Header */}
        {(title || description) && (
          <header className="flex items-start justify-between px-5 py-4 border-b border-surface-100">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 id="modal-title" className="text-base font-semibold text-surface-900">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-xs text-surface-500 mt-0.5">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mt-1 -mr-1 w-8 h-8 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </header>
        )}

        {/* Body */}
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <footer className="flex items-center justify-end gap-2 px-5 py-3 border-t border-surface-100 bg-surface-50/40">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
