"use client";

/**
 * LanguageSettingsDialog.tsx
 *
 * Sheet panel for configuring which languages the bot supports and which one
 * is the default.  Changes are written immediately into the Zustand flow store
 * (languages / defaultLanguage) and persist on the next saveFlow call.
 *
 * Follows the same Sheet/side-panel pattern as EnvManageDialog.
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Languages } from "lucide-react";

interface LanguageSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_LANGUAGES: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "uz", label: "O'zbek" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "tr", label: "Türkçe" },
  { code: "kz", label: "Қазақша" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

export function LanguageSettingsDialog({
  open,
  onOpenChange,
}: LanguageSettingsDialogProps) {
  const languages = useFlowStore((s) => s.languages);
  const defaultLanguage = useFlowStore((s) => s.defaultLanguage);
  const setLanguages = useFlowStore((s) => s.setLanguages);

  const handleToggle = (code: string, enabled: boolean) => {
    let next: string[];
    if (enabled) {
      next = [...languages, code];
    } else {
      // Must keep at least one language active.
      if (languages.length <= 1) return;
      next = languages.filter((l) => l !== code);
    }
    // If the removed language was the default, fall back to the first remaining.
    const newDefault = next.includes(defaultLanguage)
      ? defaultLanguage
      : next[0] || "en";
    setLanguages(next, newDefault);
  };

  const handleSetDefault = (code: string) => {
    if (!languages.includes(code) || defaultLanguage === code) return;
    setLanguages(languages, code);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        showOverlay={false}
        showCloseButton={false}
        onInteractOutside={() => onOpenChange(false)}
        className="flex w-full flex-col gap-0 overflow-hidden border-l border-white/10 bg-[#141414] p-0 text-white shadow-2xl sm:max-w-[420px]"
      >
        <SheetHeader className="shrink-0 gap-0 space-y-0 border-b border-white/10 bg-[#171717] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <Languages className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-base font-semibold leading-tight">
                Bot tillari
              </SheetTitle>
              <SheetDescription className="text-xs">
                Ko&apos;p tilli xabarlar uchun tillar tanlang
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-2">
          {AVAILABLE_LANGUAGES.map(({ code, label }) => {
            const isEnabled = languages.includes(code);
            const isDefault = defaultLanguage === code;

            return (
              <div
                key={code}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/3 px-4 py-3 transition-colors hover:bg-white/5"
              >
                <Switch
                  id={`lang-${code}`}
                  checked={isEnabled}
                  onCheckedChange={(v) => handleToggle(code, v)}
                  disabled={isEnabled && languages.length === 1}
                />
                <Label
                  htmlFor={`lang-${code}`}
                  className="flex-1 cursor-pointer select-none"
                >
                  <span className="font-medium">{label}</span>
                  <span className="ml-2 text-xs text-muted-foreground uppercase font-mono">
                    {code}
                  </span>
                </Label>
                {isEnabled ? (
                  <Button
                    size="sm"
                    variant={isDefault ? "default" : "outline"}
                    className="h-6 px-2 text-xs shrink-0"
                    onClick={() => handleSetDefault(code)}
                    disabled={isDefault}
                  >
                    {isDefault ? "Asosiy" : "Asosiy qil"}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>

        {languages.length > 1 ? (
          <div className="shrink-0 border-t border-white/10 px-5 py-3 text-xs text-muted-foreground">
            {languages.length} ta til tanlangan. Xabar matnlari har bir til uchun
            alohida saqlanadi.
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
