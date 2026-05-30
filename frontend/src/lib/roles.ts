/**
 * NextNova Roles — frontend-only role helpers.
 *
 * IMPORTANT: This is COSMETIC only. It hides UI based on a localStorage-
 * stored role. It is NOT a security boundary. Real authorization must be
 * enforced server-side. The backend currently does not check roles, so
 * any user can still hit any API endpoint regardless of what's set here.
 *
 * When the backend ships role-based auth, this hook should read the role
 * from the JWT/session instead of localStorage.
 */

export type Role = 'owner' | 'admin' | 'manager' | 'hr' | 'employee';

export const ROLE_ORDER: Role[] = ['employee', 'hr', 'manager', 'admin', 'owner'];

export const ROLE_META: Record<Role, { label: string; description: string; tone: 'brand' | 'success' | 'info' | 'warning' | 'neutral' }> = {
  owner:    { label: 'Owner',    description: 'Full access to everything',            tone: 'brand' },
  admin:    { label: 'Admin',    description: 'Manage company settings and users',    tone: 'warning' },
  manager:  { label: 'Manager',  description: 'View team data, approve requests',     tone: 'info' },
  hr:       { label: 'HR',       description: 'Manage employees and records',         tone: 'success' },
  employee: { label: 'Employee', description: 'View own profile and self-service',    tone: 'neutral' },
};

const LS_KEY = 'nn:role';

/** Load the currently-stored role (defaults to owner for demo purposes). */
export function loadRole(): Role {
  if (typeof window === 'undefined') return 'owner';
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw && ROLE_ORDER.includes(raw as Role)) return raw as Role;
  } catch { /* */ }
  return 'owner';
}

export function saveRole(role: Role): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(LS_KEY, role); } catch { /* */ }
}

/**
 * Returns true if the given role meets the minimum required role.
 * Hierarchical: owner > admin > manager > hr > employee.
 */
export function roleAtLeast(current: Role, required: Role): boolean {
  return ROLE_ORDER.indexOf(current) >= ROLE_ORDER.indexOf(required);
}

/**
 * Canonical permission map — UI guards read these.
 * NEW permissions: add the key + role threshold. UI checks via hasPermission.
 */
export const PERMISSIONS = {
  'employees.create':    'hr',
  'employees.edit':      'hr',
  'employees.archive':   'admin',
  'employees.viewSalary': 'manager',
  'payroll.generate':    'admin',
  'payroll.approve':     'owner',
  'leave.approve':       'manager',
  'leave.viewAll':       'hr',
  'licenses.manage':     'hr',
  'company.settings':    'admin',
  'company.branding':    'admin',
  'company.billing':     'owner',
  'workspace.invite':    'admin',
  'ai.use':              'employee',
  'reports.export':      'hr',
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, perm: Permission): boolean {
  return roleAtLeast(role, PERMISSIONS[perm] as Role);
}
