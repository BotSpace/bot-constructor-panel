import { cn } from "@/lib/utils";
import { Flame, TrendingDown, Zap } from "lucide-react";
import { type BillingPeriodKey, BILLING_PERIODS } from "./types";

type Props = {
    value: BillingPeriodKey;
    onChange: (value: BillingPeriodKey) => void;
};

export default function SaleForLongTime({ value, onChange }: Props) {
    const selected = BILLING_PERIODS.find((p) => p.key === value)!;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BILLING_PERIODS.map((period) => {
                    const isSelected = period.key === value;
                    return (
                        <button
                            key={period.key}
                            type="button"
                            onClick={() => onChange(period.key)}
                            className={cn(
                                "relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3.5 transition-all duration-200",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                    : "border-border/60 bg-card hover:border-primary/40 hover:bg-primary/2",
                                period.bestValue && !isSelected && "border-amber-500/30",
                            )}
                        >
                            {period.bestValue && (
                                <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                                    <Flame className="h-2.5 w-2.5" />
                                    Eng foydali
                                </span>
                            )}

                            {period.isPopular && (
                                <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                                    <Zap className="h-2.5 w-2.5" />
                                    Mashhur
                                </span>
                            )}

                            <span
                                className={cn(
                                    "text-base font-bold",
                                    isSelected
                                        ? "text-primary"
                                        : "text-foreground",
                                )}
                            >
                                {period.label}
                            </span>

                            {period.discount > 0 ? (
                                <span
                                    className={cn(
                                        "rounded-full px-2 py-0.5 text-[11px] font-bold",
                                        isSelected
                                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                    )}
                                >
                                    -{period.discount}% chegirma
                                </span>
                            ) : (
                                <span className="text-[11px] text-muted-foreground">
                                    Standart narx
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
