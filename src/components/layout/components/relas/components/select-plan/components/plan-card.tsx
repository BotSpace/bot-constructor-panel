import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";
import { Check, Loader2, Star } from "lucide-react";
import { type BillingPeriod, type Plan } from "./types";

type PlanCardProps = {
    plan: Plan;
    billingPeriod: BillingPeriod;
    isCurrent: boolean;
    isPopular: boolean;
    isProcessing: boolean;
    onSelectPlan: (plan_id: Plan["id"]) => void;
    buttonText: string;
    unable_free: boolean;
};

export function PlanCard({
    plan,
    billingPeriod,
    isCurrent,
    isPopular,
    isProcessing,
    onSelectPlan,
    buttonText,
    unable_free,
}: PlanCardProps) {
    const originalPrice = Number(plan.price);
    const discountedMonthly = Math.round(
        originalPrice * (1 - billingPeriod.discount / 100),
    );
    const totalPrice = discountedMonthly * billingPeriod.months;
    const totalSavings =
        (originalPrice - discountedMonthly) * billingPeriod.months;
    const hasDiscount = billingPeriod.discount > 0 && originalPrice > 0;

    return (
        <Card
            className={`relative flex h-full flex-col overflow-hidden justify-start rounded-2xl border bg-linear-to-b from-card/90 to-background/80 p-5 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl ${isCurrent
                ? "border-primary ring-2 ring-primary/40"
                : "border-border/60 hover:border-primary/60"
                }`}
        >
            {unable_free && (
                <div className="absolute !bg-black/70 backdrop-blur-xl rounded-2xl z-20 top-0 left-0 w-full h-full flex items-center justify-center">
                    <b className="text-primary font-semibold md:max-w-[200px] text-center">
                        Bepul tarifidan faqat bir mart foydalanish mumkin
                    </b>
                </div>
            )}
            {isPopular && (
                <span className="absolute left-[50%] top-[-10px] translate-x-[-50%] rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
                    Eng mashhur
                </span>
            )}

            {/* Badges */}
            <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/70 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    <Star className="h-3 w-3 text-primary" />
                    {plan.name_display}
                </span>
                <div className="flex gap-1">
                    {isCurrent && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">
                            Joriy tarif
                        </span>
                    )}
                </div>
            </div>

            {/* Price */}
            <div className="mt-4 space-y-1.5">
                <div className="flex flex-col items-baseline gap-2">
                    {hasDiscount && (
                        <span className="text-lg text-muted-foreground/60 line-through decoration-destructive/40">
                            {formatCurrency(originalPrice)}
                        </span>
                    )}
                    <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-3xl font-semibold text-transparent">
                        {formatCurrency(hasDiscount ? discountedMonthly : originalPrice)}
                    </span>
                </div>

                {hasDiscount && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            -{billingPeriod.discount}%
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            Jami: {formatCurrency(totalPrice)} /{" "}
                            {billingPeriod.label}
                        </span>
                    </div>
                )}

                {hasDiscount && totalSavings > 0 && (
                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(totalSavings)} tejaysiz!
                    </p>
                )}

                <p className="text-xs text-muted-foreground">
                    {plan.description ||
                        "Kichik va o'rta loyihalar uchun qulay va ishonchli tarif."}
                </p>
            </div>

            {/* Features */}
            <ul className="mt-5 space-y-2 text-xs text-muted-foreground">
                {typeof plan.max_users === "number" && (
                    <li className="flex items-start gap-2">
                        <Check className="mt-[2px] h-3 w-3 text-primary" />
                        <span>
                            Maksimal foydalanuvchilar:{" "}
                            <span className="font-medium text-foreground">
                                {plan.max_users}
                            </span>
                        </span>
                    </li>
                )}
                {plan.custom_domain && (
                    <li className="flex items-start gap-2">
                        <Check className="mt-[2px] h-3 w-3 text-primary" />
                        <span>Custom domen ulash imkoniyati</span>
                    </li>
                )}
                {plan.priority_support && (
                    <li className="flex items-start gap-2">
                        <Check className="mt-[2px] h-3 w-3 text-primary" />
                        <span>Ustuvor texnik yordam</span>
                    </li>
                )}
                {plan.powered_by_botmother === false && (
                    <li className="flex items-start gap-2">
                        <Check className="mt-[2px] h-3 w-3 text-primary" />
                        <span>
                            Botda &quot;Powered by BotMother&quot; yozuvisiz
                        </span>
                    </li>
                )}
                <li className="flex items-start gap-2">
                    <Check className="mt-[2px] h-3 w-3 text-primary" />
                    <span>
                        Cheklanmagan xabar yuborish va foydalanuvchi oqimi
                    </span>
                </li>
            </ul>

            {/* Action */}
            <Button
                className="w-full rounded-xl font-semibold mt-auto"
                variant={isCurrent ? "outline" : "default"}
                disabled={isCurrent || isProcessing}
                onClick={() => onSelectPlan(plan.id)}
            >
                {isProcessing && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {buttonText}
            </Button>
        </Card>
    );
}
