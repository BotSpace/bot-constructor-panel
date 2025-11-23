// FAYL: constructor/components/ButtonGenerator/types.ts (YANGILANGAN)

import { Filter } from "@/features/bot-constructor/nodes/actions/TextMessageNode/components/filter/types";

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
  field: string;
  filters?: Filter[];
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
  | "request_poll";

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
