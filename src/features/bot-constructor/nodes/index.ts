import { createGenericNodeComponent } from "@/features/bot-constructor/canvas/createGenericNodeComponent";
import { NodeManifest } from "@/features/bot-constructor/manifest/types";
import { ComponentType } from "react";
import { NodeProps } from "reactflow";

/**
 * Build ReactFlow components from the canonical backend manifests.
 */
export function buildNodeTypes(
  manifests: NodeManifest[]
): Record<string, ComponentType<NodeProps>> {
  return manifests
    .filter((entry) => entry.status === "runtime")
    .reduce<Record<string, ComponentType<NodeProps>>>(
    (acc, entry) => {
      acc[entry.type] = createGenericNodeComponent(entry.type) as ComponentType<NodeProps>;
      return acc;
    },
    {}
  );
}
