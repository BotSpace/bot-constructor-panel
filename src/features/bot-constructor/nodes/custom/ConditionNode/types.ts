export type RecipientType = "sender" | "custom_id";

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
  // Legacy format (simple if/else)
  operator?: "AND" | "OR";
  conditions?: ConditionOperator[];
  
  // New format (if/else if/else with multiple branches)
  mode?: "simple" | "advanced";
  branches?: ConditionBranch[];
}
