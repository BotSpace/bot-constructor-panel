export interface SubFlowPlugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  category: string;
  params_schema: Record<string, unknown>;
  outputs: SubFlowOutput[];
  flow: { nodes: unknown[]; edges: unknown[] };
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubFlowOutput {
  name: string;
  description: string;
}

export interface SubFlowListResponse {
  data: SubFlowPlugin[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
