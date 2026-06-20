import { create } from "zustand";

type DebugConsoleStore = {
  isOpen: boolean;
  height: number;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setHeight: (height: number) => void;
};



export const debugConsoleStore = create<DebugConsoleStore>((set) => ({
  isOpen: false,
  height: 300, // Default height
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
    })),
  setHeight: (height: number) => set({ height }),
}));