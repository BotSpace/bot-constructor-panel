import { ButtonConfig } from "@/features/bot-constructor/components";
import { StateConfig } from "../shared/state-config-types";

export interface ReplyButtonTriggerData {
  // `selectedButtons` (ko'plik) o'rniga `selectedButton` (birlik)
  selectedButtons?: ButtonConfig[];
  global: boolean;
  context: {};
  // Hech qanday tugma bosilmasa ham tutib olish
  catchNoButton?: boolean;
  state?: StateConfig;
}
