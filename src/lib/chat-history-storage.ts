/**
 * Chat history storage utility
 * localStorage'da chatlar tarixini saqlash va olish
 */

export interface ChatHistoryItem {
  id: string;
  title: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  agent: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "ai_chat_history";
const MAX_HISTORY_ITEMS = 50; // Maksimal chatlar soni

/**
 * Barcha chatlar tarixini olish
 */
export function getChatHistory(): ChatHistoryItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error reading chat history:", error);
    return [];
  }
}

/**
 * Chatlar tarixini saqlash
 */
export function saveChatHistory(history: ChatHistoryItem[]): void {
  if (typeof window === "undefined") return;

  try {
    // Maksimal hajmdan oshib ketmasligi uchun eski chatlarni o'chiramiz
    const limitedHistory = history.slice(-MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
}

/**
 * Yangi chat yaratish
 */
export function createChatHistory(
  title: string,
  agent: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): ChatHistoryItem {
  const now = new Date().toISOString();
  return {
    id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title,
    messages: messages.map((msg) => ({
      ...msg,
      timestamp: new Date().toISOString(),
    })),
    agent,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Chat'ni saqlash
 */
export function saveChat(chat: ChatHistoryItem): void {
  const history = getChatHistory();
  const existingIndex = history.findIndex((item) => item.id === chat.id);

  if (existingIndex >= 0) {
    // Mavjud chat'ni yangilash
    history[existingIndex] = {
      ...chat,
      updatedAt: new Date().toISOString(),
    };
  } else {
    // Yangi chat qo'shish
    history.push(chat);
  }

  saveChatHistory(history);
}

/**
 * Chat'ni o'chirish
 */
export function deleteChat(chatId: string): void {
  const history = getChatHistory();
  const filtered = history.filter((item) => item.id !== chatId);
  saveChatHistory(filtered);
}

/**
 * Chat'ni olish
 */
export function getChat(chatId: string): ChatHistoryItem | null {
  const history = getChatHistory();
  return history.find((item) => item.id === chatId) || null;
}

/**
 * Chatlar tarixini tozalash
 */
export function clearChatHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Chat sarlavhasini avtomatik yaratish (birinchi xabardan)
 */
export function generateChatTitle(firstMessage: string): string {
  // Birinchi xabardan sarlavha yaratish
  const maxLength = 50;
  if (firstMessage.length <= maxLength) {
    return firstMessage;
  }
  return firstMessage.substring(0, maxLength) + "...";
}

