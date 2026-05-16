"use client";

import { Balance } from "./types";
import { BalanceCard } from "./billing/balance-card";
import { PaymentMethodsSection } from "./billing/payment-methods-section";

export default function Billing({ initialAmmount, userBalance }: { initialAmmount: number, userBalance: Balance | undefined }) {
    if (!userBalance) return null;
    return (
        <div className="py-2 space-y-8">
            {/* Balance Card */}
            <BalanceCard
                balance={userBalance.balance}
                templateBalance={userBalance.template_balance}
            />

            {/* Payment Methods Section */}
            <PaymentMethodsSection initialAmmount={initialAmmount} />
        </div>
    );
}
