import { create } from "zustand";

interface DebugControlStore {
  // DebugingButtons o'zining haqiqiy run/reload funksiyasini shu yerga registratsiya
  // qiladi; context menu va Ctrl+R shu orqali AYNAN bir xil oqimni ishlatadi
  // (starting flag, save'ni kutish, limit/error handling). Dublikat logika yo'q.
  reloadDebug: (() => void) | null;
  setReloadDebug: (fn: (() => void) | null) => void;
}

export const useDebugControlStore = create<DebugControlStore>((set) => ({
  reloadDebug: null,
  setReloadDebug: (fn) => set({ reloadDebug: fn }),
}));
