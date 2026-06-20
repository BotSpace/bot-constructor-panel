import SelectableEdge from "@/features/bot-constructor/edges/SelectableEdge";
import FloatingEdge from "@/features/bot-constructor/edges/FloatingEdge";
import FloatingConnectionLine from "@/features/bot-constructor/edges/FloatingConnectionLine";

// Custom edge with selected state visual feedback.
// Both "floating" (legacy constructor-created) and "smart-edge" (AI-generated)
// map to FloatingEdge so all edges render identically regardless of origin.
export const CustomEdge = {
  step: SelectableEdge,
  floating: FloatingEdge,
  "smart-edge": FloatingEdge,
};

// Export floating connection line for use in ReactFlow
export { FloatingConnectionLine };
