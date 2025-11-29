import SelectableEdge from "./SelectableEdge";
import SmartEdge from "./SmartEdge";

// Custom edge with selected state visual feedback
export const CustomEdge = {
  default: SmartEdge,
  step: SelectableEdge,
};
