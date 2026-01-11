import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { KeyboardConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";

// Murakkab context'lar uchun tiplar
interface RadiusContext {
  lat?: string;
  lng?: string;
  km?: string;
}

interface SizeContext {
  min?: string;
  max?: string;
}

export interface FormNodeData {
  items: {
    question: string;
    order: number;
    type: MessageTriggerValueTypes;
    filter: string;
    context: {
      value?: string;
      radius?: RadiusContext;
      size?: SizeContext;
    };
    keyboard?: KeyboardConfig;
  }[];
}
