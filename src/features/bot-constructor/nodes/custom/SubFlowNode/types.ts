export interface SubFlowNodeData {
  slug: string;
  pluginName?: string;
  pluginDescription?: string;
  params: Record<string, unknown>;
  paramsSchema?: Record<string, unknown>;
  outputs?: { name: string; description: string }[];
}
