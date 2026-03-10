/**
 * Utility function to extract state keys from both StateNodes and Trigger nodes
 * that have state configuration enabled.
 * Only returns keys from nodes connected in the chain leading to the current node.
 */

import { Node, Edge } from "reactflow";
import { StateNodeData } from "../nodes/custom/StateNode/types";
import { MessageTriggerNodeData } from "../nodes/triggers/MessageTrigger/types";
import { CallbackQueryTriggerData } from "../nodes/triggers/CallbackQueryTrigger/types";
import { CommandTriggerNodeData } from "../nodes/triggers/CommandTrigger/types";
import { ReplyButtonTriggerData } from "../nodes/triggers/ReplyButtonTrigger/types";

type TriggerNodeWithState =
  | MessageTriggerNodeData
  | CallbackQueryTriggerData
  | CommandTriggerNodeData
  | ReplyButtonTriggerData;

/**
 * Type for trigger node with required state
 */
type TriggerNodeWithRequiredState = TriggerNodeWithState & {
  state: NonNullable<TriggerNodeWithState["state"]>;
};

/**
 * Node types that support state configuration
 */
const TRIGGER_TYPES_WITH_STATE = [
  "MessageTriggerNode",
  "CallbackQueryTriggerNode",
  "CommandTriggerNode",
  "ReplyButtonTriggerNode",
] as const;

/**
 * Type guard to check if node data has state configuration
 */
function hasStateConfig(data: unknown): data is TriggerNodeWithRequiredState {
  if (typeof data !== "object" || data === null || !("state" in data)) {
    return false;
  }

  const triggerData = data as TriggerNodeWithState;
  return (
    triggerData.state !== null &&
    triggerData.state !== undefined &&
    typeof triggerData.state === "object"
  );
}

/**
 * Type guard to check if a node type is a trigger type with state support
 */
function isTriggerTypeWithState(
  nodeType: string,
): nodeType is (typeof TRIGGER_TYPES_WITH_STATE)[number] {
  return (TRIGGER_TYPES_WITH_STATE as readonly string[]).includes(nodeType);
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
    if (!ancestorIds.has(node.id)) return;

    if (node.type === "StateNode") {
      const nodeData = node.data as StateNodeData;
      if (nodeData.key && nodeData.key.trim() !== "") {
        stateKeys.add(nodeData.key);
      }
    } else if (isTriggerTypeWithState(node.type)) {
      if (hasStateConfig(node.data)) {
        const stateKey = node.data.state.key;
        if (stateKey && stateKey.trim() !== "") {
          stateKeys.add(stateKey);
        }
      }
    }
  });

  return Array.from(stateKeys).sort();
}
