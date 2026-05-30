'use client';

import { ReactNode } from 'react';
import { useRole } from '@/hooks/useRole';
import type { Permission, Role } from '@/lib/roles';
import { roleAtLeast } from '@/lib/roles';

interface IfRoleProps {
  /** Permission key (preferred) */
  can?: Permission;
  /** OR a minimum role */
  atLeast?: Role;
  /** Optional fallback when access denied */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally render based on the current role.
 *
 *   <IfRole can="company.billing">…billing UI…</IfRole>
 *   <IfRole atLeast="manager">…manager-or-above UI…</IfRole>
 *
 * COSMETIC ONLY. Do not use as a security boundary. Server-side
 * authorization is still required for real protection (not yet wired).
 */
export default function IfRole({ can, atLeast, fallback = null, children }: IfRoleProps) {
  const { role, can: hasCan } = useRole();
  let allowed = true;
  if (can)     allowed = allowed && hasCan(can);
  if (atLeast) allowed = allowed && roleAtLeast(role, atLeast);
  return <>{allowed ? children : fallback}</>;
}
