import { NodeManifest } from "@/features/bot-constructor/manifest/types";

let runtimeNodeRegistry: NodeManifest[] = [];
const nodeManifestMap = new Map<string, NodeManifest>();

/** Replace the runtime registry with the backend's unified canonical catalog. */
export function registerNodeManifests(manifests: NodeManifest[]): void {
  if (!Array.isArray(manifests)) return;
  runtimeNodeRegistry = manifests;
  nodeManifestMap.clear();
  for (const manifest of manifests) {
    nodeManifestMap.set(manifest.type, manifest);
  }
}

export function clearNodeManifests(): void {
  runtimeNodeRegistry = [];
  nodeManifestMap.clear();
}

export function getRuntimeNodeRegistry(): NodeManifest[] {
  return runtimeNodeRegistry;
}

export function getModuleManifests(): NodeManifest[] {
  return runtimeNodeRegistry.filter((manifest) => Boolean(manifest.moduleSlug));
}

export function getNodeManifestByType(type: string): NodeManifest | undefined {
  return nodeManifestMap.get(type);
}
