// constructor/store/index.ts

import { create } from "zustand";
import { FlowStoreState } from "./types";
import { createFlowSlice } from "./flowSlice";
import { createClipboardSlice } from "./clipboardSlice";
import { createActions } from "./actions";
import { Connection, addEdge } from "reactflow";

// `...a` o'rniga to'g'ridan-to'g'ri `(set, get)` ishlatish kodni tushunarliroq qiladi.
// Keling, shu usulga o'tamiz.
export const useFlowStore = create<FlowStoreState>()((set, get) => {
  return {
    initialState: null, // Boshlang'ich qiymat null

    // UI holatlari uchun boshlang'ich qiymatlar
    isDirty: false,
    isLoading: false,

    isCtrlPressed: false, // Boshlang'ich holat
    setCtrlPressed: (isPressed) => set({ isCtrlPressed: isPressed }),

    // Barcha slice'larni birlashtiramiz
    // Har bir slice'ga (set, get) ni uzatamiz
    ...createFlowSlice(set, get, {} as any),
    ...createClipboardSlice(set, get, {} as any),
    ...createActions(set, get, {} as any),

    onConnect: (connection: Connection) => {
      const newEdge = {
        ...connection,
        type: "smoothstep",
        animated: true,
      };

      set({
        edges: addEdge(newEdge, get().edges),
        isDirty: true,
      });
    },
  };
});
