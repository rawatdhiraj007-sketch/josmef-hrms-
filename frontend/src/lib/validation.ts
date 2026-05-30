/**
 * Tiny, dependency-free validation helpers.
 * Build a per-field validator function and run it on submit (or on blur).
 *
 *   const errors = validate(values, {
 *     email: [required(), email()],
 *     mobile: [required(), pattern(/^[0-9+\-\s]+$/, 'Numbers only')],
 *     basicSalary: [min(0, 'Salary cannot be negative')],
 *   });
 *
 * `errors` is { fieldName: 'message' } — empty object means valid.
 */

export type Validator<V = any> = (value: V, all?: any) => string | null;

export type FieldRules<T> = Partial<Record<keyof T, Validator[]>>;
export type Errors<T> = Partial<Record<keyof T, string>>;

// ─── Built-in validators ───────────────────────────────────

export const required = (msg = 'Required'): Validator => (v) => {
  if (v === null || v === undefined) return msg;
  if (typeof v === 'string' && v.trim() === '') return msg;
  if (Array.isArray(v) && v.length === 0) return msg;
  return null;
};

export const email = (msg = 'Enter a valid email'): Validator<string> => (v) => {
  if (!v) return null;
  // Pragmatic regex — not RFC perfect, but catches typos
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : msg;
};

export const minLength = (n: number, msg?: string): Validator<string> => (v) => {
  if (!v) return null;
  return v.length >= n ? null : (msg ?? `Must be at least ${n} characters`);
};

export const maxLength = (n: number, msg?: string): Validator<string> => (v) => {
  if (!v) return null;
  return v.length <= n ? null : (msg ?? `Must be at most ${n} characters`);
};

export const pattern = (re: RegExp, msg = 'Invalid format'): Validator<string> => (v) => {
  if (!v) return null;
  return re.test(v) ? null : msg;
};

export const min = (n: number, msg?: string): Validator<string | number> => (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const num = typeof v === 'number' ? v : parseFloat(v);
  if (Number.isNaN(num)) return null;
  return num >= n ? null : (msg ?? `Must be at least ${n}`);
};

export const max = (n: number, msg?: string): Validator<string | number> => (v) => {
  if (v === '' || v === null || v === undefined) return null;
  const num = typeof v === 'number' ? v : parseFloat(v);
  if (Number.isNaN(num)) return null;
  return num <= n ? null : (msg ?? `Must be at most ${n}`);
};

/** Validator that runs only if `when(values)` returns true. */
export const when = <T>(when: (all: T) => boolean, validator: Validator): Validator => (v, all) => {
  if (!when(all)) return null;
  return validator(v, all);
};

// ─── Runner ────────────────────────────────────────────────

export function validate<T extends object>(values: T, rules: FieldRules<T>): Errors<T> {
  const errors: Errors<T> = {};
  for (const key of Object.keys(rules) as Array<keyof T>) {
    const validators = rules[key];
    if (!validators) continue;
    for (const v of validators) {
      const err = v(values[key], values);
      if (err) {
        errors[key] = err;
        break;
      }
    }
  }
  return errors;
}

/** Returns true if there are no validation errors. */
export function isValid<T>(errors: Errors<T>): boolean {
  return Object.keys(errors).length === 0;
}
