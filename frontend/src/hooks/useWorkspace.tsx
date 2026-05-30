'use client';

import {
  createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo,
} from 'react';
import {
  loadWorkspace, saveWorkspace, applyWorkspaceBranding, resetWorkspace,
  loadPlan, savePlan, getPlan, type WorkspaceConfig, type PlanTier, type PlanDef,
  DEFAULT_WORKSPACE,
} from '@/lib/workspace';

interface WorkspaceContextType {
  workspace: WorkspaceConfig;
  plan: PlanTier;
  planDef: PlanDef;
  /** Save + apply a new workspace config */
  update: (cfg: WorkspaceConfig) => void;
  /** Reset workspace branding to defaults */
  reset: () => void;
  /** Update the current plan id (display-only) */
  setPlan: (p: PlanTier) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

/**
 * Mount once near the top of the app (above any UI that reads workspace
 * config). Applies the saved branding on mount so the first paint already
 * has the customer's colors.
 */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceConfig>(DEFAULT_WORKSPACE);
  const [plan, setPlanState] = useState<PlanTier>('free');

  useEffect(() => {
    const w = loadWorkspace();
    setWorkspace(w);
    applyWorkspaceBranding(w);
    setPlanState(loadPlan());
  }, []);

  const update = useCallback((cfg: WorkspaceConfig) => {
    saveWorkspace(cfg);
    setWorkspace(cfg);
  }, []);

  const reset = useCallback(() => {
    resetWorkspace();
    setWorkspace(DEFAULT_WORKSPACE);
  }, []);

  const setPlan = useCallback((p: PlanTier) => {
    savePlan(p);
    setPlanState(p);
  }, []);

  const value = useMemo<WorkspaceContextType>(() => ({
    workspace, plan, planDef: getPlan(plan), update, reset, setPlan,
  }), [workspace, plan, update, reset, setPlan]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextType {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    return {
      workspace: DEFAULT_WORKSPACE,
      plan: 'free',
      planDef: getPlan('free'),
      update: () => {}, reset: () => {}, setPlan: () => {},
    };
  }
  return ctx;
}
