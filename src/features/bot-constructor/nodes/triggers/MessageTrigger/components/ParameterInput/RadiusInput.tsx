// React va kerakli komponentlarni import qilamiz.
// Bu importlar faylni modulga aylantiradi.
import React from "react";
import { Input } from "@/components/ui/input";

// Komponent qabul qiladigan props'lar uchun interfeys
interface RadiusInputProps {
    // `value` obyekti ichidagi maydonlar ixtiyoriy bo'lishi mumkin
    value?: { lat?: string; lng?: string; km?: string };
    // O'zgarish bo'lganda chaqiriladigan funksiya
    onChange: (field: "lat" | "lng" | "km", value: string) => void;
}

// Komponentni `export` qilamiz
export const RadiusInput = ({ value = {}, onChange }: RadiusInputProps) => {
    return (
        <div className="grid grid-cols-3 gap-1">
            <Input
                placeholder="Lat"
                value={value.lat || ""}
                onChange={(e) => onChange("lat", e.target.value)}
                className="h-8 text-xs font-mono"
            />
            <Input
                placeholder="Lng"
                value={value.lng || ""}
                onChange={(e) => onChange("lng", e.target.value)}
                className="h-8 text-xs font-mono"
            />
            <Input
                placeholder="Km"
                value={value.km || ""}
                onChange={(e) => onChange("km", e.target.value)}
                className="h-8 text-xs font-mono"
            />
        </div>
    );
};