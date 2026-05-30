'use client';

import { ReactNode } from 'react';
import Button from '@/components/ui/Button';
import { Save } from 'lucide-react';
import SaveIndicator, { SaveState } from './SaveIndicator';

interface FormActionsProps {
  /** Save state (for the inline indicator) */
  saveState?: SaveState;
  lastSavedAt?: Date | null;
  errorMessage?: string;
  dirty?: boolean;

  /** Cancel button click handler — shows "Cancel" button when provided */
  onCancel?: () => void;
  cancelLabel?: string;

  /** Submit button label (defaults to "Save") */
  submitLabel?: string;
  /** Show a loading spinner on the submit button */
  submitting?: boolean;
  /** Disable the submit button regardless of submitting state */
  submitDisabled?: boolean;

  /** Optional extra actions rendered between Cancel and Save */
  extra?: ReactNode;

  /** Make the bar sticky to the bottom of the viewport */
  sticky?: boolean;

  /**
   * If true, renders the submit as a regular <button type="submit">.
   * If false, expects you to wire it manually via onSubmit.
   */
  useFormSubmit?: boolean;
  onSubmit?: () => void;
}

/**
 * Premium form footer — left side shows save state, right side shows actions.
 * Drop this at the bottom of any <form>.
 */
export default function FormActions({
  saveState = 'idle',
  lastSavedAt,
  errorMessage,
  dirty,
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel = 'Save',
  submitting,
  submitDisabled,
  extra,
  sticky,
  useFormSubmit = true,
  onSubmit,
}: FormActionsProps) {
  const bar = (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${sticky ? 'px-4 py-3 bg-white/90 backdrop-blur-sm border-t border-surface-200 rounded-b-2xl' : ''}`}>
      <div className="min-w-0">
        <SaveIndicator
          state={saveState}
          lastSavedAt={lastSavedAt}
          errorMessage={errorMessage}
          dirty={dirty}
        />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {extra}
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        <Button
          type={useFormSubmit ? 'submit' : 'button'}
          onClick={useFormSubmit ? undefined : onSubmit}
          size="sm"
          loading={submitting}
          disabled={submitDisabled}
          leftIcon={!submitting ? <Save className="w-3.5 h-3.5" /> : undefined}
        >
          {submitting ? `${submitLabel.endsWith('e') || submitLabel.endsWith('t') ? submitLabel.slice(0, -1) : submitLabel}ing…` : submitLabel}
        </Button>
      </div>
    </div>
  );

  if (sticky) {
    return (
      <div className="sticky bottom-0 -mx-5 sm:-mx-6 mt-6 z-10">
        {bar}
      </div>
    );
  }
  return <div className="mt-6 pt-4 border-t border-surface-100">{bar}</div>;
}
