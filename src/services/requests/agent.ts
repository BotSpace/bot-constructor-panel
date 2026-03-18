import { instanceAuth } from "@/services/instance";
import { getSession } from "next-auth/react";

const AGENT_BASE = "https://api.botspace.uz/api/agent";

// ── Types ─────────────────────────────────────────────────────────────────

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

export type StreamEvent =
  | { type: "thinking" }
  | { type: "token"; content: string }
  | { type: "tool_call"; name: string; input: string }
  | { type: "tool_result"; name: string; preview: string }
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

/** Stream agent responses via SSE. Calls onEvent for each event. */
export async function streamChatWithAgent(
  projectId: string,
  message: string,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const session = await getSession();
  const token = (session?.user as any)?.access ?? "";

  const response = await fetch(`${AGENT_BASE}/projects/${projectId}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!response.body) throw new Error("No response body");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.trim();
      if (line.startsWith("data: ")) {
        try {
          onEvent(JSON.parse(line.slice(6)) as StreamEvent);
        } catch {}
      }
    }
  }
}
