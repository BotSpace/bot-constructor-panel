// ---------------------------------------------------------------------------
// Module feature — shared TypeScript types
// ---------------------------------------------------------------------------
// NodeManifest is defined in the manifest layer; we re-export it here so the
// HTTP layer can reference it without creating a circular dependency chain.
export type { NodeManifest } from "@/features/bot-constructor/manifest/types";

/** Status of a module deployment for a specific project. */
export type ModuleStatus = "pending" | "running" | "failed" | "stopped";

/** One enabled module entry returned by GET /api/project/{id}/modules/ */
export interface ProjectModule {
  id: number;
  module: {
    slug: string;
    name: string;
    icon: string;
  };
  enabled: boolean;
  status: ModuleStatus;
}

/** One item in the global module catalog: GET /api/modules/ */
export interface AvailableModule {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string;
}

/** Response shape for GET /api/project/{id}/module-manifests/ */
export interface ProjectModuleManifestsResponse {
  data: import("@/features/bot-constructor/manifest/types").NodeManifest[];
}

/** A node provided by a module (returned in detail endpoint) */
export interface ModuleNode {
  type: string;
  title: string;
  category: string;
  trigger: boolean;
}

/** Full module detail: GET /api/modules/{id}/ */
export interface ModuleDetail {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  docs: string;
  nodes: ModuleNode[];
}
