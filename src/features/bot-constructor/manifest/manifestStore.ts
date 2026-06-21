import registryJson from "@/features/bot-constructor/manifest/runtime-node-registry.json";
import { NodeManifest } from "@/features/bot-constructor/manifest/types";

export const runtimeNodeRegistry = registryJson as NodeManifest[];

// Static manifest map — built once at module load; never mutated.
const nodeManifestMap = new Map(
  runtimeNodeRegistry.map((entry) => [entry.type, entry])
);

// Runtime module manifest map — augmented via registerModuleManifests().
// Static types always take precedence (a module cannot override a built-in node).
const moduleManifestMap = new Map<string, NodeManifest>();

/** Register runtime module manifests (called on mount / backend fetch). */
export function registerModuleManifests(manifests: NodeManifest[]): void {
  // Defensive: React Query data is undefined while loading / on error.
  if (!Array.isArray(manifests)) return;
  for (const manifest of manifests) {
    // Do not allow modules to shadow built-in static node types.
    if (!nodeManifestMap.has(manifest.type)) {
      moduleManifestMap.set(manifest.type, manifest);
    }
  }
}

/** Clear all previously registered module manifests. */
export function clearModuleManifests(): void {
  moduleManifestMap.clear();
}

/** Return all currently registered module manifests. */
export function getModuleManifests(): NodeManifest[] {
  return Array.from(moduleManifestMap.values());
}

/**
 * Resolve a node manifest by type.
 * Static (built-in) entries take precedence over module entries.
 */
export function getNodeManifestByType(type: string): NodeManifest | undefined {
  return nodeManifestMap.get(type) ?? moduleManifestMap.get(type);
}
