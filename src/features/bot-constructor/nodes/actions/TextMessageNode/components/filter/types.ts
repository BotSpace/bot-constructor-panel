export type FilterType = "text" | "number" | "bool" | "datetime";

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

export type FilterOperator =
  | TextOperator
  | NumberOperator
  | BoolOperator
  | DatetimeOperator;

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
}

export interface FilterBuilderProps {
  fields: FilterField[];
  filters: Filter[];
  onChange: (filters: Filter[]) => void;
}
