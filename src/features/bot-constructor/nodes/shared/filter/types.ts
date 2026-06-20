export type FilterType = "text" | "number" | "bool" | "datetime" | "file" | "audio" | "video" | "photo" | "relation";

export type TextOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with";
export type NumberOperator =
  | "equals"
  | "not_equals"
  | "greater_than"
  | "less_than"
  | "greater_or_equal"
  | "less_or_equal";
export type BoolOperator = "is_true" | "is_false";
export type DatetimeOperator = "equals" | "before" | "after" | "between";
export type DefaultOperator = ""

export type FilterOperator =
  | TextOperator
  | NumberOperator
  | BoolOperator
  | DatetimeOperator
  | DefaultOperator;

export interface FilterField {
  id: string;
  label: string;
  type: FilterType;
}

export interface Filter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | Date | [Date, Date];
  valueSource?: "static" | "state"; // static = literal value, state = from user state
  stateKey?: string; // State key when valueSource is "state"
}

export interface FilterBuilderProps {
  fields: FilterField[];
  filters: Filter[];
  onChange: (filters: Filter[]) => void;
  stateKeys?: string[]; // Available state keys from StateNodes
}
