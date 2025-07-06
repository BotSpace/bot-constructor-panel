import {
  Edge,
  Node,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "reactflow";
import { ElementItemType } from "@/types/element-types";

// React Flow asosiy holati uchun slice tipi
export interface FlowSlice {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  updateNodeData: (nodeId: string, newData: any) => void;
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

// Umumiy, yuqori darajadagi amallar
export interface Actions {
  addNode: (element: ElementItemType, position: { x: number; y: number }) => void;
  saveFlow: () => Promise<void>;
  loadFlow: () => Promise<void>;
}

// Barcha qismlarni birlashtirgan yakuniy store tipi
export interface FlowStoreState extends FlowSlice, ClipboardSlice, Actions {
  // UI holatlari
  isDirty: boolean;
  isLoading: boolean;
  setDirty: (isDirty: boolean) => void;
}
