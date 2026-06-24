import dagre from "dagre";
import { Node, Edge, Position } from "reactflow";
import { getNodeManifestByType } from "@/features/bot-constructor/manifest/manifestStore";
import { NodeHandleManifest } from "@/features/bot-constructor/manifest/types";

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

  // ── Branch-aware vertical correction ──────────────────────────────────────
  // Dagre doesn't know about sourceHandle names, so when a node has multiple
  // source handles (e.g. IfConditionNode: "next" at top, "true" at bottom), the
  // children can be placed in the wrong vertical order (edges cross).
  //
  // Fix: for each parent that has ≥2 edges leaving different sourceHandles,
  // sort the handles by their visual Y offset from the manifest (negative
  // offsetClass → upper handle, positive → lower), then sort the dagre-placed
  // children to match that order (upper child gets the smallest Y).
  {
    // Map nodeId → layouted position (mutable — we patch Y in place)
    const posById = new Map<string, (typeof layoutedNormalNodes)[0]>();
    layoutedNormalNodes.forEach((n) => posById.set(n.id, n));

    // Group outgoing normal edges by source node
    const outBySource = new Map<string, Edge[]>();
    forwardEdges.forEach((e) => {
      if (!outBySource.has(e.source)) outBySource.set(e.source, []);
      outBySource.get(e.source)!.push(e);
    });

    outBySource.forEach((outEdges, sourceId) => {
      // Only care about nodes with multiple edges that carry distinct sourceHandles
      const handles = [...new Set(outEdges.map((e) => e.sourceHandle).filter(Boolean))];
      if (handles.length < 2) return;

      const sourceManifest = getNodeManifestByType(
        normalNodes.find((n) => n.id === sourceId)?.type ?? ""
      );
      if (!sourceManifest?.handles) return;

      // Build handle → vertical rank from the manifest.
      // Parse the numeric value inside translate-y-[...] from offsetClass:
      //   "translate-y-[-200%]" → -200 (upper)
      //   "translate-y-[200%]"  → +200 (lower)
      // Handles without an offsetClass get rank 0 (center).
      const parseOffsetRank = (h: NodeHandleManifest): number => {
        if (!h.offsetClass) return 0;
        const m = h.offsetClass.match(/translate-y-\[(-?\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      };

      // Rank each USED source handle by its on-screen vertical position. Dynamic
      // handles — Switch renders "output-case_<n>" (cases, top→bottom by index) and
      // "output-default" (always last/bottom) — have NO manifest offsetClass, so derive
      // their rank from the handle-id pattern. Named/static handles fall back to their
      // manifest offsetClass. (The old code only looked at manifest source handles, so
      // Switch — whose handles come from the dynamic "switch-case-sources" preset — was
      // skipped entirely and its case children kept dagre's arbitrary order.)
      const manifestById = new Map<string, NodeHandleManifest>();
      sourceManifest.handles.forEach((h) => {
        if (h.id) manifestById.set(h.id, h);
      });
      const rankOf = (handleId: string): number => {
        const caseMatch = handleId.match(/^output-case_(\d+)$/);
        if (caseMatch) return parseInt(caseMatch[1], 10);
        if (handleId === "output-default") return 1_000_000;
        const mh = manifestById.get(handleId);
        return mh ? parseOffsetRank(mh) : 0;
      };

      // rank map: handleId → numeric Y rank (lower number = higher on screen)
      const handleRank = new Map<string, number>();
      handles.forEach((hId) => {
        if (hId) handleRank.set(hId, rankOf(hId));
      });

      // For each handle, collect the direct children (one hop). Their subtrees
      // are shifted rigidly afterwards so descendants follow the branch node.
      const handleToChildren = new Map<string, string[]>();
      handles.forEach((hId) => {
        const childIds = outEdges
          .filter((e) => e.sourceHandle === hId)
          .map((e) => e.target)
          .filter((id) => posById.has(id));
        if (childIds.length > 0) handleToChildren.set(hId!, childIds);
      });

      // Sort handle groups by their visual rank (ascending = top → bottom)
      const sortedHandleGroups = [...handleToChildren.entries()].sort(
        ([hA], [hB]) => (handleRank.get(hA) ?? 0) - (handleRank.get(hB) ?? 0)
      );

      // Collect ALL children across all handle groups and their current Y values
      const allChildIds = sortedHandleGroups.flatMap(([, ids]) => ids);
      if (allChildIds.length < 2) return;

      // Target Y slots: stack the children as a tight column CENTERED on the parent's
      // vertical center (top→bottom in handle-rank order), each spaced by its own
      // height + a gap. This keeps a branch's children NEXT TO the branch node instead
      // of inheriting dagre's spread-out slots — which could fling e.g. the "success"
      // child to the top of the column, far above its parent (long crossing edge).
      const parentNode = posById.get(sourceId);
      const parentCenterY =
        (parentNode?.position.y ?? 0) + (parentNode?.height ?? DEFAULT_NODE_HEIGHT) / 2;
      const BRANCH_GAP = 48;
      const childHeights = allChildIds.map((cid) => posById.get(cid)?.height ?? DEFAULT_NODE_HEIGHT);
      const stackHeight =
        childHeights.reduce((s, h) => s + h, 0) + BRANCH_GAP * (allChildIds.length - 1);
      const targetYs: number[] = [];
      let stackCursor = parentCenterY - stackHeight / 2;
      allChildIds.forEach((_, i) => {
        targetYs.push(stackCursor); // top-left Y of child i
        stackCursor += childHeights[i] + BRANCH_GAP;
      });

      // Assign the target Y slots to children in handle-rank order, AND shift each
      // child's whole forward subtree by the same delta — otherwise moving a branch
      // node leaves its descendants behind and downstream edges cross.
      const shifted = new Set<string>(allChildIds); // direct children set explicitly below
      let yIdx = 0;
      sortedHandleGroups.forEach(([, childIds]) => {
        // Sort children within the same handle group by their current Y so
        // their relative order is preserved (no unnecessary re-shuffling)
        const sorted = [...childIds].sort(
          (a, b) => (posById.get(a)?.position.y ?? 0) - (posById.get(b)?.position.y ?? 0)
        );
        sorted.forEach((childId) => {
          const node = posById.get(childId);
          if (!node) return;
          const newY = targetYs[yIdx++] ?? node.position.y;
          const delta = newY - node.position.y;
          node.position = { ...node.position, y: newY };
          if (delta === 0) return;
          // Shift the child's forward descendants (BFS) by the same delta so the
          // whole subtree moves rigidly with the branch node.
          const queue = [childId];
          while (queue.length) {
            const cur = queue.shift()!;
            (outBySource.get(cur) ?? []).forEach((e) => {
              const t = e.target;
              if (shifted.has(t)) return;
              shifted.add(t);
              const tn = posById.get(t);
              if (tn) tn.position = { ...tn.position, y: tn.position.y + delta };
              queue.push(t);
            });
          }
        });
      });
    });
  }

  // ── Convergence (merge) re-centering ──────────────────────────────────────
  // The branch correction above shifts each branch's subtree RIGIDLY, assuming a
  // tree. When two branches MERGE into one node (diamond), that node was shifted
  // with whichever branch happened to be processed first → it sticks to one side
  // instead of sitting between its parents. Re-center every multi-parent node at
  // the average of its parents' vertical centers, then shift its forward subtree
  // by the same delta. Processed left-to-right (by x) so parents are final first.
  {
    const posById = new Map<string, (typeof layoutedNormalNodes)[0]>();
    layoutedNormalNodes.forEach((n) => posById.set(n.id, n));

    const parentsByChild = new Map<string, string[]>();
    const outBySrc = new Map<string, string[]>();
    forwardEdges.forEach((e) => {
      if (!posById.has(e.source) || !posById.has(e.target)) return;
      if (!parentsByChild.has(e.target)) parentsByChild.set(e.target, []);
      parentsByChild.get(e.target)!.push(e.source);
      if (!outBySrc.has(e.source)) outBySrc.set(e.source, []);
      outBySrc.get(e.source)!.push(e.target);
    });

    const hOf = (n: (typeof layoutedNormalNodes)[0]) => n.height ?? DEFAULT_NODE_HEIGHT;

    const ordered = [...layoutedNormalNodes].sort((a, b) => a.position.x - b.position.x);
    ordered.forEach((node) => {
      const parents = parentsByChild.get(node.id);
      if (!parents || parents.length < 2) return;
      const parentNodes = parents
        .map((p) => posById.get(p))
        .filter((p): p is (typeof layoutedNormalNodes)[0] => Boolean(p));
      if (parentNodes.length < 2) return;
      const avgCenterY =
        parentNodes.reduce((s, p) => s + p.position.y + hOf(p) / 2, 0) / parentNodes.length;
      const newY = avgCenterY - hOf(node) / 2;
      const delta = newY - node.position.y;
      if (Math.abs(delta) < 1) return;
      node.position = { ...node.position, y: newY };
      // Shift the merge node's forward descendants by the same delta so they follow.
      const seen = new Set<string>([node.id]);
      const queue = [node.id];
      while (queue.length) {
        const cur = queue.shift()!;
        (outBySrc.get(cur) ?? []).forEach((t) => {
          if (seen.has(t)) return;
          seen.add(t);
          const tn = posById.get(t);
          if (tn) tn.position = { ...tn.position, y: tn.position.y + delta };
          queue.push(t);
        });
      }
    });
  }

  // ── Tidy-tree vertical pass: center each parent on its children ────────────
  // dagre + branch correction leaves children spread far down while parents cluster
  // near the top (parents "yonma-yon", children fall away). Walk columns RIGHT→LEFT:
  // first stack every column without overlaps, then pull each parent to the vertical
  // centre of its direct children (which sit to the right and are already finalised).
  // Result: every parent sits beside its child block, staggered down the canvas —
  // not bunched up at the top.
  {
    type Node0 = (typeof layoutedNormalNodes)[0];
    const COLUMN_TOL = 60; // px: nodes within this X distance count as one column
    const V_MARGIN = 28; // min vertical gap between two nodes in a column
    const hOf = (n: Node0) => n.height ?? DEFAULT_NODE_HEIGHT;

    const posById = new Map<string, Node0>();
    layoutedNormalNodes.forEach((n) => posById.set(n.id, n));

    const parentsByChild = new Map<string, string[]>();
    const childrenByParent = new Map<string, string[]>();
    forwardEdges.forEach((e) => {
      if (!posById.has(e.source) || !posById.has(e.target)) return;
      if (!parentsByChild.has(e.target)) parentsByChild.set(e.target, []);
      parentsByChild.get(e.target)!.push(e.source);
      if (!childrenByParent.has(e.source)) childrenByParent.set(e.source, []);
      childrenByParent.get(e.source)!.push(e.target);
    });

    // Group a column by the child's parent centre so siblings of one parent stay
    // together (no interleaving of two parents' children), then by own Y.
    const groupKey = (n: Node0): number => {
      const parents = (parentsByChild.get(n.id) ?? [])
        .map((p) => posById.get(p))
        .filter((p): p is Node0 => Boolean(p));
      if (!parents.length) return n.position.y;
      return parents.reduce((s, p) => s + p.position.y + hOf(p) / 2, 0) / parents.length;
    };

    const deOverlap = (colNodes: Node0[], byGroup: boolean) => {
      colNodes.sort((a, b) =>
        byGroup
          ? groupKey(a) - groupKey(b) || a.position.y - b.position.y
          : a.position.y - b.position.y
      );
      for (let i = 1; i < colNodes.length; i++) {
        const prev = colNodes[i - 1];
        const cur = colNodes[i];
        const minY = prev.position.y + hOf(prev) + V_MARGIN;
        if (cur.position.y < minY) cur.position = { ...cur.position, y: minY };
      }
    };

    const columns = new Map<number, Node0[]>();
    layoutedNormalNodes.forEach((n) => {
      const key = Math.round(n.position.x / COLUMN_TOL);
      if (!columns.has(key)) columns.set(key, []);
      columns.get(key)!.push(n);
    });
    const colKeys = [...columns.keys()].sort((a, b) => a - b); // left → right

    // 1. Stack every column (parent-grouped) so leaf children never overlap/interleave.
    colKeys.forEach((k) => deOverlap(columns.get(k)!, true));

    // 2. Right → left: pull each parent to the centre of its child block, then restack
    //    the column (parents pushed down by collisions stay ordered by their children).
    for (let i = colKeys.length - 1; i >= 0; i--) {
      const colNodes = columns.get(colKeys[i])!;
      colNodes.forEach((n) => {
        const kids = (childrenByParent.get(n.id) ?? [])
          .map((id) => posById.get(id))
          .filter((c): c is Node0 => Boolean(c));
        if (!kids.length) return;
        const top = Math.min(...kids.map((c) => c.position.y));
        const bottom = Math.max(...kids.map((c) => c.position.y + hOf(c)));
        n.position = { ...n.position, y: (top + bottom) / 2 - hOf(n) / 2 };
      });
      deOverlap(colNodes, false);
    }
  }

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

  // Separate overlapping nodes from non-overlapping ones.
  // Overlapping nodes must be stacked vertically (not all placed at the same Y),
  // otherwise siblings from the same source (e.g. CustomCode dynamic outputs)
  // end up on top of each other.
  const overlappingNodes: typeof layoutedNormalNodes = [];
  const nonOverlappingNodes: typeof layoutedNormalNodes = [];

  layoutedNormalNodes.forEach((node) => {
    const nodeBottom = node.position.y + (node.height ?? DEFAULT_NODE_HEIGHT);
    const nodeRight = node.position.x + (node.width ?? DEFAULT_NODE_WIDTH);

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

    if (overlaps) {
      overlappingNodes.push(node);
    } else {
      nonOverlappingNodes.push(node);
    }
  });

  // Stack overlapping nodes vertically below the accessory area, preserving
  // their relative X positions and original Y order so siblings don't collide.
  overlappingNodes.sort((a, b) => a.position.y - b.position.y);
  let nextY = accessoryBottom + ACCESSORY_VERTICAL_OFFSET;
  const repositionedNodes = overlappingNodes.map((node) => {
    const h = node.height ?? DEFAULT_NODE_HEIGHT;
    const positioned = {
      ...node,
      position: { ...node.position, y: nextY },
    };
    nextY += h + ACCESSORY_VERTICAL_OFFSET;
    return positioned;
  });

  const resolvedNormalNodes = [...nonOverlappingNodes, ...repositionedNodes];

  return { nodes: [...resolvedNormalNodes, ...layoutedAccessoryNodes], edges };
};
