export interface Plan {
  id: string;
  name: "free" | "start" | "pro" | "enterprise" | string;
  name_display: string;
  description: string | null;
  price: string;
  is_active: boolean;
  is_top: boolean;
  created_at: string;
  // Go backend's /plans no longer returns these (max_bots/max_tokens/features
  // replaced them) — kept optional so PlanCard's existing guards degrade
  // gracefully instead of crashing.
  max_users?: number;
  powered_by_botmother?: boolean;
  custom_domain?: boolean;
  priority_support?: boolean;
  max_bots?: number;
  max_tokens?: number;
}

export type BillingPeriodKey = "1 month" | "3 months" | "6 months" | "1 year";

export interface BillingPeriod {
  key: BillingPeriodKey;
  label: string;
  months: number;
  discount: number;
  bestValue?: boolean;
  isPopular?: boolean;
}

export const BILLING_PERIODS: BillingPeriod[] = [
  { key: "1 month", label: "1 oy", months: 1, discount: 0 },
  { key: "3 months", label: "3 oy", months: 3, discount: 12, isPopular: true },
  { key: "6 months", label: "6 oy", months: 6, discount: 20 },
  { key: "1 year", label: "1 yil", months: 12, discount: 30, bestValue: true },
];
