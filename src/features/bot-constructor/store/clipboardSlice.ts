import { StateCreator } from "zustand";
import { FlowStoreState, ClipboardSlice } from "./types";

let idOffset = 0;
const getId = () => `dndnode_${Date.now()}_${idOffset++}`;

export const createClipboardSlice: StateCreator<
  FlowStoreState,
  [],
  [],
  ClipboardSlice
> = (set, get) => ({
  clipboard: null,
  copySelection: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) {
      set({ clipboard: null });
      return;
    }

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    const selectedEdges = edges.filter(
      (e) =>
        selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );

    set({ clipboard: { nodes: selectedNodes, edges: selectedEdges } });
  },
  paste: (position) => {
    const clipboard = get().clipboard;
    if (!clipboard || clipboard.nodes.length === 0) return;

    const { nodes, edges, saveToHistory } = get();
    
    // History ga saqlash (undo/redo flag tekshiriladi ichida)
    saveToHistory();
    
    const oldToNewIdMap = new Map<string, string>();

    const firstNode = clipboard.nodes[0];
    const offsetX = position.x - firstNode.position.x;
    const offsetY = position.y - firstNode.position.y;

    const newNodes = clipboard.nodes.map((node) => {
      const newNodeId = getId();
      oldToNewIdMap.set(node.id, newNodeId);
      return {
        ...node,
        id: newNodeId,
        selected: false,
        position: {
          x: node.position.x + offsetX,
          y: node.position.y + offsetY,
        },
        data: { ...node.data },
      };
    });

    const newEdges = clipboard.edges.map((edge) => ({
      ...edge,
      id: `edge-${oldToNewIdMap.get(edge.source)!}-${oldToNewIdMap.get(
        edge.target
      )!}`,
      source: oldToNewIdMap.get(edge.source)!,
      target: oldToNewIdMap.get(edge.target)!,
    }));

    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...edges, ...newEdges],
      isDirty: true,
    });
  },
  duplicateSelection: () => {
    const { nodes, edges, saveToHistory } = get();
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    // History ga saqlash (undo/redo flag tekshiriladi ichida)
    saveToHistory();

    const oldToNewIdMap = new Map<string, string>();

    const newNodes = selectedNodes.map((node) => {
      const newNodeId = getId();
      oldToNewIdMap.set(node.id, newNodeId);
      return {
        ...node,
        id: newNodeId,
        selected: true,
        position: { x: node.position.x + 30, y: node.position.y + 30 },
        data: { ...node.data },
      };
    });

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    const relevantEdges = edges.filter(
      (e) =>
        selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );

    const newEdges = relevantEdges.map((edge) => ({
      ...edge,
      id: `edge-${oldToNewIdMap.get(edge.source)!}-${oldToNewIdMap.get(
        edge.target
      )!}`,
      source: oldToNewIdMap.get(edge.source)!,
      target: oldToNewIdMap.get(edge.target)!,
    }));

    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...get().edges, ...newEdges],
      isDirty: true,
    });
  },
});
