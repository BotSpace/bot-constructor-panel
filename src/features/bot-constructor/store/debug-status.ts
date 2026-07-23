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
  /** Durable execution ledger UUID carried by engine 3.5.148+ events. */
  currentExecutionId: string | null;
  /** nodeId → current retry attempt within the execution. */
  attempts: Record<string, number>;
  /** Most recently updated node, used by the compact status-bar indicator. */
  activeNodeId: string | null;
  lastStatus: DebugNodeStatus | null;
  setNodeStatus: (
    nodeId: string,
    status: DebugNodeStatus,
    ts?: number,
    error?: string,
    runId?: number,
    seq?: number,
    executionId?: string,
    attempt?: number
  ) => void;
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
  currentExecutionId: null,
  attempts: {},
  activeNodeId: null,
  lastStatus: null,

  setNodeStatus: (nodeId, status, ts, error, runId, seq, executionId, attempt) => {
    const now = Date.now();
    armAutoClear(get);

    set((state) => {
      // Engine-assigned run_id + seq order events independently of network
      // delivery order.
      // Tartibni tarmoq emas, engine'ning o'zi belgilaydi: run_id (har update
      // uchun monotonik) + seq (global atomik). Trigger eventining kechikishi
      // endi holatni buzmaydi: YANGI run_id ko'ringan zahoti (qaysi node
      // bo'lishidan qat'i nazar) reset bo'ladi, eski run eventlari tashlanadi.
      if (typeof runId === "number" && runId > 0) {
        // Child process qayta ishga tushganda run_id yana 1 dan boshlanadi,
        // execution_id esa har execution uchun yangilanadi. Shu sabab yangi
        // execution kichik run_id bilan kelsa ham uni yangi run deb olamiz.
        // Timestamp guard kechikkan eski execution eventini qaytarmaydi.
        const executionChanged =
          Boolean(executionId) &&
          Boolean(state.currentExecutionId) &&
          executionId !== state.currentExecutionId;
        const latestAppliedTs = Math.max(0, ...Object.values(state.timestamps));
        if (executionChanged && typeof ts === "number" && ts < latestAppliedTs) {
          return state;
        }
        if (
          !executionChanged &&
          state.currentRunId !== null &&
          runId < state.currentRunId
        ) {
          return state; // eski run'ning kechikkan eventi
        }

        const isNewRun =
          executionChanged ||
          state.currentRunId === null ||
          runId > state.currentRunId;
        const base = isNewRun
          ? { statuses: {}, errors: {}, timestamps: {}, seqs: {}, attempts: {} }
          : {
              statuses: state.statuses,
              errors: state.errors,
              timestamps: state.timestamps,
              seqs: state.seqs,
              attempts: state.attempts,
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
          return isNewRun
            ? {
                ...base,
                currentRunId: runId,
                currentExecutionId: executionId ?? null,
                activeNodeId: null,
                lastStatus: null,
              }
            : state;
        }

        // Terminal guard: do not let waiting/running override success/error
        // on the same run (e.g. a late trigger event after node already ran).
        if (!isNewRun && terminalGuard(base.statuses[nodeId], status)) {
          return state;
        }

        return {
          currentRunId: runId,
          currentExecutionId:
            executionId ?? (isNewRun ? null : state.currentExecutionId),
          activeNodeId: nodeId,
          lastStatus: status,
          statuses: { ...base.statuses, [nodeId]: status },
          timestamps: { ...base.timestamps, [nodeId]: ts ?? now },
          seqs:
            typeof seq === "number"
              ? { ...base.seqs, [nodeId]: seq }
              : base.seqs,
          attempts:
            typeof attempt === "number" && attempt > 0
              ? { ...base.attempts, [nodeId]: attempt }
              : base.attempts,
          errors:
            status === "error" && error
              ? { ...base.errors, [nodeId]: error }
              : base.errors,
        };
      }

      return state;
    });
  },

  clearStatuses: () => {
    if (autoClearTimer) {
      clearTimeout(autoClearTimer);
      autoClearTimer = null;
    }
    set({
      statuses: {},
      errors: {},
      timestamps: {},
      seqs: {},
      currentRunId: null,
      currentExecutionId: null,
      attempts: {},
      activeNodeId: null,
      lastStatus: null,
    });
  },
}));
