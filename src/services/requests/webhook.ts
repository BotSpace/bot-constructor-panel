import { instanceAuth } from "@/services/instance";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

export interface WebhookEndpointResult {
  token: string;
  url: string;
}

/**
 * Mint (or retrieve existing) webhook endpoint for a node.
 * Backend is idempotent: same (project, node_id) always returns the same url.
 * Returns the unwrapped {token, url} from the {status, data} envelope.
 */
export async function mintWebhookEndpoint(
  projectId: string | number,
  nodeId: string
): Promise<WebhookEndpointResult> {
  const { data } = await instanceAuth.post<ApiResponse<WebhookEndpointResult>>(
    "/webhook/endpoint/",
    { project: projectId, node_id: nodeId }
  );
  return data.data;
}
