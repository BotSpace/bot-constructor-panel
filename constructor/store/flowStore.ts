import { create } from "zustand";
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import { ElementItemType } from "@/types/element-types"; // O'zingizning typingizni import qiling

let id = 0;
const getId = () => `node_${id++}`;

// Store'ning holati va action'lari uchun interfeys (TypeScript uchun)
export type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (data: ElementItemType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  deleteSelectedElements: () => void;
};

export const useFlowStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],

  // React Flow kutubxonasi uchun majburiy handler'lar
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  // Yangi qirrani (edge) qo'shish uchun
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },

  // Yangi nodeni qo'shish
  addNode: (element: ElementItemType, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: getId(),
      type: element.triggerId, // triggerId bu node'ning turi
      position,
      // Xato: data: element -> To'g'ri: node uchun boshlang'ich ma'lumotlar
      data: {}, // Yoki { recipientType: 'sender', messageText: '' } kabi default qiymatlar
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  // **Eng muhim qismi: Node ma'lumotini yangilash**
  // Custom node ichidan shu funksiyani chaqirasiz
  updateNodeData: (nodeId: string, newData: any) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // data obyektini yangi ma'lumotlar bilan birlashtiramiz
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      }),
    });
  },

  // Tanlangan elementlarni o'chirish
  deleteSelectedElements: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes
      .filter((node) => node.selected)
      .map((node) => node.id);
    const selectedEdges = edges
      .filter((edge) => edge.selected)
      .map((edge) => edge.id);

    set({
      nodes: nodes.filter((node) => !selectedNodes.includes(node.id)),
      edges: edges.filter((edge) => !selectedEdges.includes(edge.id)),
    });
  },
}));
