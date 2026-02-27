// React va kerakli komponentlarni import qilamiz
import React from "react";
import { Input } from "@/components/ui/input";

// Komponent qabul qiladigan props'lar uchun interfeys
interface SizeInputProps {
    value?: { min?: string; max?: string };
    onChange: (field: "min" | "max", value: string) => void;
}

// Komponentni `export` qilamiz
export const SizeInput = ({ value = {}, onChange }: SizeInputProps) => {
    return (
        <div className="grid grid-cols-2 gap-1">
            <Input
                placeholder="Min MB"
                value={value.min || ""}
                onChange={(e) => onChange("min", e.target.value)}
                className="h-8 text-xs font-mono"
            />
            <Input
                placeholder="Max MB"
                value={value.max || ""}
                onChange={(e) => onChange("max", e.target.value)}
                className="h-8 text-xs font-mono"
            />
        </div>
    );
};