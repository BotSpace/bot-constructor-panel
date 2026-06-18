import { instanceAuth } from "@/services/instance";
import { Env } from "@/types/http/env";

export interface PaginatedEnvResponse {
  links: {
    previous: string | null;
    next: string | null;
  };
  total_items: number;
  total_pages: number;
  page_size: number;
  current_page: number;
  results: Env[];
}

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

export async function getEnvList(
  projectId: string | number,
  page = 1,
  pageSize = 50
): Promise<PaginatedEnvResponse> {
  const { data } = await instanceAuth.get<ApiResponse<PaginatedEnvResponse>>(
    "/enviroment/",
    { params: { project: projectId, page, page_size: pageSize } }
  );
  return data.data;
}

export async function createEnv(payload: {
  key: string;
  value: string;
  secret: boolean;
  project: number | string;
}): Promise<Env> {
  const { data } = await instanceAuth.post<ApiResponse<Env>>(
    "/enviroment/",
    payload
  );
  return data.data;
}

export async function updateEnv(
  id: number,
  payload: { key?: string; value?: string; secret?: boolean }
): Promise<Env> {
  const { data } = await instanceAuth.patch<ApiResponse<Env>>(
    `/enviroment/${id}/`,
    payload
  );
  return data.data;
}

export async function deleteEnv(id: number): Promise<void> {
  await instanceAuth.delete(`/enviroment/${id}/`);
}
