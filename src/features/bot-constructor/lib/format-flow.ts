import { Node, Edge, Position } from "reactflow";

interface FormatFlowProps {
  nodes: Node[];
  edges: Edge[];
}

export const getFormatFlow = ({
  nodes,
  edges,
}: FormatFlowProps) => {
  return {
    nodes,
    edges,
  };
};
