import { create } from "zustand";

export type DebugNodeStatus = "running" | "success" | "error";

const TERMINAL: DebugNodeStatus[] = ["success", "error"];

interface DebugStatusState {
  /** nodeId → execution status (set from engine events over WS) */
  statuses: Record<string, DebugNodeStatus>;
  /** nodeId → error message (only for status==="error") */
  errors: Record<string, string>;
  /** nodeId → event timestamp (ms) of the currently applied status */
  timestamps: Record<string, number>;
  setNodeStatus: (
    nodeId: string,
    status: DebugNodeStatus,
    ts?: number,
    error?: string
  ) => void;
  clearStatuses: () => void;
}

export const useDebugStatusStore = create<DebugStatusState>((set) => ({
  statuses: {},
  errors: {},
  timestamps: {},

  setNodeStatus: (nodeId, status, ts, error) =>
    set((state) => {
      const incomingTs = typeof ts === "number" ? ts : Date.now();
      const prevTs = state.timestamps[nodeId];
      const prevStatus = state.statuses[nodeId];

      // The engine sends running + terminal events in separate goroutines with
      // no ordering guarantee, so they can arrive out of order. Apply ordering:
      //  - newer ts always wins (a fresh run resets the node)
      //  - on an equal ts, a terminal status (success/error) wins over "running"
      //    so a late "running" doesn't override an already-arrived success.
      if (prevTs !== undefined) {
        if (incomingTs < prevTs) return state;
        if (incomingTs === prevTs) {
          const prevTerminal = prevStatus && TERMINAL.includes(prevStatus);
          const incomingTerminal = TERMINAL.includes(status);
          if (prevTerminal && !incomingTerminal) return state;
        }
      }

      return {
        statuses: { ...state.statuses, [nodeId]: status },
        timestamps: { ...state.timestamps, [nodeId]: incomingTs },
        errors:
          status === "error" && error
            ? { ...state.errors, [nodeId]: error }
            : state.errors,
      };
    }),

  clearStatuses: () => set({ statuses: {}, errors: {}, timestamps: {} }),
}));
