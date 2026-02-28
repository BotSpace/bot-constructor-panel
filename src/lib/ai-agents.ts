/**
 * AI Agent types va konfiguratsiyalari
 */

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  icon?: string;
}

export const AI_AGENTS: AIAgent[] = [
  {
    id: "gemini-flash",
    name: "Gemini Flash",
    description: "Tez va samarali javoblar",
    model: "gemini-1.5-flash",
    icon: "⚡",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    description: "Kuchli va batafsil javoblar",
    model: "gemini-1.5-pro",
    icon: "💎",
  },
  {
    id: "gemini-2-flash",
    name: "Gemini 2.0 Flash",
    description: "Yangi model - eng yaxshi sifat",
    model: "gemini-2.0-flash-exp",
    icon: "🚀",
  },
];

export const DEFAULT_AGENT = AI_AGENTS[0];

/**
 * Agent'ni ID bo'yicha topish
 */
export function getAgentById(id: string): AIAgent | undefined {
  return AI_AGENTS.find((agent) => agent.id === id);
}

/**
 * Agent'ni model bo'yicha topish
 */
export function getAgentByModel(model: string): AIAgent | undefined {
  return AI_AGENTS.find((agent) => agent.model === model);
}

