import { create } from "zustand";

export type DebugNodeStatus = "waiting" | "running" | "success" | "error";

const TERMINAL: DebugNodeStatus[] = ["success", "error"];

/**
 * Returns true if the incoming status should NOT override the current status.
 * Rule: once a node has reached a terminal state (success/error) it stays there
 * until the next run resets everything. "waiting" / "running" from a stale
 * trigger event must never flip a green/red node back to yellow/spinning.
 */
function terminalGuard(
  prevStatus: DebugNodeStatus | undefined,
  incoming: DebugNodeStatus
): boolean {
  if (!prevStatus) return false;
  const prevTerminal = TERMINAL.includes(prevStatus);
  const incomingTerminal = TERMINAL.includes(incoming);
  // Already at terminal → only another terminal (e.g. error after success) or
  // nothing overrides it. "waiting"/"running" cannot replace terminal.
  return prevTerminal && !incomingTerminal;
}

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
        // ISTISNO: terminal status (success/error) kelsa, oldingi non-terminal
        // (waiting/running) holatini seq tartibidan qat'i nazar yengadi.
        // Sabab: emitWaiting (yuqori seq, "waiting") async HTTP tufayli
        // success (past seq) dan OLDIN yetib kelsa, seq guard success'ni
        // noto'g'ri bloklab, node "waiting" holatida qolib ketadi.
        const prevSeq = base.seqs[nodeId];
        const prevStatusForSeq = base.statuses[nodeId];
        const incomingTerminal = TERMINAL.includes(status);
        const prevNonTerminal =
          prevStatusForSeq === undefined || !TERMINAL.includes(prevStatusForSeq);
        const terminalOverridesNonTerminal = incomingTerminal && prevNonTerminal;
        if (
          !terminalOverridesNonTerminal &&
          typeof seq === "number" &&
          prevSeq !== undefined &&
          seq <= prevSeq
        ) {
          return isNewRun ? { ...base, currentRunId: runId } : state;
        }

        // Terminal guard: do not let waiting/running override success/error on
        // the same run (e.g. a late trigger event after the node already ran).
        // EXCEPTION: a strictly NEWER "running" (higher seq) is a legitimate
        // re-execution — an AI agent's provider/tool accessory runs
        // running→success MULTIPLE times within one run (the agent loop), so
        // the 2nd "running" must flip the node back to spinning.
        // Only "running" qualifies — NOT "waiting": the engine emits a
        // higher-seq "waiting" for downstream nodes when a node finishes, and
        // that must never un-finish an already-succeeded node.
        const isReexecRunning =
          status === "running" &&
          typeof seq === "number" &&
          prevSeq !== undefined &&
          seq > prevSeq;
        if (
          !isNewRun &&
          !isReexecRunning &&
          terminalGuard(base.statuses[nodeId], status)
        ) {
          return state;
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
      // Terminal guard: once success/error is set, waiting/running cannot
      // override it (protects against late trigger events arriving after node ran).
      if (terminalGuard(prevStatus, status)) return state;

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
