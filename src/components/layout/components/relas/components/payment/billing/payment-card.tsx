"use client";

import type React from "react";

import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodCardProps {
  id: string;
  name: string;
  logo: any;
  color: string;
  isSelected: boolean;
  onSelect: Dispatch<SetStateAction<string>>;
  isSoon: boolean;
}

export function PaymentMethodCard({
  name,
  logo,
  color,
  onSelect,
  isSelected,
  isSoon,
  id,
}: PaymentMethodCardProps) {
  return (
    <div
      aria-disabled={isSoon}
      onClick={() => !isSoon && onSelect(id)}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 transition-all duration-200",
        "flex items-center justify-center gap-4 text-left",
        "bg-gradient-to-br",
        color,
        isSoon
          ? "opacity-60 cursor-not-allowed"
          : "hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer",
        isSelected && !isSoon
          ? "border-primary ring-2 ring-primary/40 shadow-lg"
          : "border-border/60 hover:border-primary/60"
      )}
    >
      <Image
        className="w-full h-10 md:h-20 object-contain"
        alt={name}
        src={logo}
        width={100}
        height={100}
      />

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      {/* Soon indicator */}
      {isSoon && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-yellow-500/90 backdrop-blur-sm border border-yellow-400/50">
          <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">
            Tez orada
          </span>
        </div>
      )}
    </div>
  );
}
