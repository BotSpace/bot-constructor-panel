import { StateConfig } from "../shared/state-config-types";

export interface CallbackQueryTriggerData {
  filter: string;
  global: boolean;
  context: {
    value: string;
  };
  state?: StateConfig;
}
