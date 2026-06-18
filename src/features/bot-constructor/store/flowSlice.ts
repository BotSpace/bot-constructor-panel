// constructor/store/flowSlice.ts

import { StateCreator } from "zustand";
import {
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
  NodeChange,
} from "reactflow";
import { FlowStoreState, FlowSlice } from "./types";

// Per-node debounce timers for broadcasting "nu" (node data update) ops, so a
// stream of keystrokes on one node coalesces into a single op (~300ms) while
// edits to different nodes stay independent.
const NU_DEBOUNCE_MS = 300;
const nuDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

export const createFlowSlice: StateCreator<
  FlowStoreState,
  [],
  [],
  FlowSlice
> = (set, get) => ({
  nodes: [],
  edges: [],
  silentFlowUpdateDepth: 0,

  withSilentFlowUpdate: (callback) => {
    set((state) => ({
      silentFlowUpdateDepth: state.silentFlowUpdateDepth + 1,
    }));
    try {
      callback();
    } finally {
      set((state) => ({
        silentFlowUpdateDepth: Math.max(0, state.silentFlowUpdateDepth - 1),
      }));
    }
  },

  // --- Yaxshilangan onNodesChange ---
  onNodesChange: (changes: NodeChange[]) => {
    const { initialState, isLoading, saveToHistory, silentFlowUpdateDepth } = get();

    // Agar yuklanmoqda bo'lsa, isDirty ni o'zgartirmaymiz
    if (isLoading || silentFlowUpdateDepth > 0) {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
        // isLoading bo'lsa, isDirty ni o'zgartirmaymiz
      });
      return;
    }

    const newNodes = applyNodeChanges(changes, get().nodes);

    // Ephemeral (mazmunsiz) o'zgarishlar: faqat tanlash/o'lcham — bo'sh joyga bosganda
    // React Flow node'larni deselect qiladi va `selected` maydoni o'zgaradi. Bu flow'ni
    // o'zgartirmaydi, shuning uchun isDirty/history'ga ta'sir qilmasligi kerak.
    const hasContentChange = changes.some(
      (change) => change.type !== "select" && change.type !== "dimensions",
    );

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

    if (hasContentChange && hasSignificantChange && hasRealChanges) {
      // History ga saqlash (undo/redo flag tekshiriladi ichida)
      saveToHistory();
    }

    set({
      // Yangilangan o'zgarishlarni qo'llaymiz
      nodes: newNodes,
      // Tanlash/o'lcham o'zgarishlari isDirty'ni o'zgartirmaydi (mavjud holatni saqlaymiz).
      isDirty: hasContentChange ? hasRealChanges : get().isDirty,
    });

    // ── Collab: broadcast LOCAL node moves + removals ──────────────────────
    // Position: only after a drag settles (dragging===false) — not every frame.
    // Remove: a node was deleted locally.
    const { emitCollabOp } = get();
    for (const change of changes) {
      if (change.type === "position" && change.dragging === false) {
        const moved = newNodes.find((n) => n.id === change.id);
        if (moved) emitCollabOp({ t: "nm", id: moved.id, position: moved.position });
      } else if (change.type === "remove") {
        emitCollabOp({ t: "nd", id: change.id });
      }
    }
  },

  // --- onNodesChange tugadi ---
  onEdgesChange: (changes) => {
    const { initialState, isLoading, saveToHistory, silentFlowUpdateDepth } = get();

    // Agar yuklanmoqda bo'lsa, isDirty ni o'zgartirmaymiz
    if (isLoading || silentFlowUpdateDepth > 0) {
      set({
        edges: applyEdgeChanges(changes, get().edges),
        // isLoading bo'lsa, isDirty ni o'zgartirmaymiz
      });
      return;
    }

    const newEdges = applyEdgeChanges(changes, get().edges);

    // Ephemeral (mazmunsiz) o'zgarishlar: faqat tanlash — bo'sh joyga bosganda edge'lar
    // deselect bo'ladi. Bu flow'ni o'zgartirmaydi.
    const hasContentChange = changes.some((change) => change.type !== "select");

    // Haqiqiy o'zgarishlarni tekshirish
    const hasRealChanges =
      !initialState ||
      JSON.stringify(newEdges) !== JSON.stringify(initialState.edges);

    // History ga saqlash (undo/redo flag tekshiriladi ichida)
    if (hasContentChange && hasRealChanges) {
      saveToHistory();
    }

    set({
      edges: newEdges,
      // Tanlash o'zgarishi isDirty'ni o'zgartirmaydi.
      isDirty: hasContentChange ? hasRealChanges : get().isDirty,
    });

    // ── Collab: broadcast LOCAL edge add/remove ────────────────────────────
    const { emitCollabOp } = get();
    for (const change of changes) {
      if (change.type === "add" && change.item) {
        emitCollabOp({ t: "ea", edge: change.item });
      } else if (change.type === "remove") {
        emitCollabOp({ t: "ed", id: change.id });
      }
    }
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
    const { initialState, isLoading, saveToHistory, silentFlowUpdateDepth } = get();

    // Agar yuklanmoqda bo'lsa, isDirty ni o'zgartirmaymiz
    if (isLoading || silentFlowUpdateDepth > 0) {
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

    // ── Collab: broadcast LOCAL node data update (debounced per node id) ───
    // Coalesce rapid edits (typing) on the same node into one "nu" op carrying
    // the FULL node.data after the change.
    const existing = nuDebounceTimers.get(nodeId);
    if (existing) clearTimeout(existing);
    nuDebounceTimers.set(
      nodeId,
      setTimeout(() => {
        nuDebounceTimers.delete(nodeId);
        const node = get().nodes.find((n) => n.id === nodeId);
        if (node) get().emitCollabOp({ t: "nu", id: nodeId, data: node.data });
      }, NU_DEBOUNCE_MS)
    );
  },

  updateEdgeData: (edgeId, newData) => {
    const { initialState, isLoading, saveToHistory, silentFlowUpdateDepth } = get();

    // Agar yuklanmoqda bo'lsa, isDirty ni o'zgartirmaymiz
    if (isLoading || silentFlowUpdateDepth > 0) {
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

    // ── Collab: broadcast LOCAL deletions ──────────────────────────────────
    const { emitCollabOp } = get();
    const removedEdgeIds = edges
      .filter((e) => !nextEdges.includes(e))
      .map((e) => e.id);
    for (const id of removedEdgeIds) emitCollabOp({ t: "ed", id });
    for (const id of selectedNodeIds) emitCollabOp({ t: "nd", id });
  },

  selectAll: () => {
    set({
      nodes: get().nodes.map((n) => ({ ...n, selected: true })),
      edges: get().edges.map((e) => ({ ...e, selected: true })),
    });
  },

  setNodes: (nodes) => {
    set(get().silentFlowUpdateDepth > 0 ? { nodes } : { nodes, isDirty: true });
  },

  setEdges: (edges) => {
    set(get().silentFlowUpdateDepth > 0 ? { edges } : { edges, isDirty: true });
  },
});
