import { create } from "zustand";

export type DebugNodeStatus = "waiting" | "running" | "success" | "error";

const TERMINAL: DebugNodeStatus[] = ["success", "error"];

/** Wall-clock gap (ms) after which an incoming event is treated as a new run. */
const NEW_RUN_GAP_MS = 1500;
/** Inactivity (ms) after which all statuses auto-clear. */
const AUTO_CLEAR_MS = 60_000;

let lastEventWall = 0;
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
  clearStatuses: () => void;
}

export const useDebugStatusStore = create<DebugStatusState>((set, get) => ({
  statuses: {},
  errors: {},
  timestamps: {},

  setNodeStatus: (nodeId, status, ts, error) => {
    const now = Date.now();

    // New request: a fresh event after a gap resets the previous run's colors
    // so the new run paints from a clean slate.
    const isNewRun = lastEventWall !== 0 && now - lastEventWall > NEW_RUN_GAP_MS;
    lastEventWall = now;

    // (Re)arm the inactivity auto-clear.
    if (autoClearTimer) clearTimeout(autoClearTimer);
    autoClearTimer = setTimeout(() => get().clearStatuses(), AUTO_CLEAR_MS);

    set((state) => {
      const base: Pick<DebugStatusState, "statuses" | "errors" | "timestamps"> =
        isNewRun ? { statuses: {}, errors: {}, timestamps: {} } : state;

      const incomingTs = typeof ts === "number" ? ts : now;
      const prevTs = base.timestamps[nodeId];
      const prevStatus = base.statuses[nodeId];

      // The engine sends running + terminal events in separate goroutines with
      // no ordering guarantee. Apply ordering: newer ts wins; on an equal ts a
      // terminal status (success/error) beats a non-terminal one.
      if (prevTs !== undefined) {
        if (incomingTs < prevTs) return base;
        if (incomingTs === prevTs) {
          const prevTerminal = prevStatus && TERMINAL.includes(prevStatus);
          const incomingTerminal = TERMINAL.includes(status);
          if (prevTerminal && !incomingTerminal) return base;
        }
      }

      return {
        statuses: { ...base.statuses, [nodeId]: status },
        timestamps: { ...base.timestamps, [nodeId]: incomingTs },
        errors:
          status === "error" && error
            ? { ...base.errors, [nodeId]: error }
            : base.errors,
      };
    });
  },

  clearStatuses: () => {
    if (autoClearTimer) {
      clearTimeout(autoClearTimer);
      autoClearTimer = null;
    }
    lastEventWall = 0;
    set({ statuses: {}, errors: {}, timestamps: {} });
  },
}));
