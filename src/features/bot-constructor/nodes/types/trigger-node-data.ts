import { ButtonConfig } from "@/features/bot-constructor/components";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { StateConfig } from "@/features/bot-constructor/nodes/triggers/shared/state-config-types";

export interface RadiusContext {
  lat?: string;
  lng?: string;
  km?: string;
}

export interface SizeContext {
  min?: string;
  max?: string;
}

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

export interface CallbackQueryTriggerData {
  filter: string;
  global: boolean;
  context: {
    value: string;
  };
  state?: StateConfig;
}

export interface CommandTriggerNodeData {
  command?: string;
  withArgs?: boolean;
  global: boolean;
  state?: StateConfig;
}

export interface CronTriggerNodeData {
  schedule: string;
  enabled: boolean;
  targetChatIds: number[];
}

export interface ReplyButtonTriggerData {
  selectedButtons?: ButtonConfig[];
  global: boolean;
  context: Record<string, never>;
  catchNoButton?: boolean;
  state?: StateConfig;
}

