// FAYL: constructor/components/ButtonGenerator/types.ts (YANGILANGAN)

import { Filter } from "@/features/bot-constructor/nodes/shared/filter/types";

// Login URL uchun maxsus konfiguratsiya
export interface LoginUrlConfig {
  url: string;
  forward_text?: string;
  bot_username?: string;
  request_write_access?: boolean;
}

// Web App uchun maxsus konfiguratsiya
export interface WebAppConfig {
  url: string;
}

// Collection-based button uchun ma'lumotlar
export interface CollectionButtonData {
  collection: string;
  text: string;
  filters?: Filter[];
  enablePagination: boolean;
  // Layout options - pagination uchun
  layout?: {
    columns: number; // Har bir qatorda nechta tugma (1-4)
    rows: number; // Har bir sahifada nechta qator (1-10)
    // Jami: columns × rows = bir sahifada ko'rsatiladigan tugmalar soni
    // Qolgan tugmalar keyingi sahifalarda (pagination)
  };
}

// Barcha mumkin bo'lgan tugma turlari
export type ButtonType =
  // Mavjud
  | "url"
  | "callback"
  | "reply"
  | "request_contact"
  | "request_location"
  // Yangi
  | "switch_inline_query"
  | "switch_inline_query_current_chat"
  | "web_app"
  | "login_url"
  | "request_poll"
  | "request_live_location";

// Asosiy tugma konfiguratsiyasi
export interface ButtonConfig {
  id: string;
  text: string;
  type: ButtonType;

  // Ixtiyoriy, turli xil qiymatlar uchun
  value?: string; // url, callback, switch_inline_* uchun ishlatiladi
  webApp?: WebAppConfig;
  loginUrl?: LoginUrlConfig;
  pollType?: "quiz" | "regular"; // request_poll uchun

  // Collection-based button uchun ma'lumotlar
  collectionData?: CollectionButtonData;
}

export type KeyboardType = "inline" | "reply";

// Telegram ReplyKeyboardMarkup opsiyalari
export interface ReplyKeyboardOptions {
  resize_keyboard: boolean;
  one_time_keyboard: boolean;
  is_persistent: boolean;
  remove_after_use: boolean;
}

export const DEFAULT_REPLY_KEYBOARD_OPTIONS: ReplyKeyboardOptions = {
  remove_after_use: true,
  resize_keyboard: true,
  one_time_keyboard: false,
  is_persistent: false,
};

// --- Yengi qo'shiladigan struktura ---
export interface KeyboardConfig {
  active: KeyboardType;
  inline: ButtonConfig[][];
  reply: ButtonConfig[][];
  replyOptions?: ReplyKeyboardOptions;
}
