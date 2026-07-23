import { instanceAuth } from "@/services/instance";

export interface ManagedBot {
  id: string;
  tg_bot_id: number;
  username: string;
  name: string;
  created_at: string;
  used: boolean;
}

export interface ManagedBotConfig {
  enabled: boolean;
  manager_username?: string;
  deep_link_template?: string;
}

export async function getManagedBotConfig(): Promise<ManagedBotConfig> {
  const { data } = await instanceAuth.get<ManagedBotConfig>("/managed-bot/config");
  return data;
}

export async function listManagedBots(): Promise<ManagedBot[]> {
  const { data } = await instanceAuth.get<ManagedBot[]>("/managed-bot");
  return Array.isArray(data) ? data : [];
}

export async function claimManagedBot(username: string): Promise<void> {
  await instanceAuth.post("/managed-bot/claim", { username });
}

export async function connectProjectBot(
  projectId: string,
  input: { token: string } | { managed_bot_id: string }
): Promise<void> {
  await instanceAuth.patch(`/projects/${projectId}`, input);
}
