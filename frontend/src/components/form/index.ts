/**
 * NextNova form primitives — barrel export.
 *
 * Usage:
 *   import {
 *     FormSection, FormGrid, FormActions, SaveIndicator,
 *   } from '@/components/form';
 *
 * Pair with:
 *   - <Input/>, <Textarea/>, <Select/> from '@/components/ui'
 *   - useFormDraft, useUnsavedChangesWarning from '@/hooks'
 *   - validators from '@/lib/validation'
 */
export { default as FormSection }    from './FormSection';
export { default as FormGrid }       from './FormGrid';
export { default as FormActions }    from './FormActions';
export { default as SaveIndicator }  from './SaveIndicator';
export type { SaveState }            from './SaveIndicator';
