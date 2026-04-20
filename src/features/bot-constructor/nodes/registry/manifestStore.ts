import registryJson from "../manifests/runtime-node-registry.json";
import { NodeManifest } from "./types";

export const runtimeNodeRegistry = registryJson as NodeManifest[];

const nodeManifestMap = new Map(
  runtimeNodeRegistry.map((entry) => [entry.type, entry])
);

export function getNodeManifestByType(type: string) {
  return nodeManifestMap.get(type);
}
