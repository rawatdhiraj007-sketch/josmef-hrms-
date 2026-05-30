'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Auto-save form draft to localStorage with debounce + restore on mount.
 *
 * Usage:
 *   const { values, setValues, setField, restoreDraft, clearDraft,
 *           hasDraft, isDirty, lastSavedAt } = useFormDraft({
 *     key: 'nn:draft:employee:new',
 *     initial: defaults,
 *     debounceMs: 800,
 *   });
 *
 * Skip for edit forms by passing `enabled: false` (e.g. when loading
 * existing entity data — you don't want draft to overwrite real values).
 */
export interface UseFormDraftOptions<T> {
  /** localStorage key. Should be unique per form instance (use entity id). */
  key: string;
  /** Initial values (used if no draft is found). */
  initial: T;
  /** Debounce delay before writing to localStorage (default 800ms). */
  debounceMs?: number;
  /** Disable persistence entirely (e.g. for view-only forms). */
  enabled?: boolean;
  /** Skip auto-restoring on mount; caller must call restoreDraft() manually. */
  manualRestore?: boolean;
}

export interface UseFormDraftReturn<T> {
  values: T;
  /** Set the full values object (full replacement). */
  setValues: (v: T | ((prev: T) => T)) => void;
  /** Set one field by key. */
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Manually restore from localStorage (only needed if manualRestore=true). */
  restoreDraft: () => T | null;
  /** Erase the draft from localStorage (e.g. after successful submit). */
  clearDraft: () => void;
  /** Has a draft been autosaved? */
  hasDraft: boolean;
  /** Have values changed from the initial value? */
  isDirty: boolean;
  /** When was the draft last persisted to localStorage? */
  lastSavedAt: Date | null;
  /** Mark current values as the new "clean" baseline (e.g. after server save). */
  markClean: () => void;
}

export function useFormDraft<T>({
  key,
  initial,
  debounceMs = 800,
  enabled = true,
  manualRestore = false,
}: UseFormDraftOptions<T>): UseFormDraftReturn<T> {
  // Stable baseline for dirty detection. Serialized once.
  const baselineRef = useRef<string>(JSON.stringify(initial));

  const [values, setValuesState] = useState<T>(() => {
    if (!enabled || manualRestore || typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return initial;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.values) {
        return { ...initial, ...parsed.values };
      }
    } catch { /* ignore */ }
    return initial;
  });

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(() => {
    if (!enabled || typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.savedAt ? new Date(parsed.savedAt) : null;
    } catch { return null; }
  });

  const [hasDraft, setHasDraft] = useState<boolean>(() => {
    if (!enabled || typeof window === 'undefined') return false;
    return !!window.localStorage.getItem(key);
  });

  // Debounced persistence
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        const payload = { values, savedAt: new Date().toISOString() };
        window.localStorage.setItem(key, JSON.stringify(payload));
        setLastSavedAt(new Date());
        setHasDraft(true);
      } catch { /* localStorage quota or disabled */ }
    }, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [values, key, debounceMs, enabled]);

  const setValues = useCallback<UseFormDraftReturn<T>['setValues']>((v) => {
    setValuesState((prev) => (typeof v === 'function' ? (v as (p: T) => T)(prev) : v));
  }, []);

  const setField = useCallback<UseFormDraftReturn<T>['setField']>((k, val) => {
    setValuesState((prev) => ({ ...prev, [k]: val }));
  }, []);

  const restoreDraft = useCallback((): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed?.values) {
        setValuesState({ ...initial, ...parsed.values });
        return parsed.values as T;
      }
    } catch { /* */ }
    return null;
  }, [key, initial]);

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.removeItem(key); } catch { /* */ }
    setLastSavedAt(null);
    setHasDraft(false);
  }, [key]);

  const markClean = useCallback(() => {
    baselineRef.current = JSON.stringify(values);
  }, [values]);

  const isDirty = JSON.stringify(values) !== baselineRef.current;

  return {
    values, setValues, setField, restoreDraft, clearDraft,
    hasDraft, isDirty, lastSavedAt, markClean,
  };
}
