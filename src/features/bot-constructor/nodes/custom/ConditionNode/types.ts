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

export interface IfConditionNodeData {
  operator?: "AND" | "OR";
  conditions?: ConditionOperator[];
}
