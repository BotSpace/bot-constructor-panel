// constructor/store/index.ts

import { create } from "zustand";
import { FlowStoreState } from "./types";
import { createFlowSlice } from "./flowSlice";
import { createClipboardSlice } from "./clipboardSlice";
import { createHistorySlice } from "./historySlice";
import { createActions } from "./actions";
import { Connection, addEdge } from "reactflow";

// Keling, shu usulga o'tamiz.
export const useFlowStore = create<FlowStoreState>()((set, get) => {
  return {
    initialState: null, // Boshlang'ich qiymat null

    // UI holatlari uchun boshlang'ich qiymatlar
    isDirty: false,
    isLoading: false,
    lastSavedTime: null,
    countdownRemaining: null,
    countdownDuration: 2000, // 2 sekund

    isCtrlPressed: false, // Boshlang'ich holat
    setCtrlPressed: (isPressed) => set({ isCtrlPressed: isPressed }),

    startCountdown: () => {
      set({ countdownRemaining: get().countdownDuration });
    },

    stopCountdown: () => {
      set({ countdownRemaining: null });
    },

    // Barcha slice'larni birlashtiramiz
    // Har bir slice'ga (set, get) ni uzatamiz
    ...createFlowSlice(set, get, {} as any),
    ...createClipboardSlice(set, get, {} as any),
    ...createHistorySlice(set, get, {} as any),
    ...createActions(set, get, {} as any),

    onConnect: (connection: Connection) => {
      const { initialState, saveToHistory } = get();

      // History ga saqlash (undo/redo flag tekshiriladi ichida)
      saveToHistory();

      // EditMessageHandler'dan chiqqan edge'ni aniqlash
      const isEditMessageEdge =
        connection.sourceHandle === "edit-message-handler";

      const newEdge = {
        ...connection,
        type: "step",
        markerEnd: {
          type: "arrow",
          width: 30,
          height: 30,
          color: isEditMessageEdge ? "#f97316" : "#495057",
        },
        // React Flow'ning default edge'ini ishlatamiz
        // Rasmga mos stil
        style: {
          strokeWidth: 1.5,
          stroke: isEditMessageEdge ? "#f97316" : "#495057", // Orange-500 yoki to'q kulrang
        },
        // EditMessageHandler'dan chiqqan edge'lar uchun animated true
        animated: isEditMessageEdge ? true : false,
      };

      const newEdges = addEdge(newEdge, get().edges);

      // Haqiqiy o'zgarishlarni tekshirish
      const hasRealChanges =
        !initialState ||
        JSON.stringify(newEdges) !== JSON.stringify(initialState.edges);

      set({
        edges: newEdges,
        isDirty: hasRealChanges,
      });
    },
  };
});
