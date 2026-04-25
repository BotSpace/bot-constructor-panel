import env from "@/lib/env";

export type AgentRunStatus =
  | "queued"
  | "running"
  | "waiting_for_clarification"
  | "completed"
  | "failed";

export interface AgentMessage {
  id: number;
  run_id: string;
  role: "user" | "assistant";
  content: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface CreateRunRequest {
  prompt: string;
}

export interface CreateRunResponse {
  request_id: string;
  status: AgentRunStatus;
}

export interface RunStatusResponse {
  request_id: string;
  status: AgentRunStatus;
  final_response: string | null;
  error: string | null;
  pending_clarification: unknown;
  current_plan: unknown;
}

export interface ActiveAgentRun {
  request_id: string;
  status: Extract<AgentRunStatus, "queued" | "running" | "waiting_for_clarification">;
  prompt: string;
  flow?: string | null;
  thread_id?: string | null;
  pending_clarification: unknown;
  current_plan: unknown;
  last_event_seq: number;
  created_at: string;
  updated_at: string;
  events?: AgentStreamEvent[];
}

export type AgentEventType =
  | "run_started"
  | "tool_call"
  | "tool_result"
  | "plan_created"
  | "plan_item_updated"
  | "plan_completed"
  | "node_upserted"
  | "node_patched"
  | "node_removed"
  | "edge_upserted"
  | "flow_replaced"
  | "clarification_required"
  | "assistant_message"
  | "run_completed"
  | "run_failed"
  | "heartbeat";

export interface AgentStreamEvent<TPayload = Record<string, unknown>> {
  request_id: string;
  seq: number;
  type: AgentEventType;
  description?: string;
  payload: TPayload;
}

export interface ClarifyRequest {
  answer: string;
  option_id?: string;
  option_ids?: string[];
  answers?: Array<{
    question_id: string;
    answer: string;
    option_id?: string;
    option_ids?: string[];
  }>;
}

function trimSlashes(value: string) {
  return value.replace(/\/+$/, "");
}

export function getAgentBaseUrl() {
  if (env.NEXT_PUBLIC_AGENT_API) {
    return trimSlashes(env.NEXT_PUBLIC_AGENT_API);
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://127.0.0.1:8000/agent";
    }
  }

  return `${trimSlashes(env.NEXT_PUBLIC_API || "")}/agent`;
}

function buildAgentUrl(path: string) {
  return `${getAgentBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data?.detail === "string"
        ? data.detail
        : typeof data?.error === "string"
          ? data.error
          : response.statusText;
    throw new Error(message || "Agent API request failed");
  }

  return data as T;
}

export async function createAgentRun(
  projectId: string,
  data: CreateRunRequest,
  token: string
) {
  const response = await fetch(buildAgentUrl(`/projects/${projectId}/runs`), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseJsonResponse<CreateRunResponse>(response);
}

export async function getAgentRunStatus(
  projectId: string,
  requestId: string,
  token: string
) {
  const response = await fetch(
    buildAgentUrl(`/projects/${projectId}/runs/${requestId}`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseJsonResponse<RunStatusResponse>(response);
}

export async function answerAgentClarification(
  projectId: string,
  requestId: string,
  data: ClarifyRequest,
  token: string
) {
  const response = await fetch(
    buildAgentUrl(`/projects/${projectId}/runs/${requestId}/clarify`),
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return parseJsonResponse<RunStatusResponse>(response);
}

export async function getProjectAgentMessages(
  projectId: string,
  token: string,
  params: { limit?: number; offset?: number } = {}
) {
  const search = new URLSearchParams({
    limit: String(params.limit ?? 50),
    offset: String(params.offset ?? 0),
  });
  const response = await fetch(
    buildAgentUrl(`/projects/${projectId}/messages?${search.toString()}`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseJsonResponse<AgentMessage[]>(response);
}

export async function getActiveAgentRuns(
  projectId: string,
  token: string,
  params: { includeEvents?: boolean; eventLimit?: number } = {}
) {
  const search = new URLSearchParams();
  if (params.includeEvents) {
    search.set("include_events", "true");
  }
  if (params.eventLimit) {
    search.set("event_limit", String(params.eventLimit));
  }

  const query = search.toString();
  const response = await fetch(
    buildAgentUrl(`/projects/${projectId}/runs/active${query ? `?${query}` : ""}`),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseJsonResponse<ActiveAgentRun[]>(response);
}

function parseSseBlock(block: string) {
  const lines = block.split(/\r?\n/);
  const eventName = lines
    .find((line) => line.startsWith("event:"))
    ?.slice(6)
    .trim();
  const dataLines = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart());

  if (!dataLines.length) {
    return null;
  }

  return {
    eventName,
    data: dataLines.join("\n"),
  };
}

export function createAgentEventStream({
  projectId,
  requestId,
  token,
  onEvent,
  onError,
  onClose,
}: {
  projectId: string;
  requestId: string;
  token: string;
  onEvent: (event: AgentStreamEvent) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}) {
  const controller = new AbortController();
  let closed = false;

  async function connect() {
    try {
      const response = await fetch(
        buildAgentUrl(`/projects/${projectId}/runs/${requestId}/events`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          signal: controller.signal,
        }
      );

      if (!response.ok || !response.body) {
        throw new Error(response.statusText || "Agent stream failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const dispatchBlock = (block: string) => {
        const parsedBlock = parseSseBlock(block);
        if (!parsedBlock) return;

        try {
          const event = JSON.parse(parsedBlock.data) as AgentStreamEvent;
          onEvent({
            ...event,
            type: event.type || (parsedBlock.eventName as AgentEventType),
          });
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error("Invalid SSE event"));
        }
      };

      while (!closed) {
        const { value, done } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          const finalBlock = buffer.trim();
          if (finalBlock) {
            dispatchBlock(finalBlock);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\n\n|\r\n\r\n/);
        buffer = blocks.pop() || "";
        blocks.forEach(dispatchBlock);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        onError?.(error instanceof Error ? error : new Error("Agent stream failed"));
      }
    } finally {
      onClose?.();
    }
  }

  void connect();

  return () => {
    closed = true;
    controller.abort();
  };
}
