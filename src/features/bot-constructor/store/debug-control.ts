import { create } from "zustand";

interface DebugControlStore {
  runNode: ((nodeId: string) => Promise<void>) | null;
  setRunNode: (fn: ((nodeId: string) => Promise<void>) | null) => void;
}

export const useDebugControlStore = create<DebugControlStore>((set) => ({
  runNode: null,
  setRunNode: (fn) => set({ runNode: fn }),
}));
