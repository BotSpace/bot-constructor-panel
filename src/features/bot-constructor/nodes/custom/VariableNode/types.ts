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
