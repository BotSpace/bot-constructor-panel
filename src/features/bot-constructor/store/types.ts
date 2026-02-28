import { Edge, Node, OnConnect, OnEdgesChange, OnNodesChange } from "reactflow";
import { ElementItemType } from "@/types/element-types";
import { FlowData } from "@/types/http/flow";

// React Flow asosiy holati uchun slice tipi
export interface FlowSlice {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
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

// Barcha qismlarni birlashtirgan yakuniy store tipi
export interface FlowStoreState
  extends FlowSlice,
    ClipboardSlice,
    HistorySlice,
    Actions {
  // UI holatlari
  initialState: { nodes: Node[]; edges: Edge[] } | null;
  isDirty: boolean;
  isLoading: boolean;
  lastSavedTime: Date | null;
  countdownRemaining: number | null; // Sanoq qolgan vaqt (millisekundlarda)
  countdownDuration: number; // Sanoq umumiy vaqti (millisekundlarda)
  startCountdown: () => void;
  stopCountdown: () => void;
  collapseAllSignal: number; // Barcha nodelarni collapse qilish signali (counter)
  collapseAllNodes: () => void; // Barcha nodelarni collapse qilish
  expandAllSignal: number; // Barcha nodelarni expand qilish signali (counter)
  expandAllNodes: () => void; // Barcha nodelarni expand qilish
}
