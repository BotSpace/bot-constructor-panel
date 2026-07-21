import { create } from "zustand";

export type DebugConsoleView = "logs" | "executions";

type DebugConsoleStore = {
  isOpen: boolean;
  height: number;
  view: DebugConsoleView;
  open: () => void;
  openExecutions: () => void;
  close: () => void;
  toggle: () => void;
  toggleExecutions: () => void;
  setView: (view: DebugConsoleView) => void;
  setHeight: (height: number) => void;
};



export const debugConsoleStore = create<DebugConsoleStore>((set) => ({
  isOpen: false,
  height: 300, // Default height
  view: "logs",
  open: () => set({ isOpen: true }),
  openExecutions: () => set({ isOpen: true, view: "executions" }),
  close: () => set({ isOpen: false }),
  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),
  toggleExecutions: () =>
    set((state) => ({
      isOpen: !(state.isOpen && state.view === "executions"),
      view: "executions",
    })),
  setHeight: (height: number) => set({ height }),
  setView: (view) => set({ view }),
}));
