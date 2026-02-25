import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { ButtonConfig } from "@/features/bot-constructor/components";


// Murakkab context'lar uchun tiplar
interface RadiusContext {
  lat?: string; // Faqat string
  lng?: string;
  km?: string;
}

interface SizeContext {
  min?: string; // Faqat string
  max?: string;
}

// Bizning node saqlaydigan asosiy ma'lumotlar strukturasi
export interface MessageTriggerNodeData {
  type: MessageTriggerValueTypes;
  filter?: "any" | string;
  global: boolean;

  context?: {
    value?: string;
    radius?: RadiusContext;
    size?: SizeContext;
  };
}


export interface ReplyButtonTriggerData {
  // `selectedButtons` (ko'plik) o'rniga `selectedButton` (birlik)
  selectedButtons?: ButtonConfig[];
  global: boolean;
  context: {};
  // Hech qanday tugma bosilmasa ham tutib olish
  catchNoButton?: boolean;
}


export interface CallbackQueryTriggerData {
  filter: string;
  global: boolean;
  context: {
    value: string;
  };
}