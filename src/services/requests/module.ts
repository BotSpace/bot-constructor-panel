import { instanceAuth } from "@/services/instance";
import { NodeManifest } from "@/features/bot-constructor/manifest/types";
import { ProjectModule, AvailableModule } from "@/types/http/module";

// ---------------------------------------------------------------------------
// GET /api/project/{id}/module-manifests/
// Returns the merged NodeManifest[] for all modules enabled on this project.
// Response shape: { data: NodeManifest[] }
// ---------------------------------------------------------------------------
export async function getProjectModuleManifests(
  projectId: string | number
): Promise<NodeManifest[]> {
  const { data } = await instanceAuth.get<{
    manifests?: NodeManifest[];
    data?: NodeManifest[];
  }>(`/project/${projectId}/module-manifests/`);
  // Backend returns { manifests: [...] }; tolerate { data: [...] } too.
  return data?.manifests ?? data?.data ?? [];
}

// ---------------------------------------------------------------------------
// GET /api/project/{id}/modules/
// Returns the list of enabled modules with their deployment status.
// ---------------------------------------------------------------------------
export async function getProjectModules(
  projectId: string | number
): Promise<ProjectModule[]> {
  const { data } = await instanceAuth.get<ProjectModule[]>(
    `/project/${projectId}/modules/`
  );
  return Array.isArray(data) ? data : [];
}

// ---------------------------------------------------------------------------
// POST /api/project/{id}/modules/  { module_slug }
// Enable (deploy) a module for this project.
// ---------------------------------------------------------------------------
export async function enableModule(
  projectId: string | number,
  moduleSlug: string
): Promise<ProjectModule> {
  const { data } = await instanceAuth.post<ProjectModule>(
    `/project/${projectId}/modules/`,
    { module_slug: moduleSlug }
  );
  return data;
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
  const { data } = await instanceAuth.get<AvailableModule[]>(`/modules/`);
  return Array.isArray(data) ? data : [];
}
