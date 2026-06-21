import { getRuntimeNodeRegistry, runtimeNodeComponents } from "@/features/bot-constructor/manifest";
import { createGenericNodeComponent } from "@/features/bot-constructor/canvas/createGenericNodeComponent";
import { NodeManifest } from "@/features/bot-constructor/manifest/types";
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

/**
 * Build a nodeTypes map for the given module manifests.
 * Each module manifest gets a generic component created via createGenericNodeComponent.
 * The result is meant to be merged into the static CustomNodes inside a useMemo.
 */
export function buildModuleNodeTypes(
  manifests: NodeManifest[]
): Record<string, ComponentType<NodeProps>> {
  return manifests.reduce<Record<string, ComponentType<NodeProps>>>(
    (acc, entry) => {
      acc[entry.type] = createGenericNodeComponent(entry.type) as ComponentType<NodeProps>;
      return acc;
    },
    {}
  );
}
