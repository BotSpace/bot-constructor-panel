import { StateConfig } from "../shared";

export interface CallbackQueryTriggerData {
  filter: string;
  global: boolean;
  context: {
    value: string;
  };
  state?: StateConfig;
}
