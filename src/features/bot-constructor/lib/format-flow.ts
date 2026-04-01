import dagre from "dagre";
import { Node, Edge, Position } from "reactflow";

type Direction = "TB" | "LR";

const DEFAULT_NODE_WIDTH = 150;
const DEFAULT_NODE_HEIGHT = 150;

/**
 * Cycle-safe dagre layout.
 * Back-edges (cycles) are excluded from dagre so it doesn't produce overlapping
 * positions, then the original edges are restored unchanged.
 */
export const getFormatFlow = (
  nodes: Node[],
  edges: Edge[],
  direction: Direction = "LR"
) => {
  if (nodes.length === 0) return { nodes, edges };

  // Detect and remove back-edges that create cycles (DFS-based)
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Build adjacency list (only edges whose endpoints exist in nodes)
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n.id, []));
  edges.forEach((e) => {
    if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
      adj.get(e.source)!.push(e.target);
    }
  });

  // DFS to find back-edges
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const backEdgePairs = new Set<string>(); // "source->target"

  const dfs = (id: string) => {
    visited.add(id);
    inStack.add(id);
    for (const neighbor of adj.get(id) ?? []) {
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      } else if (inStack.has(neighbor)) {
        backEdgePairs.add(`${id}->${neighbor}`);
      }
    }
    inStack.delete(id);
  };

  nodes.forEach((n) => {
    if (!visited.has(n.id)) dfs(n.id);
  });

  // Only feed forward edges to dagre
  const forwardEdges = edges.filter(
    (e) => !backEdgePairs.has(`${e.source}->${e.target}`)
  );

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 120,
  });

  nodes.forEach((node) => {
    const width = node.width ?? DEFAULT_NODE_WIDTH;
    const height = node.height ?? DEFAULT_NODE_HEIGHT;
    dagreGraph.setNode(node.id, { width, height });
  });

  // Deduplicate source→target pairs for dagre
  const seenEdges = new Set<string>();
  forwardEdges.forEach((edge) => {
    const key = `${edge.source}->${edge.target}`;
    if (!seenEdges.has(key)) {
      seenEdges.add(key);
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const width = node.width ?? DEFAULT_NODE_WIDTH;
    const height = node.height ?? DEFAULT_NODE_HEIGHT;

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
