import { create } from "zustand";

/** Alert severity. Old backends omit it → normalised to "error". */
export type FlowAlertLevel = "error" | "warning" | "info";

export interface FlowError {
  /** Unique ID for React keys */
  id: string;
  project: string | number;
  chat_id?: string | number;
  node_id?: string;
  node_type?: string;
  /** Severity: error | warning | info. Defaults to "error" when absent. */
  level: FlowAlertLevel;
  /** Human-readable message from backend */
  message: string;
  /** Raw detail / stack */
  detail?: string;
  /** Unix ms or ISO string from backend */
  ts: number | string;
  /** Whether the user has opened the panel since this error arrived */
  read: boolean;
}

const MAX_ERRORS = 100;

let _errorCounter = 0;
function nextId(): string {
  return `fe-${Date.now()}-${++_errorCounter}`;
}

/** Coerce any incoming value to a valid level; unknown/absent → "error". */
function normLevel(v: unknown): FlowAlertLevel {
  return v === "warning" || v === "info" ? v : "error";
}

/** Incoming raw alert: level may be any/absent value — the store coerces it. */
type RawAlert = Omit<FlowError, "id" | "read" | "level"> & { level?: unknown };

/** Shape accepted by syncValidationWarnings — stable id is caller's responsibility. */
export type ValidationWarning = {
  /** Must start with "cv-" and be stable across re-runs (e.g. "cv-payment-<nodeId>-paid"). */
  id: string;
  project: string | number;
  node_id?: string;
  node_type?: string;
  message: string;
  ts: number;
};

interface DebugErrorsState {
  errors: FlowError[];
  /** Number of errors that arrived while the panel was closed */
  unreadCount: number;
  addError: (raw: RawAlert) => void;
  markAllRead: () => void;
  clearErrors: () => void;
  /** Seed errors from initial GET /api/debug/errors/ response */
  seedErrors: (raws: Array<RawAlert>) => void;
  /**
   * Replace the current set of client-side validation warnings (id prefix "cv-").
   * Preserves read state for already-seen warnings; increments unreadCount only
   * for genuinely new ones. Pass an empty array to clear all validation warnings.
   */
  syncValidationWarnings: (warnings: ValidationWarning[]) => void;
}

export const useDebugErrorsStore = create<DebugErrorsState>((set, get) => ({
  errors: [],
  unreadCount: 0,

  addError(raw) {
    const error: FlowError = { ...raw, level: normLevel(raw.level), id: nextId(), read: false };
    set((state) => {
      const errors = [error, ...state.errors].slice(0, MAX_ERRORS);
      return { errors, unreadCount: state.unreadCount + 1 };
    });
  },

  markAllRead() {
    set((state) => ({
      errors: state.errors.map((e) => ({ ...e, read: true })),
      unreadCount: 0,
    }));
  },

  clearErrors() {
    set({ errors: [], unreadCount: 0 });
  },

  seedErrors(raws) {
    // Only seed when store is empty to avoid duplicates on re-mount
    if (get().errors.length > 0) return;
    const errors: FlowError[] = raws
      .slice(0, MAX_ERRORS)
      .map((r) => ({ ...r, level: normLevel(r.level), id: nextId(), read: true }));
    set({ errors, unreadCount: 0 });
  },

  syncValidationWarnings(warnings) {
    set((state) => {
      // Index current validation warnings by their stable id.
      const prevById = new Map<string, FlowError>(
        state.errors.filter((e) => e.id.startsWith("cv-")).map((e) => [e.id, e])
      );
      // Keep non-validation errors untouched.
      const nonValidation = state.errors.filter((e) => !e.id.startsWith("cv-"));

      const next: FlowError[] = warnings.map((w) => {
        const prev = prevById.get(w.id);
        return {
          ...w,
          level: "warning" as FlowAlertLevel,
          // Preserve read state if this exact warning was already shown.
          read: prev?.read ?? false,
        };
      });

      // Only count warnings that did not exist before as "unread".
      const newlyAdded = next.filter((w) => !prevById.has(w.id)).length;

      return {
        errors: [...next, ...nonValidation].slice(0, MAX_ERRORS),
        unreadCount: state.unreadCount + newlyAdded,
      };
    });
  },
}));
