import dagre from "dagre";
import { Node, Edge, Position } from "reactflow";
import { getNodeManifestByType } from "@/features/bot-constructor/nodes/registry/manifestStore";

type Direction = "TB" | "LR";

const DEFAULT_NODE_WIDTH = 150;
const DEFAULT_NODE_HEIGHT = 150;

/** Horizontal gap between sibling accessory nodes placed below their parent. */
const ACCESSORY_HORIZONTAL_GAP = 20;
/** Vertical distance from the bottom edge of the parent to the top of the accessory node. */
const ACCESSORY_VERTICAL_OFFSET = 40;

/**
 * Cycle-safe dagre layout.
 * Back-edges (cycles) are excluded from dagre so it doesn't produce overlapping
 * positions, then the original edges are restored unchanged.
 *
 * Accessory nodes (accessory: true in the manifest) are excluded from the dagre
 * rank graph and placed directly BELOW their parent node instead.  Multiple
 * accessory nodes attached to the same parent are spread horizontally.
 */
export const getFormatFlow = (
  nodes: Node[],
  edges: Edge[],
  direction: Direction = "LR"
) => {
  if (nodes.length === 0) return { nodes, edges };

  // ── Split normal vs accessory nodes ──────────────────────────────────────
  const accessoryIds = new Set<string>();
  nodes.forEach((node) => {
    const manifest = getNodeManifestByType(node.type ?? "");
    if (manifest?.accessory === true) {
      accessoryIds.add(node.id);
    }
  });

  const normalNodes = nodes.filter((n) => !accessoryIds.has(n.id));
  const accessoryNodes = nodes.filter((n) => accessoryIds.has(n.id));

  // Edges that connect two normal nodes (fed to dagre)
  const normalEdges = edges.filter(
    (e) => !accessoryIds.has(e.source) && !accessoryIds.has(e.target)
  );

  // Accessory edges: accessory → normal parent (used to anchor acc. nodes below parent)
  // The edge goes FROM the accessory node (source) TO the parent flow node (target),
  // with targetHandle starting with "acc:".
  const accessoryEdges = edges.filter(
    (e) => accessoryIds.has(e.source) && !accessoryIds.has(e.target)
  );

  // ── Dagre layout on normal nodes only ────────────────────────────────────
  const nodeIds = new Set(normalNodes.map((n) => n.id));

  // Build adjacency list for normal nodes
  const adj = new Map<string, string[]>();
  normalNodes.forEach((n) => adj.set(n.id, []));
  normalEdges.forEach((e) => {
    if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
      adj.get(e.source)!.push(e.target);
    }
  });

  // DFS to find back-edges
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const backEdgePairs = new Set<string>();

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

  normalNodes.forEach((n) => {
    if (!visited.has(n.id)) dfs(n.id);
  });

  const forwardEdges = normalEdges.filter(
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

  normalNodes.forEach((node) => {
    const width = node.width ?? DEFAULT_NODE_WIDTH;
    const height = node.height ?? DEFAULT_NODE_HEIGHT;
    dagreGraph.setNode(node.id, { width, height });
  });

  const seenEdges = new Set<string>();
  forwardEdges.forEach((edge) => {
    const key = `${edge.source}->${edge.target}`;
    if (!seenEdges.has(key)) {
      seenEdges.add(key);
      dagreGraph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(dagreGraph);

  const layoutedNormalNodes = normalNodes.map((node) => {
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

  // Build a quick lookup of layouted normal node positions
  const normalPositionMap = new Map<string, { x: number; y: number; width: number; height: number }>();
  layoutedNormalNodes.forEach((n) => {
    normalPositionMap.set(n.id, {
      x: n.position.x,
      y: n.position.y,
      width: n.width ?? DEFAULT_NODE_WIDTH,
      height: n.height ?? DEFAULT_NODE_HEIGHT,
    });
  });

  // ── Place accessory nodes below their parent ──────────────────────────────
  // Group accessory nodes by parent id
  const accessoryByParent = new Map<string, Node[]>();
  accessoryNodes.forEach((accNode) => {
    // Find the edge that wires this accessory node to a parent
    const parentEdge = accessoryEdges.find((e) => e.source === accNode.id);
    const parentId = parentEdge?.target;
    if (!parentId) {
      // No parent found — park it unchanged (should not normally happen)
      return;
    }
    if (!accessoryByParent.has(parentId)) {
      accessoryByParent.set(parentId, []);
    }
    accessoryByParent.get(parentId)!.push(accNode);
  });

  const layoutedAccessoryNodes: Node[] = [];

  // Nodes with no acc-edge (no parent found) keep their original position
  const orphanAccessoryIds = new Set(
    accessoryNodes.map((n) => n.id).filter(
      (id) => !accessoryEdges.some((e) => e.source === id)
    )
  );

  accessoryNodes.forEach((accNode) => {
    if (orphanAccessoryIds.has(accNode.id)) {
      layoutedAccessoryNodes.push(accNode);
    }
  });

  accessoryByParent.forEach((accGroup, parentId) => {
    const parent = normalPositionMap.get(parentId);
    if (!parent) {
      // Parent not in normal set (unlikely) — keep original positions
      accGroup.forEach((n) => layoutedAccessoryNodes.push(n));
      return;
    }

    // Total width occupied by the group
    const totalGroupWidth = accGroup.reduce((sum, n) => sum + (n.width ?? DEFAULT_NODE_WIDTH) + ACCESSORY_HORIZONTAL_GAP, 0) - ACCESSORY_HORIZONTAL_GAP;
    const parentCenterX = parent.x + parent.width / 2;
    const startX = parentCenterX - totalGroupWidth / 2;
    const baseY = parent.y + parent.height + ACCESSORY_VERTICAL_OFFSET;

    let cursor = startX;
    accGroup.forEach((accNode) => {
      const w = accNode.width ?? DEFAULT_NODE_WIDTH;
      layoutedAccessoryNodes.push({
        ...accNode,
        position: {
          x: cursor,
          y: baseY,
        },
      });
      cursor += w + ACCESSORY_HORIZONTAL_GAP;
    });
  });

  return { nodes: [...layoutedNormalNodes, ...layoutedAccessoryNodes], edges };
};
