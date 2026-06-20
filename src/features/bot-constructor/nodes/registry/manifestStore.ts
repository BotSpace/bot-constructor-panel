import registryJson from "@/features/bot-constructor/nodes/manifests/runtime-node-registry.json";
import { NodeManifest } from "@/features/bot-constructor/nodes/registry/types";

export const runtimeNodeRegistry = registryJson as NodeManifest[];

const nodeManifestMap = new Map(
  runtimeNodeRegistry.map((entry) => [entry.type, entry])
);

export function getNodeManifestByType(type: string) {
  return nodeManifestMap.get(type);
}
