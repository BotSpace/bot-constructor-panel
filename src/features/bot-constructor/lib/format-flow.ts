import dagre from "dagre";
import { Node, Edge, Position } from "reactflow";

type Direction = "TB" | "LR";

const DEFAULT_NODE_WIDTH = 172;
const DEFAULT_NODE_HEIGHT = 36;

export const getFormatFlow = (
  nodes: Node[],
  edges: Edge[],
  direction: Direction = "LR"
) => {
  // Har safar yangi graf yaratamiz — eski node/edge qoldiqlaridan tozalanadi
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 50,
    ranksep: 200,
  });

  nodes.forEach((node) => {
    const width = node.width ?? DEFAULT_NODE_WIDTH;
    const height = node.height ?? DEFAULT_NODE_HEIGHT;

    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // 1-QADAM: Dagre pozitsiyalarini olish
  const positionMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((node) => {
    const { x, y } = dagreGraph.node(node.id);
    positionMap.set(node.id, { x, y });
  });

  // 2-QADAM: Predecessors va successors ro'yxatini tuzish
  const predecessors = new Map<string, string[]>();
  const successors = new Map<string, string[]>();
  nodes.forEach((node) => {
    predecessors.set(node.id, []);
    successors.set(node.id, []);
  });
  edges.forEach((edge) => {
    successors.get(edge.source)?.push(edge.target);
    predecessors.get(edge.target)?.push(edge.source);
  });

  // 3-QADAM: Har bir nodeni predecessor va successor'lari orasida markazlashtirish
  // Masalan: a→b→e bo'lsa va a→c→d→e ham bo'lsa,
  // b ning x pozitsiyasi = (a.x + e.x) / 2 — ya'ni c va d orasida turadi
  nodes.forEach((node) => {
    const preds = predecessors.get(node.id) || [];
    const succs = successors.get(node.id) || [];

    if (preds.length > 0 && succs.length > 0) {
      const predPositions = preds.map((id) => positionMap.get(id)!);
      const succPositions = succs.map((id) => positionMap.get(id)!);

      if (isHorizontal) {
        const avgPredX =
          predPositions.reduce((s, p) => s + p.x, 0) / preds.length;
        const avgSuccX =
          succPositions.reduce((s, p) => s + p.x, 0) / succs.length;
        positionMap.get(node.id)!.x = (avgPredX + avgSuccX) / 2;
      } else {
        const avgPredY =
          predPositions.reduce((s, p) => s + p.y, 0) / preds.length;
        const avgSuccY =
          succPositions.reduce((s, p) => s + p.y, 0) / succs.length;
        positionMap.get(node.id)!.y = (avgPredY + avgSuccY) / 2;
      }
    }
  });

  const layoutedNodes = nodes.map((node) => {
    const pos = positionMap.get(node.id)!;
    const width = node.width ?? DEFAULT_NODE_WIDTH;
    const height = node.height ?? DEFAULT_NODE_HEIGHT;

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
