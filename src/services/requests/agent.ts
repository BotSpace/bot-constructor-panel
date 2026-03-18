import { instanceAuth } from "@/services/instance";

const AGENT_BASE = "https://api.botspace.uz/api/agent";

// ── Types ─────────────────────────────────────────────────────────────────

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

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
