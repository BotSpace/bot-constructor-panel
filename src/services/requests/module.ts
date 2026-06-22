import { instanceAuth } from "@/services/instance";
import { NodeManifest } from "@/features/bot-constructor/manifest/types";
import { ProjectModule, AvailableModule, ModuleDetail } from "@/types/http/module";

// ---------------------------------------------------------------------------
// GET /api/project/{id}/module-manifests/
// Returns the merged NodeManifest[] for all modules enabled on this project.
// Response shape: { data: NodeManifest[] }
// ---------------------------------------------------------------------------
export async function getProjectModuleManifests(
  projectId: string | number
): Promise<NodeManifest[]> {
  const { data } = await instanceAuth.get(
    `/project/${projectId}/module-manifests/`
  );
  // Shapes seen in the wild:
  //   { manifests: [...] }                      (raw view)
  //   { status, data: { manifests: [...] } }    (envelope renderer)
  const body = (data as any)?.data ?? data;
  const manifests = body?.manifests ?? body;
  return Array.isArray(manifests) ? manifests : [];
}

// ---------------------------------------------------------------------------
// GET /api/project/{id}/modules/
// Returns the list of enabled modules with their deployment status.
// ---------------------------------------------------------------------------
export async function getProjectModules(
  projectId: string | number
): Promise<ProjectModule[]> {
  const { data } = await instanceAuth.get(`/project/${projectId}/modules/`);
  // Project endpoints come wrapped: { status, data: [...] }; tolerate plain array.
  if (Array.isArray(data)) return data;
  const d = data as any;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  return [];
}

// ---------------------------------------------------------------------------
// POST /api/project/{id}/modules/  { module_slug }
// Enable (deploy) a module for this project.
// ---------------------------------------------------------------------------
export async function enableModule(
  projectId: string | number,
  moduleSlug: string
): Promise<ProjectModule> {
  const { data } = await instanceAuth.post(
    `/project/${projectId}/modules/`,
    { module_slug: moduleSlug }
  );
  return ((data as any)?.data ?? data) as ProjectModule;
}

// ---------------------------------------------------------------------------
// DELETE /api/project/{id}/modules/{slug}/
// Disable (undeploy) a module for this project.
// ---------------------------------------------------------------------------
export async function disableModule(
  projectId: string | number,
  moduleSlug: string
): Promise<void> {
  await instanceAuth.delete(`/project/${projectId}/modules/${moduleSlug}/`);
}

// ---------------------------------------------------------------------------
// GET /api/modules/
// Returns the global catalog of all available modules.
// ---------------------------------------------------------------------------
export async function listAvailableModules(): Promise<AvailableModule[]> {
  // Backend paginates: { results: [...] }; tolerate a plain array too.
  const { data } = await instanceAuth.get<
    AvailableModule[] | { results: AvailableModule[] }
  >(`/modules/`);
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.results) ? data.results : [];
}

// ---------------------------------------------------------------------------
// GET /api/modules/{id}/
// Returns the full detail for one module (docs, nodes, etc.)
// ---------------------------------------------------------------------------
export async function getModuleDetail(
  moduleId: number | string
): Promise<ModuleDetail> {
  const { data } = await instanceAuth.get(`/modules/${moduleId}/`);
  return ((data as any)?.data ?? data) as ModuleDetail;
}
