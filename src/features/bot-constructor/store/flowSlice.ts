// constructor/store/flowSlice.ts

import { StateCreator } from "zustand";
import {
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  NodeChange,
} from "reactflow";
import { FlowStoreState, FlowSlice } from "./types";

export const createFlowSlice: StateCreator<
  FlowStoreState,
  [],
  [],
  FlowSlice
> = (set, get) => ({
  nodes: [],
  edges: [],

  // --- Yaxshilangan onNodesChange ---
  onNodesChange: (changes: NodeChange[]) => {
    const { initialState, isLoading, saveToHistory } = get();

    // Agar yuklanmoqda bo'lsa, isDirty ni o'zgartirmaymiz
    if (isLoading) {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
        // isLoading bo'lsa, isDirty ni o'zgartirmaymiz
      });
      return;
    }

    const newNodes = applyNodeChanges(changes, get().nodes);

    // Haqiqiy o'zgarishlarni tekshirish
    const hasRealChanges =
      !initialState ||
      JSON.stringify(newNodes) !== JSON.stringify(initialState.nodes);

    // Faqat muhim o'zgarishlar uchun history ga saqlaymiz
    // - Dragging emas bo'lgan o'zgarishlar
    // - Yoki dragging tugagan (dragging: false yoki undefined)
    const hasSignificantChange = changes.some((change) => {
      if (change.type !== "position") return true; // Position emas - muhim
      // Position o'zgarishi - faqat dragging tugagan bo'lsa saqlaymiz
      return change.dragging === false || change.dragging === undefined;
    });

    if (hasSignificantChange && hasRealChanges) {
      // History ga saqlash (undo/redo flag tekshiriladi ichida)
      saveToHistory();
    }

    set({
      // Yangilangan o'zgarishlarni qo'llaymiz
      nodes: newNodes,
      isDirty: hasRealChanges,
    });
  },

  // --- onNodesChange tugadi ---
  onEdgesChange: (changes) => {
    const { initialState, isLoading, saveToHistory } = get();

    // Agar yuklanmoqda bo'lsa, isDirty ni o'zgartirmaymiz
    if (isLoading) {
      set({
        edges: applyEdgeChanges(changes, get().edges),
        // isLoading bo'lsa, isDirty ni o'zgartirmaymiz
      });
      return;
    }

    const newEdges = applyEdgeChanges(changes, get().edges);

    // Haqiqiy o'zgarishlarni tekshirish
    const hasRealChanges =
      !initialState ||
      JSON.stringify(newEdges) !== JSON.stringify(initialState.edges);

    // History ga saqlash (undo/redo flag tekshiriladi ichida)
    if (hasRealChanges) {
      saveToHistory();
    }

    set({
      edges: newEdges,
      isDirty: hasRealChanges,
    });
  },

  onConnect: (connection) => {
    // Bu funksiya endi index.ts da override qilinadi,
    // lekin slice ichida standart versiyasi bo'lgani yaxshi.
    set({
      edges: addEdge(connection, get().edges),
      isDirty: true,
    });
  },

  updateNodeData: (nodeId, newData) => {
    const { initialState, isLoading, saveToHistory } = get();

    // Agar yuklanmoqda bo'lsa, isDirty ni o'zgartirmaymiz
    if (isLoading) {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, ...newData } };
          }
          return node;
        }),
      });
      return;
    }

    // History ga saqlash (undo/redo flag tekshiriladi ichida)
    saveToHistory();

    const newNodes = get().nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, data: { ...node.data, ...newData } };
      }
      return node;
    });

    // Haqiqiy o'zgarishlarni tekshirish
    const hasRealChanges =
      !initialState ||
      JSON.stringify(newNodes) !== JSON.stringify(initialState.nodes);

    set({
      nodes: newNodes,
      isDirty: hasRealChanges,
    });
  },

  updateEdgeData: (edgeId, newData) => {
    const { initialState, isLoading, saveToHistory } = get();

    // Agar yuklanmoqda bo'lsa, isDirty ni o'zgartirmaymiz
    if (isLoading) {
      set({
        edges: get().edges.map((edge) => {
          if (edge.id === edgeId) {
            return { ...edge, data: { ...edge.data, ...newData } };
          }
          return edge;
        }),
      });
      return;
    }

    // History ga saqlash (undo/redo flag tekshiriladi ichida)
    saveToHistory();

    const newEdges = get().edges.map((edge) => {
      if (edge.id === edgeId) {
        return { ...edge, data: { ...edge.data, ...newData } };
      }
      return edge;
    });

    // Haqiqiy o'zgarishlarni tekshirish
    const hasRealChanges =
      !initialState ||
      JSON.stringify(newEdges) !== JSON.stringify(initialState.edges);

    set({
      edges: newEdges,
      isDirty: hasRealChanges,
    });
  },

  deleteSelectedElements: () => {
    const { nodes, edges, saveToHistory } = get();
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);

    // Agar hech narsa tanlanmagan bo'lsa, hech narsa qilmaymiz
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      return;
    }

    // History ga saqlash (undo/redo flag tekshiriladi ichida)
    saveToHistory();

    const selectedNodeIds = selectedNodes.map((node) => node.id);

    // O'chirilmaydigan nodelarni qoldiramiz
    const nextNodes = nodes.filter((node) => !node.selected);

    // O'chirilmaydigan chiziqlarni qoldiramiz:
    // 1. O'zi tanlanmagan BO'LISHI KERAK
    // 2. Tanlangan node'larga ulanmagan BO'LISHI KERAK
    const nextEdges = edges.filter(
      (edge) =>
        !edge.selected &&
        !selectedNodeIds.includes(edge.source) &&
        !selectedNodeIds.includes(edge.target)
    );

    set({
      nodes: nextNodes,
      edges: nextEdges,
      isDirty: true,
    });
  },

  selectAll: () => {
    set({
      nodes: get().nodes.map((n) => ({ ...n, selected: true })),
      edges: get().edges.map((e) => ({ ...e, selected: true })),
    });
  },

  setNodes: (nodes) => {
    set({ nodes, isDirty: true });
  },

  setEdges: (edges) => {
    set({ edges, isDirty: true });
  },
});
