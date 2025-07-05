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
import { ElementItemType } from "@/types/element-types";

// Bu funksiya sizda mavjud bo'lishi kerak
const getDefaultNodeData = (nodeType: string) => {
  switch (nodeType) {
    case "SendTextMessageNode":
      return {
        recipients: { sendToSender: true, additionalIds: [] },
        messageText: "",
        parseMode: "None",
      };
    case "SendPhotoNode":
      return {
        recipients: { sendToSender: true, additionalIds: [] },
        photoSourceType: "url",
        caption: "",
      };
    // ... boshqa node'lar uchun ham
    default:
      return {};
  }
};

let id = 0;
// Mavjud nodelar sonidan kelib chiqib ID berish xatoliklarni kamaytiradi
const getId = () => `dndnode_${id++}`;

// Nusxalangan elementlarni vaqtincha saqlash uchun tip
type Clipboard = {
  nodes: Node[];
  edges: Edge[];
};

export type RFState = {
  nodes: Node[];
  edges: Edge[];
  clipboard: Clipboard | null;
  isCtrlPressed: boolean;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (data: ElementItemType, position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  deleteSelectedElements: () => void;
  // --- BARCHA YANGI FUNKSIYALARNING TIPLARI ---
  selectAll: () => void;
  copySelection: () => void;
  paste: (position: { x: number; y: number }) => void;
  duplicateSelection: () => void;
  setCtrlPressed: (isPressed: boolean) => void; // <-- YANGI FUNKSIYA TIPI
};

export const useFlowStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  clipboard: null,
  isCtrlPressed: false,

  // React Flow kutubxonasi uchun majburiy handler'lar

  onNodesChange: (changes: NodeChange[]) => {
    const { isCtrlPressed } = get();
    const gridSize = 10; // 10px'lik to'r

    const updatedChanges = changes.map((change) => {
      // Agar Ctrl bosilgan bo'lsa, node siljiyotgan bo'lsa va bu pozitsiya o'zgarishi bo'lsa
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
      // O'zgartirilgan 'updatedChanges' ni qo'llaymiz
      nodes: applyNodeChanges(updatedChanges, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (element: ElementItemType, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: getId(),
      type: element.triggerId,
      position,
      data: getDefaultNodeData(element.triggerId || ""),
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  updateNodeData: (nodeId: string, newData: any) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      }),
    });
  },

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
      edges: edges.filter(
        (edge) =>
          !selectedEdges.includes(edge.id) &&
          !selectedNodes.includes(edge.source) &&
          !selectedNodes.includes(edge.target)
      ),
    });
  },

  /** Barcha elementlarni tanlash */
  selectAll: () => {
    set({
      nodes: get().nodes.map((node) => ({ ...node, selected: true })),
      edges: get().edges.map((edge) => ({ ...edge, selected: true })),
    });
  },

  /** Tanlangan elementlarni nusxa buferiga saqlash */
  copySelection: () => {
    const { nodes, edges } = get();
    // Faqat tanlangan node'larni olamiz
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) {
      set({ clipboard: null });
      return;
    }

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    // Faqat tanlangan node'lar orasidagi ulanishlarni olamiz
    const selectedEdges = edges.filter(
      (e) =>
        selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );

    set({ clipboard: { nodes: selectedNodes, edges: selectedEdges } });
  },

  /** Nusxa buferidagi elementlarni ish maydoniga qo'yish */
  paste: (position: { x: number; y: number }) => {
    const clipboard = get().clipboard;
    if (!clipboard || clipboard.nodes.length === 0) return;

    const { nodes, edges } = get();
    const oldToNewIdMap = new Map<string, string>();

    // Nusxalangan nodelarning birinchisini topamiz
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
        data: { ...node.data }, // Chuqur nusxalash
      };
    });

    const newEdges = clipboard.edges.map((edge) => ({
      ...edge,
      id: `reactflow__edge-${oldToNewIdMap.get(
        edge.source
      )!}-${oldToNewIdMap.get(edge.target)!}`,
      source: oldToNewIdMap.get(edge.source)!,
      target: oldToNewIdMap.get(edge.target)!,
    }));

    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...edges, ...newEdges],
    });
  },

  /** Tanlangan elementlardan dublikat yaratish */
  duplicateSelection: () => {
    const { nodes, edges } = get();
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) return;

    const oldToNewIdMap = new Map<string, string>();

    const newNodes = selectedNodes.map((node) => {
      const newNodeId = getId();
      oldToNewIdMap.set(node.id, newNodeId);
      return {
        ...node,
        id: newNodeId,
        selected: true, // Dublikat qilinganlarni tanlangan holatda qoldiramiz
        position: { x: node.position.x + 30, y: node.position.y + 30 },
        data: { ...node.data }, // Chuqur nusxalash
      };
    });

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    const relevantEdges = edges.filter(
      (e) =>
        selectedNodeIds.includes(e.source) && selectedNodeIds.includes(e.target)
    );

    const newEdges = relevantEdges.map((edge) => ({
      ...edge,
      id: `reactflow__edge-${oldToNewIdMap.get(
        edge.source
      )!}-${oldToNewIdMap.get(edge.target)!}`,
      source: oldToNewIdMap.get(edge.source)!,
      target: oldToNewIdMap.get(edge.target)!,
    }));

    set({
      // Eskilarini tanlanmagan holatga o'tkazamiz
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...get().edges, ...newEdges],
    });
  },

  setCtrlPressed: (isPressed: boolean) => {
    set({ isCtrlPressed: isPressed });
  },
}));
