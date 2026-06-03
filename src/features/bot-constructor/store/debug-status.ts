import { create } from "zustand";

export type DebugNodeStatus = "waiting" | "running" | "success" | "error";

const TERMINAL: DebugNodeStatus[] = ["success", "error"];

/** Inactivity (ms) after which all statuses auto-clear. */
const AUTO_CLEAR_MS = 60_000;

let autoClearTimer: ReturnType<typeof setTimeout> | null = null;

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
  /**
   * Call when a new trigger fires. Clears all previous execution state,
   * then marks every trigger node in the flow as "waiting" (yellow glow).
   * Subsequent setNodeStatus calls will override these with real events.
   */
  startNewRun: (triggerNodeIds: string[]) => void;
  clearStatuses: () => void;
}

export const useDebugStatusStore = create<DebugStatusState>((set, get) => ({
  statuses: {},
  errors: {},
  timestamps: {},

  startNewRun: (triggerNodeIds) => {
    if (autoClearTimer) clearTimeout(autoClearTimer);
    autoClearTimer = setTimeout(() => get().clearStatuses(), AUTO_CLEAR_MS);

    // ts=0 so any real setNodeStatus event (ts > 0) always wins
    const newStatuses: Record<string, DebugNodeStatus> = {};
    const newTimestamps: Record<string, number> = {};
    for (const id of triggerNodeIds) {
      newStatuses[id] = "waiting";
      newTimestamps[id] = 0;
    }
    set({ statuses: newStatuses, errors: {}, timestamps: newTimestamps });
  },

  setNodeStatus: (nodeId, status, ts, error) => {
    const now = Date.now();

    // (Re)arm the inactivity auto-clear: everything resets after AUTO_CLEAR_MS
    // of no events.
    if (autoClearTimer) clearTimeout(autoClearTimer);
    autoClearTimer = setTimeout(() => get().clearStatuses(), AUTO_CLEAR_MS);

    set((state) => {
      const incomingTs = typeof ts === "number" ? ts : now;
      const prevTs = state.timestamps[nodeId];
      const prevStatus = state.statuses[nodeId];

      // The engine sends running + terminal events in separate goroutines with
      // no ordering guarantee. Apply ordering: newer ts wins; on an equal ts a
      // terminal status (success/error) beats a non-terminal one. Re-running a
      // node (a fresh run) carries a newer ts so it repaints correctly.
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
    });
  },

  clearStatuses: () => {
    if (autoClearTimer) {
      clearTimeout(autoClearTimer);
      autoClearTimer = null;
    }
    set({ statuses: {}, errors: {}, timestamps: {} });
  },
}));
