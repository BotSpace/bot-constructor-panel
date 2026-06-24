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

interface DebugErrorsState {
  errors: FlowError[];
  /** Number of errors that arrived while the panel was closed */
  unreadCount: number;
  addError: (raw: RawAlert) => void;
  markAllRead: () => void;
  clearErrors: () => void;
  /** Seed errors from initial GET /api/debug/errors/ response */
  seedErrors: (raws: Array<RawAlert>) => void;
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
}));
