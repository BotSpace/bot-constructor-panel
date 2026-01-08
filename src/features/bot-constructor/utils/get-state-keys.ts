/**
 * Utility function to extract state keys from both StateNodes and Trigger nodes
 * that have state configuration enabled.
 */

import { Node } from "reactflow";
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
function hasStateConfig(data: unknown): data is TriggerNodeWithState {
  return (
    typeof data === "object" &&
    data !== null &&
    "state" in data &&
    (data as TriggerNodeWithState).state !== null &&
    typeof (data as TriggerNodeWithState).state === "object"
  );
}

/**
 * Type guard to check if a node type is a trigger type with state support
 */
function isTriggerTypeWithState(nodeType: string): nodeType is typeof TRIGGER_TYPES_WITH_STATE[number] {
  return TRIGGER_TYPES_WITH_STATE.includes(nodeType as typeof TRIGGER_TYPES_WITH_STATE[number]);
}

/**
 * Extract all available state keys from nodes in the flow.
 * This includes:
 * - StateNode keys
 * - Trigger node state keys (MessageTrigger, CallbackQueryTrigger, CommandTrigger, ReplyButtonTrigger)
 *
 * @param nodes - Array of ReactFlow nodes
 * @returns Sorted array of unique state keys
 */
export function getAvailableStateKeys(nodes: Node[]): string[] {
  const stateKeys = new Set<string>();

  nodes.forEach((node) => {
    if (!node.type) return;
    
    // Check StateNode
    if (node.type === "StateNode") {
      const nodeData = node.data as StateNodeData;
      if (nodeData.key && nodeData.key.trim() !== "") {
        stateKeys.add(nodeData.key);
      }
    }
    // Check trigger nodes with state configuration
    else if (isTriggerTypeWithState(node.type)) {
      if (hasStateConfig(node.data)) {
        const stateKey = node.data.state?.key;
        if (stateKey && stateKey.trim() !== "") {
          stateKeys.add(stateKey);
        }
      }
    }
  });

  return Array.from(stateKeys).sort();
}