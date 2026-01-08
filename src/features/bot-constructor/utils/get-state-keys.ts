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
    // Check StateNode
    if (node.type === "StateNode") {
      const nodeData = node.data as StateNodeData;
      if (nodeData.key && nodeData.key.trim() !== "") {
        stateKeys.add(nodeData.key);
      }
    }
    // Check trigger nodes with state configuration
    else if (
      node.type === "MessageTriggerNode" ||
      node.type === "CallbackQueryTriggerNode" ||
      node.type === "CommandTriggerNode" ||
      node.type === "ReplyButtonTriggerNode"
    ) {
      const nodeData = node.data as TriggerNodeWithState;
      if (nodeData.state?.key && nodeData.state.key.trim() !== "") {
        stateKeys.add(nodeData.state.key);
      }
    }
  });

  return Array.from(stateKeys).sort();
}
