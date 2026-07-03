import { instanceAuth } from "@/services/instance";

export interface WebhookEndpointResult {
  token: string;
  url: string;
  chat_id: number;
}

/**
 * Mint (or retrieve existing) webhook endpoint for a node.
 * Backend is idempotent: same (project, node_id, chat_id) always returns the
 * same url. Optional chatId binds the URL to a chat (flow runs as that user).
 * Go backend returns the raw {token, url, chat_id} body — no envelope.
 */
export async function mintWebhookEndpoint(
  projectId: string,
  nodeId: string,
  chatId = 0
): Promise<WebhookEndpointResult> {
  const { data } = await instanceAuth.post<WebhookEndpointResult>(
    "/webhook/endpoint",
    { project: projectId, node_id: nodeId, chat_id: chatId }
  );
  return data;
}
