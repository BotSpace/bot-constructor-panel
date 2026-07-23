import { instanceAuth } from "@/services/instance";
import { NodeManifest } from "@/features/bot-constructor/manifest/types";
import { ProjectModule, AvailableModule, ModuleDetail } from "@/types/http/module";

// ---------------------------------------------------------------------------
// GET /api/v1/projects/{id}/node-manifests
// Returns the canonical built-in catalog merged with enabled project modules.
// Go response shape: { manifests: NodeManifest[] }
// ---------------------------------------------------------------------------
export async function getProjectNodeManifests(
  projectId: string
): Promise<NodeManifest[]> {
  const { data } = await instanceAuth.get(
    `/projects/${projectId}/node-manifests`
  );
  const manifests = (data as any)?.manifests;
  if (!Array.isArray(manifests)) {
    throw new Error("Backend node manifest javobi noto'g'ri");
  }
  return manifests;
}

// ---------------------------------------------------------------------------
// GET /api/v1/projects/{id}/modules
// Returns the list of enabled modules with their deployment status.
// Go response is a plain array.
// ---------------------------------------------------------------------------
export async function getProjectModules(
  projectId: string
): Promise<ProjectModule[]> {
  const { data } = await instanceAuth.get(`/projects/${projectId}/modules`);
  if (!Array.isArray(data)) {
    throw new Error("Backend module ro'yxati javobi noto'g'ri");
  }
  return data;
}

// ---------------------------------------------------------------------------
// POST /api/v1/projects/{id}/modules  { module_slug }
// Enable (deploy) a module for this project.
// ---------------------------------------------------------------------------
export async function enableModule(
  projectId: string,
  moduleSlug: string
): Promise<ProjectModule> {
  const { data } = await instanceAuth.post(
    `/projects/${projectId}/modules`,
    { module_slug: moduleSlug }
  );
  return data as ProjectModule;
}

// ---------------------------------------------------------------------------
// DELETE /api/v1/projects/{id}/modules/{slug}
// Disable (undeploy) a module for this project.
// ---------------------------------------------------------------------------
export async function disableModule(
  projectId: string,
  moduleSlug: string
): Promise<void> {
  await instanceAuth.delete(`/projects/${projectId}/modules/${moduleSlug}`);
}

// ---------------------------------------------------------------------------
// GET /api/v1/modules
// Returns the global catalog of all available modules.
// Go backend paginates: { items: [...], total, limit, offset }.
// ---------------------------------------------------------------------------
export async function listAvailableModules(): Promise<AvailableModule[]> {
  const { data } = await instanceAuth.get<
    AvailableModule[] | { items: AvailableModule[] }
  >(`/modules`);
  if (Array.isArray(data)) return data;
  return Array.isArray((data as any)?.items) ? (data as any).items : [];
}

// ---------------------------------------------------------------------------
// GET /api/v1/modules/{slug}
// Returns the full detail for one module (docs, nodes, etc.)
// ---------------------------------------------------------------------------
export async function getModuleDetail(
  moduleId: string
): Promise<ModuleDetail> {
  const { data } = await instanceAuth.get(`/modules/${moduleId}`);
  return data as ModuleDetail;
}

// ---------------------------------------------------------------------------
// POST /api/v1/projects/{id}/modules/register-self-hosted
// Register the caller's own self-hosted module for this project.
//
// NOTE: This endpoint does NOT exist on the Go backend (verified against
// internal/modules/plugin/routes.go — only modules/module-manifests/
// node-manifests/modules-for-engine are mounted under /projects/:id). Kept
// wired up so the UI compiles/demos; calling it will 404 until the backend
// adds it.
// ---------------------------------------------------------------------------
export async function registerSelfHostedModule(
  projectId: string,
  payload: { endpoint: string; name?: string; auth_token?: string }
): Promise<ProjectModule> {
  const { data } = await instanceAuth.post(
    `/projects/${projectId}/modules/register-self-hosted`,
    payload
  );
  return data as ProjectModule;
}
