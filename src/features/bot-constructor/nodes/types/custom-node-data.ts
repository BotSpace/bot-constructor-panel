import { KeyboardConfig } from "@/features/bot-constructor/components";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { Filter } from "@/features/bot-constructor/nodes/actions/shared/filter/types";
import { CollectionListItem } from "@/types/http/collection";
import { ElementItemType } from "@/types/element-types";
import { RadiusContext, SizeContext } from "./trigger-node-data";

export interface CallbackAnswerNodeData {
  keyboard: KeyboardConfig;
}

export interface ConditionOperator {
  variable: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "starts_with"
    | "ends_with"
    | "greater_than"
    | "less_than"
    | "greater_equal"
    | "less_equal"
    | "is_empty"
    | "not_empty"
    | "exists"
    | "not_exists"
    | "in"
    | "not_in";
  value?: string | number | boolean;
}

export interface ConditionBranch {
  type: "if" | "else_if" | "else";
  label?: string;
  operator?: "AND" | "OR";
  conditions?: ConditionOperator[];
}

export interface IfConditionNodeData {
  operator?: "AND" | "OR";
  conditions?: ConditionOperator[];
  mode?: "simple" | "advanced";
  branches?: ConditionBranch[];
}

export interface ElseIfNodeData {
  operator?: "AND" | "OR";
  conditions?: Array<{
    variable: string;
    operator: string;
    value?: string | number | boolean;
  }>;
}

export interface ElseNodeData {}

export interface CustomCodeNodeData {
  label: string;
  jsCode: string;
  language: "javascript";
  globals?: string[];
  outputs?: { name: string; description?: string }[];
}

export interface DelayNodeData {
  seconds?: number;
}

export interface ForLoopContinueNodeData {}

export interface ForLoopNodeData {
  dataKey?: string;
  itemVariable?: string;
}

export interface FormNodeData {
  items: {
    question: string;
    order: number;
    type: MessageTriggerValueTypes;
    filter: string;
    key: string;
    context: {
      value?: string;
      radius?: RadiusContext;
      size?: SizeContext;
    };
    keyboard?: KeyboardConfig;
  }[];
}

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface HTTPRequestNodeData {
  method?: HTTPMethod;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  responseVariable?: string;
  timeout?: number;
  storeHeaders?: boolean;
}

export interface StateNodeData {
  key: string;
  type: string;
  customType?: string;
  node_type: ElementItemType["triggerId"];
  collectionField?: string;
}

export interface SubFlowExitNodeData {
  exitName: string;
}

export type VariableOperation =
  | "set"
  | "increment"
  | "decrement"
  | "append"
  | "remove"
  | "delete"
  | "toggle"
  | "parse_json";

export interface VariableNodeData {
  operation?: VariableOperation;
  variableName?: string;
  value?: string | number | boolean;
}

export interface CollectionNodeData {
  collection_name?: string;
  fieldMappings?: Record<string, string>;
}

export interface LoadCollectionItemNodeData {
  collection?: CollectionListItem | null;
  contextKey?: string;
  filters?: Filter[];
  node_type?: "LoadCollectionItemNode";
}

export interface SubFlowNodeData {
  slug: string;
  pluginName?: string;
  pluginDescription?: string;
  params: Record<string, unknown>;
  paramsSchema?: Record<string, unknown>;
  outputs?: { name: string; description: string }[];
}

