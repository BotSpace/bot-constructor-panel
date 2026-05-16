"use client";

import { PaymentMethodCard } from "./payment-card";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { instanceAuth } from "@/services/instance";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Format number with thousand separators for UZS
function formatUZSAmount(amount: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Parse formatted string back to number
function parseUZSAmount(value: string): number {
  // Remove all spaces and non-digit characters
  const cleaned = value.replace(/\s/g, "").replace(/[^\d]/g, "");
  if (!cleaned) return 0;
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : Math.max(0, parsed); // Ensure non-negative
}

export function PaymentMethodsSection({
  initialAmmount,
  min,
}: {
  initialAmmount?: number;
  min?: number;
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("click");
  const minAmount = min || 10000; // Default minimum is 50000 if not provided

  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const paymentMethods = [
    {
      id: "click",
      name: "Click",
      logo: "/click.svg",
      color: "from-blue-500/50 to-blue-600",
      isSoon: false,
    },
    {
      id: "payme",
      name: "Payme",
      logo: "/payme.png",
      color: "from-cyan-500/50 to-cyan-600",
      isSoon: true,
    },
    {
      id: "uzum",
      name: "Uzum Bank",
      logo: "/uzum.svg",
      color: "from-violet-500/20 to-violet-600/70",
      isSoon: true,
    },
    {
      id: "card",
      name: "Bank Kartasi",
      logo: "/paynet.svg",
      color: "from-emerald-500/50 to-emerald-600",
      isSoon: true,
    },
  ];

  function handleCreateTransaction() {
    if (amount < minAmount) {
      toast.error(`Minimal summa: ${formatUZSAmount(minAmount)} UZS`);
      return;
    }

    const toastId = toast.loading("Loading...");

    instanceAuth
      .post("/payment/create-transaction/", {
        method: selectedPaymentMethod,
        amount: amount,
      })
      .then(({ data }) => {
        toast.success("Yaratilindi", { id: toastId });
        window.open(data.data.link, "_blank");
      })
      .catch(() => {
        toast.error("Xatolik yuz berdi", { id: toastId });
      });
  }

  useEffect(() => {
    const initialAmount = initialAmmount
      ? Math.max(initialAmmount, minAmount)
      : minAmount;
    queueMicrotask(() => setAmount(initialAmount));
  }, [initialAmmount, minAmount]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground mb-2">
          Qulay to'lov usullari
        </h3>
        <p className="text-sm text-muted-foreground">
          Balansni to'ldirish uchun istalgan usulni tanlang
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {paymentMethods.map((method) => {
          return (
            <PaymentMethodCard
              onSelect={setSelectedPaymentMethod}
              isSelected={method.id === selectedPaymentMethod}
              key={method.id}
              color={method.color}
              id={method.id}
              logo={method.logo}
              name={method.name}
              isSoon={method.isSoon}
            />
          );
        })}
      </div>

      <div className="flex mt-4 gap-2">
        <div className="relative flex-1">
          <Input
            className={cn(
              "pr-16",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            value={formatUZSAmount(amount)}
            onChange={(e) => {
              const parsed = parseUZSAmount(e.target.value);
              setAmount(parsed);

              if (parsed > 0 && parsed < minAmount) {
                setError(`Minimal summa: ${formatUZSAmount(minAmount)} UZS`);
              } else {
                setError("");
              }
            }}
            type="text"
            inputMode="numeric"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
            UZS
          </span>
        </div>
        <Button
          onClick={handleCreateTransaction}
          disabled={amount < minAmount || amount === 0}
        >
          To'ldirish
          <ArrowRight />
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      {!error && minAmount && (
        <p className="mt-2 text-sm text-muted-foreground">
          Minimal summa: {formatUZSAmount(minAmount)} UZS
        </p>
      )}

      {/* Info message */}
      <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">💡 Maslahat:</span>{" "}
          Barcha to'lov usullari xavfsiz va shifrlangan. Komissiya yo'q!
        </p>
      </div>
    </div>
  );
}
