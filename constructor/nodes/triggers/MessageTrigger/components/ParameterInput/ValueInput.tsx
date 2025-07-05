// React va kerakli komponentlarni import qilamiz
import React from "react";
import { Input } from "@/components/ui/input";

// Komponent qabul qiladigan props'lar uchun interfeys
interface ValueInputProps {
  value?: string; // Qiymat bo'sh bo'lishi mumkin
  onChange: (value: string) => void;
  placeholder?: string; // Placeholder matnini props orqali olish imkoniyati
}

// Komponentni `ValueInput` nomi bilan eksport qilamiz
export const ValueInput = ({
  value,
  onChange,
  placeholder = "...",
}: ValueInputProps) => {
  return (
    <Input
      placeholder={placeholder}
      value={value || ""} // `value` undefined bo'lsa, bo'sh string ishlatamiz
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-xs font-mono"
    />
  );
};
