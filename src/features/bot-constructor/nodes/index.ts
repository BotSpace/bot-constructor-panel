import { getRuntimeNodeRegistry, runtimeNodeComponents } from "@/features/bot-constructor/nodes/registry";
import { ComponentType } from "react";
import { NodeProps } from "reactflow";

const registry = getRuntimeNodeRegistry().filter(
  (entry) => entry.status === "runtime"
);

function pickNodesByCategory(category: string) {
  return registry
    .filter((entry) => entry.category === category)
    .reduce<Record<string, ComponentType<NodeProps>>>(
      (accumulator, entry) => {
        const component = runtimeNodeComponents[entry.type] as
          | ComponentType<NodeProps>
          | undefined;

        if (component) {
          accumulator[entry.type] = component;
        }

        return accumulator;
      },
      {}
    );
}

export const Triggers = pickNodesByCategory("triggers");
export const ActionsTextAndMedia = pickNodesByCategory("actions");
export const ActionsMessageOperations = pickNodesByCategory("messageOperations");
export const CustomNodesCodeAndData = pickNodesByCategory("customLogic");
export const CustomNodesFlowControl = pickNodesByCategory("flowControl");
export const CustomIntegration = pickNodesByCategory("integrations");
export const CustomAI = pickNodesByCategory("ai");

export const CustomNodes = {
  ...Triggers,
  ...ActionsTextAndMedia,
  ...ActionsMessageOperations,
  ...CustomNodesCodeAndData,
  ...CustomNodesFlowControl,
  ...CustomIntegration,
  ...CustomAI,
};
