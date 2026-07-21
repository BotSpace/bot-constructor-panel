/**
 * Utility function to extract state keys from both StateNodes and Trigger nodes
 * that have state configuration enabled.
 * Only returns keys from nodes connected in the chain leading to the current node.
 */

import { Node, Edge } from "reactflow";
import { getNodeManifestByType } from "@/features/bot-constructor/manifest/manifestStore";

interface StateNodeDataLocal {
  key: string;
  [key: string]: unknown;
}

/**
 * Collect state keys produced by manifest fields flagged `is_state: true`.
 * The field's current value (e.g. outputKey="agent_output") becomes a state key.
 */
function getManifestStateKeys(node: Node): string[] {
  if (!node.type) return [];
  const manifest = getNodeManifestByType(node.type);
  if (!manifest) return [];

  const keys: string[] = [];
  const data = (node.data ?? {}) as Record<string, unknown>;

  const resolveTemplate = (template: string): string => {
    let unresolved = false;
    const resolved = template.replace(/\{\{([^{}]+)\}\}/g, (_match, rawKey: string) => {
      const key = rawKey.trim();
      if (key === "nodeId") return node.id;
      const value = data[key] ?? manifest.defaults?.[key];
      if (typeof value === "string" && value.trim() !== "") return value.trim();
      if (typeof value === "number") return String(value);
      unresolved = true;
      return "";
    });
    return unresolved ? "" : resolved.trim();
  };

  // Node-level auto state keys: produced just by using the node (no field).
  if (Array.isArray(manifest.producesState)) {
    for (const key of manifest.producesState) {
      if (typeof key === "string") {
        const resolved = resolveTemplate(key);
        if (resolved !== "") keys.push(resolved);
      }
    }
  }

  // Field-level is_state: the field's current value becomes a state key.
  for (const field of manifest.content ?? []) {
    if (field.is_state && field.key) {
      const value = data[field.key] ?? field.stateDefault ?? manifest.defaults?.[field.key];
      if (typeof value === "string" && value.trim() !== "") {
        const rawBase = value.trim();
        const base = field.key === "state_key" && data.private === true
          ? `private.${rawBase}`
          : rawBase;
        const suffixes = field.stateSuffixes?.length ? field.stateSuffixes : [""];
        for (const suffix of suffixes) keys.push(`${base}${suffix}`);
      }
    }
  }

  return keys;
}

/**
 * Node types that support flat state configuration (save_state / state_key / state_type)
 */
const TRIGGER_TYPES_WITH_STATE = [
  "MessageTriggerNode",
  "CallbackQueryTriggerNode",
  "CallbackButtonTriggerNode",
  "CommandTriggerNode",
  "ReplyButtonTriggerNode",
] as const;

/**
 * Type guard to check if a node type is a trigger type with state support
 */
function isTriggerTypeWithState(
  nodeType: string,
): nodeType is (typeof TRIGGER_TYPES_WITH_STATE)[number] {
  return (TRIGGER_TYPES_WITH_STATE as readonly string[]).includes(nodeType);
}

/**
 * Extract the state key from a trigger node.
 * Supports both new flat format (save_state + state_key) and
 * legacy nested format (data.state.key) as fallback.
 */
function getTriggerStateKey(data: Record<string, unknown>): string | null {
  // New flat format
  if (data.save_state === true && typeof data.state_key === "string") {
    const key = data.state_key.trim();
    return key !== "" ? key : null;
  }

  // Legacy nested format fallback
  const legacy = data.state as Record<string, unknown> | undefined;
  if (legacy && typeof legacy === "object" && typeof legacy.key === "string") {
    const key = legacy.key.trim();
    return key !== "" ? key : null;
  }

  return null;
}

/**
 * BFS orqali joriy node'ga ulangan barcha ancestor node ID'larini topadi.
 * Edge'lar bo'yicha orqaga (target -> source) traverse qiladi.
 */
function getAncestorNodeIds(currentNodeId: string, edges: Edge[]): Set<string> {
  const ancestors = new Set<string>();
  const queue = [currentNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;

    for (const edge of edges) {
      if (edge.target === nodeId && !ancestors.has(edge.source)) {
        ancestors.add(edge.source);
        queue.push(edge.source);
      }
    }
  }

  return ancestors;
}

/**
 * Extract available state keys from nodes connected in the chain to the current node.
 * This includes:
 * - StateNode keys
 * - Trigger node state keys (MessageTrigger, CallbackQueryTrigger, CommandTrigger, ReplyButtonTrigger)
 *
 * @param nodes - Array of ReactFlow nodes
 * @param edges - Array of ReactFlow edges
 * @param currentNodeId - ID of the current node to find ancestor chain for
 * @returns Sorted array of unique state keys from ancestor nodes
 */
export function getAvailableStateKeys(
  nodes: Node[],
  edges: Edge[],
  currentNodeId: string,
): string[] {
  const stateKeys = new Set<string>();

  const ancestorIds = getAncestorNodeIds(currentNodeId, edges);

  nodes.forEach((node) => {
    if (!node.type) return;
    // Manifest is_state fields are collected for ancestors AND the current node
    // so a node's own output (e.g. AIAgentNode outputKey) is visible in its panel.
    if (ancestorIds.has(node.id) || node.id === currentNodeId) {
      getManifestStateKeys(node).forEach((key) => stateKeys.add(key));
    }

    if (!ancestorIds.has(node.id) && node.id !== currentNodeId) return;

    if (node.type === "StateNode") {
      const nodeData = node.data as StateNodeDataLocal;
      if (nodeData.key && typeof nodeData.key === "string" && nodeData.key.trim() !== "") {
        stateKeys.add(nodeData.key);
      }
    } else if (isTriggerTypeWithState(node.type)) {
      const key = getTriggerStateKey(node.data as Record<string, unknown>);
      if (key) {
        stateKeys.add(key);
      }
      const data = node.data as Record<string, unknown>;
      if (data.upload_file === true && typeof data.file_key === "string" && data.file_key.trim() !== "") {
        stateKeys.add(data.file_key.trim());
      }
    }
  });

  return Array.from(stateKeys).sort();
}
