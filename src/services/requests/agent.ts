import { instanceAuth } from "@/services/instance";
import { getSession } from "next-auth/react";

const AGENT_BASE = "https://api.botspace.uz/api/agent";

// ── Types ─────────────────────────────────────────────────────────────────

export interface AgentStep {
  key: string;
  name: string;
  status: "running" | "done" | "error";
}

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
  plan?: string;
  steps?: AgentStep[];
}

export type StreamEvent =
  | { type: "thinking" }
  | { type: "token"; content: string }
  | { type: "plan"; content: string; modules?: string[] }
  | { type: "tool_call"; name: string; input: string }
  | { type: "tool_result"; name: string; preview: string }
  | { type: "module_progress"; completed: number; total: number; completed_name?: string; next_index?: number; status?: string; message?: string }
  | { type: "done"; reply: string; has_flow: boolean; flow_json: { nodes: any[]; edges: any[] } | null }
  | { type: "error"; message: string };

export interface AgentChatResponse {
  session_id: string;
  reply: string;
  has_flow: boolean;
  flow_json: { nodes: any[]; edges: any[] } | null;
}

export interface ProjectSession {
  session_id: string;
  has_flow: boolean;
  turn_count: number;
  created_at: string;
  updated_at: string;
  messages: AgentMessage[];
}

// ── API ───────────────────────────────────────────────────────────────────

/**
 * Get or create the single AI session for a project.
 * Returns session info + full message history in one request.
 */
export async function getProjectSession(projectId: string): Promise<ProjectSession> {
  const res = await instanceAuth.get(`${AGENT_BASE}/projects/${projectId}/session`);
  return res.data;
}

/** Send a chat message and get agent reply */
export async function chatWithAgent(
  sessionId: string,
  message: string
): Promise<AgentChatResponse> {
  const res = await instanceAuth.post(`${AGENT_BASE}/sessions/${sessionId}/chat`, { message });
  return res.data;
}

/** Connect WebSocket and stream agent events. Returns a cleanup function. */
export function wsChatWithAgent(
  projectId: string,
  message: string,
  token: string,
  onEvent: (event: StreamEvent) => void,
  onClose?: () => void,
): () => void {
  const wsBase = AGENT_BASE.replace(/^http/, "ws");
  const ws = new WebSocket(`${wsBase}/projects/${projectId}/chat/ws`);

  ws.onopen = () => {
    ws.send(JSON.stringify({ token, message }));
  };

  ws.onmessage = (e) => {
    try {
      onEvent(JSON.parse(e.data) as StreamEvent);
    } catch {}
  };

  ws.onerror = () => {
    onEvent({ type: "error", message: "WebSocket ulanish xatosi" });
  };

  ws.onclose = () => {
    onClose?.();
  };

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}
