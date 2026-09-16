import { create } from "zustand";

export type DebugNodeStatus = "waiting" | "running" | "success" | "error";

const TERMINAL: DebugNodeStatus[] = ["success", "error"];

/**
 * Returns true if the incoming status should NOT override the current status.
 * Rule: once a node has reached a terminal state (success/error) it stays there
 * until the next run or retry attempt resets it. "waiting" / "running" from a stale
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
const MAX_RETIRED_EXECUTIONS = 64;

/** Wire timestamps are Unix seconds or milliseconds; arrival time is not evidence of execution order. */
function occurrenceTime(ts: number | undefined): number | undefined {
  if (typeof ts !== "number" || !Number.isFinite(ts) || ts <= 0) return undefined;
  return ts < 1e12 ? ts * 1000 : ts;
}

interface DebugStatusState {
  /** nodeId → execution status (set from engine events over WS) */
  statuses: Record<string, DebugNodeStatus>;
  /** nodeId → error message (only for status==="error") */
  errors: Record<string, string>;
  /** nodeId → latest accepted timestamp (ms), including arrival-time fallback */
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
  retiredExecutionIds: string[];
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
  retiredExecutionIds: [],
  attempts: {},
  activeNodeId: null,
  lastStatus: null,

  setNodeStatus: (nodeId, status, ts, error, runId, seq, executionId, attempt) => {
    const eventTime = occurrenceTime(ts);
    const timestamp = eventTime ?? Date.now();
    let accepted = false;

    set((state) => {
      if (typeof runId === "number" && Number.isFinite(runId) && runId > 0) {
        if (executionId && state.retiredExecutionIds.includes(executionId)) {
          return state;
        }
        const executionChanged =
          Boolean(executionId) && executionId !== state.currentExecutionId;
        const latestAppliedTs = Math.max(0, ...Object.values(state.timestamps));
        // A different UUID is not a runtime incarnation. A counter reset requires
        // strictly newer occurrence time, never arrival time. At equal timestamps,
        // advancing run_id orders normal executions within the same second.
        // Without runtime identity, unseen executions across restarts remain ambiguous.
        if (
          executionChanged &&
          state.currentRunId !== null &&
          (eventTime === undefined ||
            eventTime < latestAppliedTs ||
            (eventTime === latestAppliedTs && runId <= state.currentRunId))
        ) {
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

        const incomingAttempt =
          typeof attempt === "number" && Number.isInteger(attempt) && attempt > 0
            ? attempt
            : 1;
        const previousAttempt = base.attempts[nodeId] ?? 1;
        if (incomingAttempt < previousAttempt) return state;
        const newAttempt = incomingAttempt > previousAttempt;

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
          !newAttempt &&
          !terminalOverridesNonTerminal &&
          typeof seq === "number" &&
          prevSeq !== undefined &&
          seq <= prevSeq
        ) {
          return state;
        }

        // Terminal guard: do not let waiting/running override success/error
        // on the same run (e.g. a late trigger event after node already ran).
        if (!newAttempt && terminalGuard(base.statuses[nodeId], status)) {
          return state;
        }

        const errors = { ...base.errors };
        if (status === "error" && error) errors[nodeId] = error;
        else delete errors[nodeId];
        const seqs = { ...base.seqs };
        if (newAttempt) delete seqs[nodeId];
        if (typeof seq === "number") seqs[nodeId] = seq;
        const nextExecutionId =
          executionId || (isNewRun ? null : state.currentExecutionId);
        accepted = true;
        return {
          currentRunId: runId,
          retiredExecutionIds:
            state.currentExecutionId && state.currentExecutionId !== nextExecutionId
              ? [...state.retiredExecutionIds, state.currentExecutionId].slice(
                  -MAX_RETIRED_EXECUTIONS
                )
              : state.retiredExecutionIds,
          currentExecutionId: nextExecutionId,
          activeNodeId: nodeId,
          lastStatus: status,
          statuses: { ...base.statuses, [nodeId]: status },
          timestamps: {
            ...base.timestamps,
            [nodeId]: Math.max(base.timestamps[nodeId] ?? 0, timestamp),
          },
          seqs,
          attempts: { ...base.attempts, [nodeId]: incomingAttempt },
          errors,
        };
      }

      return state;
    });
    if (accepted) armAutoClear(get);
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
      retiredExecutionIds: [],
      attempts: {},
      activeNodeId: null,
      lastStatus: null,
    });
  },
}));
