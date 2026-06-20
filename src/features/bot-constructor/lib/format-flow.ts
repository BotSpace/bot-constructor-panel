import dagre from "dagre";
import { Node, Edge, Position } from "reactflow";
import { getNodeManifestByType } from "@/features/bot-constructor/manifest/manifestStore";

type Direction = "TB" | "LR";

const DEFAULT_NODE_WIDTH = 150;
const DEFAULT_NODE_HEIGHT = 150;

/** Horizontal gap between sibling accessory nodes placed below their parent. */
const ACCESSORY_HORIZONTAL_GAP = 20;
/** Vertical distance from the bottom edge of the parent to the top of the accessory node. */
const ACCESSORY_VERTICAL_OFFSET = 130;

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

  // ── Pre-compute accessory footprint per parent ───────────────────────────
  // Group accessory nodes by their parent id so we can inflate the parent's
  // effective height fed to dagre.  This prevents following nodes from being
  // placed inside the space already reserved for accessory children.

  /** Extra vertical space (below the parent's own bottom edge) that its
   *  accessory subtree will occupy after layout. */
  const accessoryFootprintByParent = new Map<string, number>();
  {
    const byParent = new Map<string, Node[]>();
    accessoryNodes.forEach((accNode) => {
      const parentEdge = accessoryEdges.find((e) => e.source === accNode.id);
      const parentId = parentEdge?.target;
      if (!parentId) return;
      if (!byParent.has(parentId)) byParent.set(parentId, []);
      byParent.get(parentId)!.push(accNode);
    });

    byParent.forEach((accGroup, parentId) => {
      // Height of the tallest accessory node in the group (one row of accessories)
      const maxAccHeight = accGroup.reduce(
        (m, n) => Math.max(m, n.height ?? DEFAULT_NODE_HEIGHT),
        0
      );
      // Total extra space = gap from parent bottom + one row of accessories
      accessoryFootprintByParent.set(
        parentId,
        ACCESSORY_VERTICAL_OFFSET + maxAccHeight
      );
    });
  }

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
    nodesep: 100,
    ranksep: 180,
  });

  normalNodes.forEach((node) => {
    const width = node.width ?? DEFAULT_NODE_WIDTH;
    const ownHeight = node.height ?? DEFAULT_NODE_HEIGHT;
    // If this node has accessory children, inflate its effective height so dagre
    // reserves the vertical space they will occupy below the parent.
    const footprint = accessoryFootprintByParent.get(node.id) ?? 0;
    const height = ownHeight + footprint;
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
    const ownHeight = node.height ?? DEFAULT_NODE_HEIGHT;
    // dagre stored the *inflated* height for this node; its center Y is based on
    // that inflated bounding box.  We want the visual node to sit at the TOP of
    // that bounding box so the accessory area is always BELOW the node itself.
    const inflatedHeight = ownHeight + (accessoryFootprintByParent.get(node.id) ?? 0);

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        // Use ownHeight (not inflatedHeight) so the visual node is vertically
        // centred at the same Y as its dagre peers.  inflatedHeight was only
        // needed to reserve vertical space for accessory children in the dagre
        // rank graph — it must not shift the node itself upward.
        y: nodeWithPosition.y - ownHeight / 2,
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

    // Sort accessory nodes by their connected port order so they are placed
    // left-to-right matching the port positions rendered on the parent node.
    // ACC_PORT_LEFT_POSITIONS[2] = ["30%", "70%"], meaning index 0 → left (ai_model),
    // index 1 → right (ai_tool).  Without this sort, the layout spreads nodes in
    // insertion order, which causes edges to cross when nodes arrive in the wrong order.
    const parentManifest = getNodeManifestByType(
      normalNodes.find((n) => n.id === parentId)?.type ?? ""
    );
    const portOrder: string[] = (parentManifest?.accessoryPorts ?? []).map(
      (p) => `acc:${p.portType}`
    );

    const sorted = [...accGroup].sort((a, b) => {
      const edgeA = accessoryEdges.find((e) => e.source === a.id);
      const edgeB = accessoryEdges.find((e) => e.source === b.id);
      const handleA = edgeA?.targetHandle ?? "";
      const handleB = edgeB?.targetHandle ?? "";
      const idxA = portOrder.indexOf(handleA);
      const idxB = portOrder.indexOf(handleB);
      // Unknown handles go to the end
      const rankA = idxA === -1 ? portOrder.length : idxA;
      const rankB = idxB === -1 ? portOrder.length : idxB;
      return rankA - rankB;
    });

    // Total width occupied by the group
    const totalGroupWidth = sorted.reduce((sum, n) => sum + (n.width ?? DEFAULT_NODE_WIDTH) + ACCESSORY_HORIZONTAL_GAP, 0) - ACCESSORY_HORIZONTAL_GAP;
    const parentCenterX = parent.x + parent.width / 2;
    const startX = parentCenterX - totalGroupWidth / 2;
    const baseY = parent.y + parent.height + ACCESSORY_VERTICAL_OFFSET;

    let cursor = startX;
    sorted.forEach((accNode) => {
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

  // ── Post-process: push normal nodes that overlap the accessory area downward ─
  // Disconnected/global normal nodes can land inside the space reserved for
  // accessories because dagre doesn't know where accessories will be placed.
  // Find the bottom edge of all accessories then nudge overlapping normals below.

  const accessoryBottom =
    layoutedAccessoryNodes.length > 0
      ? Math.max(
          ...layoutedAccessoryNodes.map(
            (n) => n.position.y + (n.height ?? DEFAULT_NODE_HEIGHT)
          )
        )
      : -Infinity;

  const resolvedNormalNodes = layoutedNormalNodes.map((node) => {
    const nodeBottom = node.position.y + (node.height ?? DEFAULT_NODE_HEIGHT);
    const nodeRight = node.position.x + (node.width ?? DEFAULT_NODE_WIDTH);

    // Check if this node overlaps any accessory node
    const overlaps = layoutedAccessoryNodes.some((acc) => {
      const accRight = acc.position.x + (acc.width ?? DEFAULT_NODE_WIDTH);
      const accBottom = acc.position.y + (acc.height ?? DEFAULT_NODE_HEIGHT);
      return (
        node.position.x < accRight &&
        nodeRight > acc.position.x &&
        node.position.y < accBottom &&
        nodeBottom > acc.position.y
      );
    });

    if (!overlaps) return node;

    return {
      ...node,
      position: {
        ...node.position,
        y: accessoryBottom + ACCESSORY_VERTICAL_OFFSET,
      },
    };
  });

  return { nodes: [...resolvedNormalNodes, ...layoutedAccessoryNodes], edges };
};
