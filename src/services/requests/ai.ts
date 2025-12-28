import type { AxiosResponse } from "axios";
import axios from "axios";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  message: string;
  model: string;
}

export interface ChatError {
  error: string;
}

/**
 * AI Chat so'rovini yuborish
 * Next.js API route'ga to'g'ridan-to'g'ri so'rov yuboradi
 */
export async function sendChatMessage(
  data: ChatRequest
): Promise<AxiosResponse<ChatResponse>> {
  // Next.js API route'ga so'rov
  return axios.post("/api/ai/chat", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Flow generatsiya qilish (keyinchalik implementatsiya qilinadi)
 */
export interface GenerateFlowRequest {
  description: string;
  currentFlow?: {
    nodes: any[];
    edges: any[];
  };
}

export interface GenerateFlowResponse {
  flow: {
    nodes: any[];
    edges: any[];
  };
  explanation: string;
}

export async function generateFlow(
  data: GenerateFlowRequest
): Promise<AxiosResponse<GenerateFlowResponse>> {
  return axios.post("/api/ai/generate-flow", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Code generatsiya qilish (keyinchalik implementatsiya qilinadi)
 */
export interface GenerateCodeRequest {
  description: string;
  context?: {
    globals: string[];
    existingCode?: string;
  };
}

export interface GenerateCodeResponse {
  code: string;
  explanation: string;
}

export async function generateCode(
  data: GenerateCodeRequest
): Promise<AxiosResponse<GenerateCodeResponse>> {
  return axios.post("/api/ai/generate-code", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
