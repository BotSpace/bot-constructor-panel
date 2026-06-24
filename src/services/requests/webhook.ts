import { instanceAuth } from "@/services/instance";

interface ApiResponse<T> {
  status: boolean;
  data: T;
}

export interface WebhookEndpointResult {
  token: string;
  url: string;
  chat_id: number;
}

/**
 * Mint (or retrieve existing) webhook endpoint for a node.
 * Backend is idempotent: same (project, node_id, chat_id) always returns the
 * same url. Optional chatId binds the URL to a chat (flow runs as that user).
 * Returns the unwrapped {token, url, chat_id} from the {status, data} envelope.
 */
export async function mintWebhookEndpoint(
  projectId: string | number,
  nodeId: string,
  chatId = 0
): Promise<WebhookEndpointResult> {
  const { data } = await instanceAuth.post<ApiResponse<WebhookEndpointResult>>(
    "/webhook/endpoint/",
    { project: projectId, node_id: nodeId, chat_id: chatId }
  );
  return data.data;
}
