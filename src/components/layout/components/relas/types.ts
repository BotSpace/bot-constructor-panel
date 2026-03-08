export interface ReleaseForm {
  token: string;
  plan_id: string;
  sale_for_long_time: "1 month" | "3 months" | "6 months" | "1 year";
}
