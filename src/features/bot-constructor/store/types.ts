import { Edge, Node, OnConnect, OnEdgesChange, OnNodesChange } from "reactflow";
import { ElementItemType } from "@/types/element-types";
import { FlowData } from "@/types/http/flow";
import type { CollabOp } from "@/wss/collab/ops";

// React Flow asosiy holati uchun slice tipi
export interface FlowSlice {
  nodes: Node[];
  edges: Edge[];
  silentFlowUpdateDepth: number;
  withSilentFlowUpdate: (callback: () => void) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, newData: any) => void;
  updateEdgeData: (edgeId: string, newData: any) => void;
  deleteSelectedElements: () => void;
  selectAll: () => void;
}

// Clipboard (nusxa olish) uchun slice tipi
export interface ClipboardSlice {
  clipboard: { nodes: Node[]; edges: Edge[] } | null;
  copySelection: () => void;
  paste: (position: { x: number; y: number }) => void;
  duplicateSelection: () => void;
}

// History (undo/redo) uchun slice tipi
export interface HistorySlice {
  history: Array<{ nodes: Node[]; edges: Edge[] }>;
  historyIndex: number;
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

// Umumiy, yuqori darajadagi amallar
export interface Actions {
  addNode: (
    element: ElementItemType,
    position: { x: number; y: number }
  ) => void;
  saveFlow: (project_id: string) => Promise<void>;
  formatFlow: () => Promise<void>;
  loadFlow: (flow: FlowData["flow"]) => Promise<void>;
}

// Real-time collaboration uchun slice tipi
export interface CollabSlice {
  /** Remote op qo'llanayotganda true — chokepoint'lar qayta broadcast qilmasligi uchun. */
  isApplyingRemote: boolean;
  /** Collab hook o'rnatadigan broadcaster; null bo'lsa collab ulanmagan. */
  collabBroadcast: ((op: CollabOp) => void) | null;
  setCollabBroadcast: (fn: ((op: CollabOp) => void) | null) => void;
  /** Lokal op'ni broadcast qiladi (guard tekshiruvlari bilan). */
  emitCollabOp: (op: CollabOp) => void;
  /** Kelgan remote op'ni canvas'ga qo'llaydi (silent — dirty/undo/broadcast yo'q). */
  applyRemoteOp: (op: CollabOp) => void;
}

// Barcha qismlarni birlashtirgan yakuniy store tipi
export interface FlowStoreState
  extends FlowSlice,
    ClipboardSlice,
    HistorySlice,
    CollabSlice,
    Actions {
  // UI holatlari
  initialState: { nodes: Node[]; edges: Edge[] } | null;
  isDirty: boolean;
  isLoading: boolean;
  lastSavedTime: Date | null;
  collapseAllSignal: number;
  collapseAllNodes: () => void;
  expandAllSignal: number;
  expandAllNodes: () => void;
  // Right-panel editing
  editingNodeId: string | null;
  setEditingNodeId: (id: string | null) => void;
  // Edge visibility toggle
  edgesVisible: boolean;
  toggleEdgesVisibility: () => void;
}
