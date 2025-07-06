import { StateCreator } from "zustand";
import {
  applyEdgeChanges,
  applyNodeChanges,
  addEdge,
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
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },
  onConnect: (connection) => {
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
      edges: edges.filter(e => !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target)),
      isDirty: true
    });
  },
  selectAll: () => {
    set({
      nodes: get().nodes.map(n => ({ ...n, selected: true })),
      edges: get().edges.map(e => ({ ...e, selected: true })),
    });
  },
});
