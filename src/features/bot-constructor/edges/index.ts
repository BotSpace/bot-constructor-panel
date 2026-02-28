import SelectableEdge from "./SelectableEdge";
import FloatingEdge from "./FloatingEdge";
import FloatingConnectionLine from "./FloatingConnectionLine";

// Custom edge with selected state visual feedback
export const CustomEdge = {
  step: SelectableEdge,
  floating: FloatingEdge,
};

// Export floating connection line for use in ReactFlow
export { FloatingConnectionLine };
