import { ConstructorData } from "@/features/bot-constructor/data";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { StateConfig } from "../shared";

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

  state?: StateConfig;
}
