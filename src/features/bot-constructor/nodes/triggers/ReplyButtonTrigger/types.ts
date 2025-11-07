import { ButtonConfig } from "@/features/bot-constructor/components";

export interface ReplyButtonTriggerData {
  // `selectedButtons` (ko'plik) o'rniga `selectedButton` (birlik)
  selectedButton?: ButtonConfig;
  global: boolean;
  context: {};
}
