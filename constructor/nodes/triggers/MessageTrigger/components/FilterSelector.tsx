// React va kerakli komponent/tiplarni import qilamiz
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Filtr opsiyasi uchun tip
interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectorProps {
  value: string;
  onValueChange: (newFilter: string) => void;
  options: FilterOption[];
}

// Komponentni export qilamiz
export const FilterSelector = ({
  value,
  onValueChange,
  options,
}: FilterSelectorProps) => {
  return (
    <Select value={value || ""} onValueChange={onValueChange}>
      <SelectTrigger className="h-8 w-full text-xs">
        <SelectValue placeholder="Tanlang..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((filter) => (
          <SelectItem key={filter.value} value={filter.value}>
            {filter.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
