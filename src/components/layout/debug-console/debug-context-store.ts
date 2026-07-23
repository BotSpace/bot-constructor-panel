import { create } from "zustand";

export interface ContextSnapshot {
  variables: Record<string, unknown>;
  ts: number | string; // Unix ms (number) or ISO string from event
}

export interface NodeContextSnapshot extends ContextSnapshot {
  chat_id: string;
  changes: Record<string, unknown>;
  removed: string[];
  run_id?: number;
}

interface DebugContextState {
  /** chat_id → latest context snapshot */
  snapshots: Map<string, ContextSnapshot>;
  /** node_id → that node's latest context write diff */
  nodeSnapshots: Map<string, NodeContextSnapshot>;
  setSnapshot: (chat_id: string, snapshot: ContextSnapshot) => void;
  setNodeSnapshot: (node_id: string, snapshot: NodeContextSnapshot) => void;
  clearSnapshots: () => void;
  /**
   * Seed initial snapshots from GET /api/debug/context/ on mount.
   * Only writes when the store is currently empty — subsequent WS events
   * always win (setSnapshot overwrites individual entries).
   */
  seedSnapshots: (entries: Array<{ chat_id: string; snapshot: ContextSnapshot }>) => void;
}

export const useDebugContextStore = create<DebugContextState>((set, get) => ({
  snapshots: new Map(),
  nodeSnapshots: new Map(),

  setSnapshot: (chat_id, snapshot) => {
    set((state) => {
      const next = new Map(state.snapshots);
      next.set(chat_id, snapshot);
      return { snapshots: next };
    });
  },

  setNodeSnapshot: (node_id, snapshot) => {
    set((state) => {
      const next = new Map(state.nodeSnapshots);
      next.set(node_id, snapshot);
      return { nodeSnapshots: next };
    });
  },

  clearSnapshots: () => {
    set({ snapshots: new Map(), nodeSnapshots: new Map() });
  },

  seedSnapshots: (entries) => {
    // Only seed when store is empty — avoids overwriting fresher WS data
    if (get().snapshots.size > 0) return;
    if (entries.length === 0) return;
    const next = new Map<string, ContextSnapshot>();
    for (const { chat_id, snapshot } of entries) {
      next.set(chat_id, snapshot);
    }
    set({ snapshots: next });
  },
}));
