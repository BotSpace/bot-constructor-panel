import dagre from "dagre";
import { Node, Edge, Position } from "reactflow";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

type Direction = "TB" | "LR";

export const getFormatFlow = (
  nodes: Node[],
  edges: Edge[],
  direction: Direction = "LR"
) => {
  const isHorizontal = direction === "LR";

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 350, // Nodelar orasidagi masofa (gorizontal)
    ranksep: 100, // Qatorlar orasidagi masofa (vertikal)
  });

  nodes.forEach((node) => {
    // 1-QADAM: Nodingizning haqiqiy o'lchamini olish
    // React Flow nodeda width/height yoki measured xususiyatlarini saqlaydi
    const width = node.width;
    const height = node.height;

    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // O'lchamlarni qayta olish (hisob-kitob uchun)
    const width = node.width || 0;
    const height = node.height || 0;

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        // 2-QADAM: Markazlashtirish formulasi
        // Dagre markaz koordinatasini beradi, React Flow esa chap-tepa burchakni kutadi.
        // Shu sababli kenglik va balandlikning yarmini ayiramiz.
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
