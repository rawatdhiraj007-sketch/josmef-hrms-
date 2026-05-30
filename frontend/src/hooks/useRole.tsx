'use client';

import {
  createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo,
} from 'react';
import { loadRole, saveRole, hasPermission, type Role, type Permission } from '@/lib/roles';

interface RoleContextType {
  role: Role;
  setRole: (r: Role) => void;
  /** Convenience: returns true if current role has the permission */
  can: (perm: Permission) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>('owner');

  useEffect(() => {
    setRoleState(loadRole());
    // Re-sync if the role changes in another tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'nn:role' && e.newValue) setRoleState(e.newValue as Role);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setRole = useCallback((r: Role) => {
    saveRole(r);
    setRoleState(r);
  }, []);

  const can = useCallback((perm: Permission) => hasPermission(role, perm), [role]);

  const value = useMemo<RoleContextType>(() => ({ role, setRole, can }), [role, setRole, can]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextType {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    // Fallback when not wrapped — defaults to owner (most permissive)
    return { role: 'owner', setRole: () => {}, can: () => true };
  }
  return ctx;
}
