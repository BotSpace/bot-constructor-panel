import { create } from "zustand";

export type DebugNodeStatus = "running" | "success" | "error";

interface DebugStatusState {
  /** nodeId → execution status (set from engine events over WS) */
  statuses: Record<string, DebugNodeStatus>;
  /** nodeId → error message (only for status==="error") */
  errors: Record<string, string>;
  setNodeStatus: (nodeId: string, status: DebugNodeStatus, error?: string) => void;
  clearStatuses: () => void;
}

export const useDebugStatusStore = create<DebugStatusState>((set) => ({
  statuses: {},
  errors: {},

  setNodeStatus: (nodeId, status, error) =>
    set((state) => ({
      statuses: { ...state.statuses, [nodeId]: status },
      errors:
        status === "error" && error
          ? { ...state.errors, [nodeId]: error }
          : state.errors,
    })),

  clearStatuses: () => set({ statuses: {}, errors: {} }),
}));
