import { useReactQueryAction } from "@/services/react-query";
import React, { useState } from "react";
import {
    type BillingPeriodKey,
    BILLING_PERIODS,
    type Plan,
} from "@/components/layout/relas/select-plan/types";
import { Loader2 } from "lucide-react";
import { PlanCard } from "@/components/layout/relas/select-plan/plan-card";
import SaleForLongTime from "@/components/layout/relas/select-plan/sale-for-long-time";

type Props = {
    onSelectPlan: (plan_id: string, months: number) => void;
    header: React.ReactNode;
    isUserUseFreePlan?: boolean;
};

function SelectPlan({ onSelectPlan, header, isUserUseFreePlan = false }: Props) {
    const [billingPeriod, setBillingPeriod] =
        useState<BillingPeriodKey>("3 months");

    const handleBillingChange = (key: BillingPeriodKey) => {
        setBillingPeriod(key);
    };

    const currentPeriod = BILLING_PERIODS.find(
        (p) => p.key === billingPeriod,
    )!;

    // Go backend: GET /api/v1/plans -> plain Plan[] (public, no envelope).
    const { data: plans, isLoading } = useReactQueryAction<Plan[]>({
        url: "plans",
    });

    return (
        <>
            {header}

            <SaleForLongTime
                value={billingPeriod}
                onChange={handleBillingChange}
            />

            {isLoading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            )}

            {!isLoading && !plans?.length && (
                <div className="rounded-2xl border border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
                    Tariflar ro&apos;yxatini yuklashda muammo yuz berdi. Iltimos,
                    birozdan so&apos;ng qayta urinib ko&apos;ring.
                </div>
            )}

            {!isLoading && !!plans?.length && (
                <div className="grid gap-4 grid-cols-3">
                    {plans.map((plan) => (
                        <PlanCard
                            unable_free={plan.name === "free" && isUserUseFreePlan}
                            key={plan.id}
                            plan={plan}
                            billingPeriod={currentPeriod}
                            isCurrent={false}
                            isPopular={plan.is_top}
                            isProcessing={false}
                            onSelectPlan={(plan_id) => onSelectPlan(plan_id, currentPeriod.months)}
                            buttonText="Tanlash"
                        />
                    ))}
                </div>
            )}
        </>
    );
}

export default SelectPlan;
