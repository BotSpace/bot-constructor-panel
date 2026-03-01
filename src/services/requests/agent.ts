import { instanceAuth } from "@/services/instance";

const AGENT_BASE = "https://api.botspace.uz/api/agent";

// ── Types ────────────────────────────────────────────────────────────────

export interface AgentSession {
  session_id: string;
  phase: string;
  turn_count: number;
  has_flow: boolean;
  requirements: string[];
  created_at: string;
  updated_at: string;
}

export interface AgentChatResponse {
  session_id: string;
  reply: string;
  phase: string;
  has_flow: boolean;
  flow_json: { nodes: any[]; edges: any[] } | null;
  requirements: string[];
}

export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

// ── API ──────────────────────────────────────────────────────────────────

/** Create a new agent session, optionally with the current project flow */
export async function createAgentSession(existingFlow?: { nodes: any[]; edges: any[] }): Promise<{ session_id: string }> {
  const res = await instanceAuth.post(`${AGENT_BASE}/sessions`, existingFlow ? { existing_flow: existingFlow } : {});
  return res.data;
}

/** Get session info */
export async function getAgentSession(sessionId: string): Promise<AgentSession> {
  const res = await instanceAuth.get(`${AGENT_BASE}/sessions/${sessionId}`);
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

/** Get conversation history */
export async function getAgentHistory(sessionId: string): Promise<AgentMessage[]> {
  const res = await instanceAuth.get(`${AGENT_BASE}/sessions/${sessionId}/history`);
  return res.data;
}

/** Reset session */
export async function resetAgentSession(sessionId: string): Promise<void> {
  await instanceAuth.post(`${AGENT_BASE}/sessions/${sessionId}/reset`);
}

/** Delete session */
export async function deleteAgentSession(sessionId: string): Promise<void> {
  await instanceAuth.delete(`${AGENT_BASE}/sessions/${sessionId}`);
}

/** List all sessions */
export async function listAgentSessions(): Promise<AgentSession[]> {
  const res = await instanceAuth.get(`${AGENT_BASE}/sessions`);
  return res.data;
}
