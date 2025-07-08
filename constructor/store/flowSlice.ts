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
    const { isCtrlPressed } = get(); // Asosiy store'dan holatni olamiz
    const gridSize = 10; // 10px'lik to'r

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

    set({
      // Yangilangan o'zgarishlarni qo'llaymiz
      nodes: applyNodeChanges(updatedChanges, get().nodes),
      isDirty: true,
    });
  },
  // --- onNodesChange tugadi ---

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
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
    const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);

    set({
      nodes: nodes.filter((node) => !node.selected),
      edges: edges.filter(
        (e) =>
          !selectedNodeIds.includes(e.source) &&
          !selectedNodeIds.includes(e.target)
      ),
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
