import { Edge, Node } from "reactflow";
import { ActionsTextAndMedia } from "../nodes";

/**
 * Berilgan tugundan (startNodeId) boshlab tepaga (source tomonga) qarab yuradi
 * va birinchi uchragan Action tugunni qaytaradi.
 */
export const findNearestParentAction = (
  startNodeId: string,
  nodes: Node[],
  edges: Edge[]
): Node | null => {
  const ACTION_NODE_TYPES = Object.keys(ActionsTextAndMedia);

  let currentId = startNodeId;

  // Cheksiz sikl (infinite loop) bo'lib qolmasligi uchun himoya
  const visited = new Set<string>();

  while (currentId) {
    if (visited.has(currentId)) {
      console.warn("Cycle detected while searching for parent action");
      return null;
    }
    visited.add(currentId);

    // 1. Hozirgi tugunga kiruvchi (target bo'lgan) edgeni topamiz
    const incomingEdge = edges.find((edge) => edge.target === currentId);

    // Agar kiruvchi yo'l yo'q bo'lsa, demak zanjir tugadi
    if (!incomingEdge) return null;

    // 2. Edgening boshlanish (source) tugunini topamiz
    const parentNode = nodes.find((node) => node.id === incomingEdge.source);

    if (!parentNode) return null;

    // 3. Tekshiramiz: Bu tugun biz qidirayotgan Action tugunmi?
    if (ACTION_NODE_TYPES.includes(parentNode.type || "")) {
      return parentNode; // Topildi!
    }

    // 4. Agar Action bo'lmasa (masalan, Condition yoki Delay bo'lsa),
    // qidiruvni shu tugundan davom ettiramiz (tepaga chiqamiz)
    currentId = parentNode.id;
  }

  return null;
};
