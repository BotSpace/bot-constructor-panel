export interface ElseIfNodeData {
  operator?: "AND" | "OR";
  conditions?: Array<{
    variable: string;
    operator: string;
    value?: string | number | boolean;
  }>;
}
