import dagre from "dagre";
import { Node, Edge, Position } from "reactflow"; // Agar v12 bo'lsa: '@xyflow/react'

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Node o'lchamlari (o'zingizga moslab o'zgartiring)
const NODE_WIDTH = 500;
const NODE_HEIGHT = 700;

type Direction = "TB" | "LR"; // Top-Bottom yoki Left-Right

export const getFormatFlow = (
  nodes: Node[],
  edges: Edge[],
  direction: Direction = "TB",
) => {
  const isHorizontal = direction === "LR";

  // Dagre sozlamalari
  dagreGraph.setGraph({
    rankdir: direction,
  });

  nodes.forEach((node) => {
    // Agar node o'lchami dinamik bo'lsa, node.width yoki style.width ishlatish kerak
    // Hozircha statik o'lcham beramiz
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Hisoblash jarayoni
  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Yangi obyekt qaytarish (Immutability)
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      // Nodelarni markazlashtirish uchun o'lchamning yarmini ayiramiz
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
