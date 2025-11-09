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
    const { isCtrlPressed, initialState, isLoading } = get(); // Asosiy store'dan holatni olamiz
    const gridSize = 10; // 10px'lik to'r

    // Agar yuklanmoqda bo'lsa, isDirty ni o'zgartirmaymiz
    if (isLoading) {
      const updatedChanges = changes.map((change) => {
        if (
          isCtrlPressed &&
          change.type === "position" &&
          change.dragging &&
          change.position
        ) {
          const snappedPosition = {
            x: Math.round(change.position.x / gridSize) * gridSize,
            y: Math.round(change.position.y / gridSize) * gridSize,
          };
          return { ...change, position: snappedPosition };
        }
        return change;
      });
      set({
        nodes: applyNodeChanges(updatedChanges, get().nodes),
        // isLoading bo'lsa, isDirty ni o'zgartirmaymiz
      });
      return;
    }

    // Har bir o'zgarishni tekshirib chiqamiz
    const updatedChanges = changes.map((change) => {
      // Agar Ctrl bosilgan, node siljiyotgan va bu pozitsiya o'zgarishi bo'lsa
      if (
        isCtrlPressed &&
        change.type === "position" &&
        change.dragging &&
        change.position
      ) {
        // Yangi pozitsiyani 10ga karrali songa yaxlitlaymiz
        const snappedPosition = {
          x: Math.round(change.position.x / gridSize) * gridSize,
          y: Math.round(change.position.y / gridSize) * gridSize,
        };

        // O'zgartirilgan 'change' obyektini qaytaramiz
        return { ...change, position: snappedPosition };
      }
      // Agar shartlar bajarilmasa, o'zgarishsiz qaytaramiz
      return change;
    });

    const newNodes = applyNodeChanges(updatedChanges, get().nodes);

    // Haqiqiy o'zgarishlarni tekshirish
    const hasRealChanges =
      !initialState ||
      JSON.stringify(newNodes) !== JSON.stringify(initialState.nodes);

    set({
      // Yangilangan o'zgarishlarni qo'llaymiz
      nodes: newNodes,
      isDirty: hasRealChanges,
    });
  },
  // --- onNodesChange tugadi ---

  onEdgesChange: (changes) => {
    const { initialState, isLoading } = get();

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
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      }),
      isDirty: true,
    });
  },

  deleteSelectedElements: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);

    // Agar hech narsa tanlanmagan bo'lsa, hech narsa qilmaymiz
    if (selectedNodes.length === 0 && selectedEdges.length === 0) {
      return;
    }

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
});
