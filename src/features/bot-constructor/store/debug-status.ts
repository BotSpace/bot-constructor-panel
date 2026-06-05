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
  /** nodeId → engine `seq` of the currently applied status (run_id-aware path) */
  seqs: Record<string, number>;
  /**
   * Engine 3.5.31+ events carry a monotonically increasing `run_id`
   * (one per Telegram update). Events from an older run are ignored;
   * a newer run resets all state. null = no run-aware event seen yet.
   */
  currentRunId: number | null;
  setNodeStatus: (
    nodeId: string,
    status: DebugNodeStatus,
    ts?: number,
    error?: string,
    runId?: number,
    seq?: number
  ) => void;
  /**
   * LEGACY (engines without run_id): call when a trigger fires. Clears all
   * previous execution state, then marks every trigger node as "waiting".
   */
  startNewRun: (triggerNodeIds: string[]) => void;
  clearStatuses: () => void;
}

function armAutoClear(get: () => DebugStatusState) {
  if (autoClearTimer) clearTimeout(autoClearTimer);
  autoClearTimer = setTimeout(() => get().clearStatuses(), AUTO_CLEAR_MS);
}

export const useDebugStatusStore = create<DebugStatusState>((set, get) => ({
  statuses: {},
  errors: {},
  timestamps: {},
  seqs: {},
  currentRunId: null,

  startNewRun: (triggerNodeIds) => {
    armAutoClear(get);

    // ts=0 so any real setNodeStatus event (ts > 0) always wins
    const newStatuses: Record<string, DebugNodeStatus> = {};
    const newTimestamps: Record<string, number> = {};
    for (const id of triggerNodeIds) {
      newStatuses[id] = "waiting";
      newTimestamps[id] = 0;
    }
    set({ statuses: newStatuses, errors: {}, timestamps: newTimestamps, seqs: {} });
  },

  setNodeStatus: (nodeId, status, ts, error, runId, seq) => {
    const now = Date.now();
    armAutoClear(get);

    set((state) => {
      // ── run_id-aware path (engine 3.5.31+) ────────────────────────────────
      // Tartibni tarmoq emas, engine'ning o'zi belgilaydi: run_id (har update
      // uchun monotonik) + seq (global atomik). Trigger eventining kechikishi
      // endi holatni buzmaydi: YANGI run_id ko'ringan zahoti (qaysi node
      // bo'lishidan qat'i nazar) reset bo'ladi, eski run eventlari tashlanadi.
      if (typeof runId === "number" && runId > 0) {
        if (state.currentRunId !== null && runId < state.currentRunId) {
          return state; // eski run'ning kechikkan eventi
        }

        const isNewRun = state.currentRunId === null || runId > state.currentRunId;
        const base = isNewRun
          ? { statuses: {}, errors: {}, timestamps: {}, seqs: {} }
          : {
              statuses: state.statuses,
              errors: state.errors,
              timestamps: state.timestamps,
              seqs: state.seqs,
            };

        // Bir node ichida seq bo'yicha: eski seq yangisini yenga olmaydi.
        const prevSeq = base.seqs[nodeId];
        if (
          typeof seq === "number" &&
          prevSeq !== undefined &&
          seq <= prevSeq
        ) {
          return isNewRun ? { ...base, currentRunId: runId } : state;
        }

        return {
          currentRunId: runId,
          statuses: { ...base.statuses, [nodeId]: status },
          timestamps: { ...base.timestamps, [nodeId]: ts ?? now },
          seqs:
            typeof seq === "number"
              ? { ...base.seqs, [nodeId]: seq }
              : base.seqs,
          errors:
            status === "error" && error
              ? { ...base.errors, [nodeId]: error }
              : base.errors,
        };
      }

      // ── LEGACY ts path (run_id'siz eski engine'lar) ───────────────────────
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
    set({ statuses: {}, errors: {}, timestamps: {}, seqs: {}, currentRunId: null });
  },
}));
