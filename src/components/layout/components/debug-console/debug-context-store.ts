import { create } from "zustand";

export interface ContextSnapshot {
  variables: Record<string, unknown>;
  ts: number | string; // Unix ms (number) or ISO string from event
}

interface DebugContextState {
  /** chat_id → latest context snapshot */
  snapshots: Map<string, ContextSnapshot>;
  setSnapshot: (chat_id: string, snapshot: ContextSnapshot) => void;
  clearSnapshots: () => void;
}

export const useDebugContextStore = create<DebugContextState>((set) => ({
  snapshots: new Map(),

  setSnapshot: (chat_id, snapshot) => {
    set((state) => {
      const next = new Map(state.snapshots);
      next.set(chat_id, snapshot);
      return { snapshots: next };
    });
  },

  clearSnapshots: () => {
    set({ snapshots: new Map() });
  },
}));
