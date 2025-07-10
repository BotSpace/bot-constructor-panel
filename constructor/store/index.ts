// constructor/store/index.ts

import { create } from "zustand";
import { FlowStoreState } from "./types";
import { createFlowSlice } from "./flowSlice";
import { createClipboardSlice } from "./clipboardSlice";
import { createActions } from "./actions";
import { Connection, addEdge } from "reactflow";

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
        type: "smart-edge", // Bizning maxsus chizig'imiz
        // Rasmga mos stil
        style: {
          strokeWidth: 1.5,
          stroke: "#495057", // To'q kulrang
        },
        // Strelka uchini ham chiziq rangiga moslaymiz
        markerEnd: {
          type: "arrowclosed",
          width: 20,
          height: 20,
          color: "#495057", // To'q kulrang
        },
        animated: false,
      };

      set({
        edges: addEdge(newEdge, get().edges),
        isDirty: true,
      });
    },
  };
});
