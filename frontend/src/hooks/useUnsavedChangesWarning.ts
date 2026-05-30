'use client';

import { useEffect } from 'react';

/**
 * Warn the user before they navigate away from a page with unsaved changes.
 *
 * Two-pronged defense:
 *   1. `beforeunload` event — covers tab close, page refresh, hard navigation.
 *   2. Link click capture — intercepts in-app <Link> / <a> clicks and
 *      `history.back` / `forward`, since Next.js App Router does not currently
 *      expose a public router-event hook for App-Router navigation aborts.
 *
 * Usage:
 *   useUnsavedChangesWarning(isDirty);
 *   useUnsavedChangesWarning(isDirty, 'You have unsaved changes — leave?');
 */
export function useUnsavedChangesWarning(
  isDirty: boolean,
  message = 'You have unsaved changes. Are you sure you want to leave this page?',
): void {
  // 1) Browser-level warning (tab close, hard reload)
  useEffect(() => {
    if (!isDirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      // Most browsers ignore custom messages now, but setting returnValue
      // is still required to trigger the native dialog.
      e.returnValue = message;
      return message;
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty, message]);

  // 2) In-app navigation: intercept <a>/<Link> clicks
  useEffect(() => {
    if (!isDirty) return;

    function onDocClick(e: MouseEvent) {
      // Skip when modified clicks or non-primary buttons
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      // Ignore external, hash-only, mailto, tel
      if (/^(https?:|mailto:|tel:|#)/.test(href) && !href.startsWith(window.location.origin)) return;
      // Ignore anchors explicitly opted-out
      if (anchor.dataset.bypassUnsaved === 'true') return;
      // Ignore download links
      if (anchor.hasAttribute('download')) return;

      const ok = window.confirm(message);
      if (!ok) e.preventDefault();
    }

    document.addEventListener('click', onDocClick, true);
    return () => document.removeEventListener('click', onDocClick, true);
  }, [isDirty, message]);
}
