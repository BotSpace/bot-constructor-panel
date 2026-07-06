import { instanceAuth } from "@/services/instance";
import { Env } from "@/types/http/env";

// GET /api/v1/enviroment?project=<uuid> — plain array, no pagination envelope.
export async function getEnvList(projectId: string): Promise<Env[]> {
  const { data } = await instanceAuth.get<Env[]>("/enviroment", {
    params: { project: projectId },
  });
  return Array.isArray(data) ? data : [];
}

// POST /api/v1/enviroment {project_id, key, value, secret} — upsert: a
// second call with the same project_id+key overwrites the value. There is
// no separate update endpoint.
export async function createEnv(payload: {
  key: string;
  value: string;
  secret: boolean;
  project: string;
}): Promise<Env> {
  const { data } = await instanceAuth.post<Env>("/enviroment", {
    key: payload.key,
    value: payload.value,
    secret: payload.secret,
    project_id: payload.project,
  });
  return data;
}

// There is no PATCH /enviroment/:id on the new backend — updating a value
// means POSTing the same key again (see createEnv above). Kept as an alias
// so existing call sites compile; callers should prefer createEnv.
export const updateEnv = createEnv;

// DELETE /api/v1/enviroment/:key — keyed by the env var's KEY, not its id.
export async function deleteEnv(projectId: string, key: string): Promise<void> {
  await instanceAuth.delete(`/enviroment/${encodeURIComponent(key)}`, {
    params: { project: projectId },
  });
}
