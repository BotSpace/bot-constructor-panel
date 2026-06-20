import { StateCreator } from "zustand";
import { FlowStoreState, HistorySlice } from "@/features/bot-constructor/store/types";
import type { Node, Edge } from "reactflow";

// History state snapshot
export type HistoryState = {
  nodes: Node[];
  edges: Edge[];
};

const cloneFlowItems = <T>(items: T[], fieldName: "nodes" | "edges"): T[] => {
  if (!Array.isArray(items)) {
    console.error(
      `History saqlashda ${fieldName} array emas, bo'sh array ishlatildi`,
      { value: items },
    );
    return [];
  }

  return JSON.parse(JSON.stringify(items));
};

export const createHistorySlice: StateCreator<
  FlowStoreState,
  [],
  [],
  HistorySlice
> = (set, get) => {
  const MAX_HISTORY_SIZE = 50; // Maksimal history hajmi
  let isUndoRedoInProgress = false; // Undo/redo operatsiyasi davomida flag

  const saveToHistoryInternal = (state: HistoryState) => {
    const { history, historyIndex } = get();
    
    // Agar hozirgi index history oxirida bo'lmasa, keyingi barcha state'larni o'chirib tashlaymiz
    // (yangi branch yaratish o'rniga)
    const newHistory = history.slice(0, historyIndex + 1);
    
    // Yangi state ni qo'shamiz
    newHistory.push({
      nodes: cloneFlowItems(state.nodes, "nodes"), // Deep copy
      edges: cloneFlowItems(state.edges, "edges"), // Deep copy
    });

    // Maksimal hajmdan oshib ketmasligi uchun eski state'larni o'chiramiz
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  };

  return {
    history: [],
    historyIndex: -1,

    // History ga saqlash funksiyasi
    saveToHistory: () => {
      const { nodes, edges, isLoading } = get();
      
      // Loading yoki undo/redo paytida history ga saqlamaymiz
      if (isLoading || isUndoRedoInProgress) return;

      // Agar history bo'sh bo'lsa, birinchi state ni saqlaymiz
      const { history } = get();
      if (history.length === 0) {
        saveToHistoryInternal({ nodes, edges });
        return;
      }

      // Oxirgi state bilan solishtiramiz, agar o'zgarish bo'lmasa, saqlamaymiz
      const lastState = history[history.length - 1];
      const nodesChanged = JSON.stringify(nodes) !== JSON.stringify(lastState.nodes);
      const edgesChanged = JSON.stringify(edges) !== JSON.stringify(lastState.edges);
      
      if (nodesChanged || edgesChanged) {
        saveToHistoryInternal({ nodes, edges });
      }
    },

    // Undo funksiyasi
    undo: () => {
      const { history, historyIndex } = get();
      
      if (historyIndex <= 0) {
        // History bo'sh yoki birinchi state da turibmiz
        return;
      }

      isUndoRedoInProgress = true;

      const previousIndex = historyIndex - 1;
      const previousState = history[previousIndex];

      set({
        nodes: cloneFlowItems(previousState.nodes, "nodes"),
        edges: cloneFlowItems(previousState.edges, "edges"),
        historyIndex: previousIndex,
        isDirty: true, // Undo qilganda ham o'zgarish bo'lgani uchun
      });

      // Kichik kechikishdan keyin flag ni o'chiramiz
      setTimeout(() => {
        isUndoRedoInProgress = false;
      }, 0);
    },

    // Redo funksiyasi
    redo: () => {
      const { history, historyIndex } = get();
      
      if (historyIndex >= history.length - 1) {
        // Oxirgi state da turibmiz
        return;
      }

      isUndoRedoInProgress = true;

      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];

      set({
        nodes: cloneFlowItems(nextState.nodes, "nodes"),
        edges: cloneFlowItems(nextState.edges, "edges"),
        historyIndex: nextIndex,
        isDirty: true, // Redo qilganda ham o'zgarish bo'lgani uchun
      });

      // Kichik kechikishdan keyin flag ni o'chiramiz
      setTimeout(() => {
        isUndoRedoInProgress = false;
      }, 0);
    },

    // History ni tozalash (masalan, yangi flow yuklanganda)
    clearHistory: () => {
      const { nodes, edges } = get();
      
      set({
        history: [
          {
            nodes: cloneFlowItems(nodes, "nodes"),
            edges: cloneFlowItems(edges, "edges"),
          },
        ],
        historyIndex: 0,
      });
    },
  };
};
