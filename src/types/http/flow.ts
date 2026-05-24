import type { Edge, Node } from "reactflow";

export interface FlowData {
  id: number;
  flow: {
    nodes: Node[];
    edges: Edge[];
  };
}
