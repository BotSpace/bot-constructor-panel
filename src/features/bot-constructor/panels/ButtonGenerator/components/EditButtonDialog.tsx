import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HighlightedInput } from "@/features/bot-constructor/components/HighlightedInput";
import { Label } from "@/components/ui/label";
import { ButtonConfig } from "@/features/bot-constructor/panels/ButtonGenerator/types";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  isI18nValue,
  getLangValue,
  setLangValue,
  type I18nValue,
} from "@/features/bot-constructor/fields/generic-fields/LocalizedField";

interface EditButtonDialogProps {
  button: ButtonConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedButton: Partial<ButtonConfig>) => void;
  /** {{}} autocomplete uchun mavjud o'zgaruvchilar */
  suggestions?: string[];
}

const LANG_LABELS: Record<string, string> = {
  en: "EN", ru: "RU", uz: "UZ", de: "DE", fr: "FR",
  ar: "AR", tr: "TR", kz: "KZ", ja: "JA", zh: "ZH",
};

export const EditButtonDialog = ({
  button,
  isOpen,
  onClose,
  onSave,
  suggestions = [],
}: EditButtonDialogProps) => {
  const languages = useFlowStore((s) => s.languages);
  const defaultLanguage = useFlowStore((s) => s.defaultLanguage);

  // text: may be a plain string OR an I18nValue when multi-language.
  const [textRaw, setTextRaw] = useState<string | I18nValue>("");
  const [value, setValue] = useState("");
  const [webAppUrl, setWebAppUrl] = useState("");
  const [activeLang, setActiveLang] = useState(defaultLanguage || "en");

  const isMultiLang = languages.length > 1;

  useEffect(() => {
    if (button) {
      // Preserve existing i18n marker if present; otherwise plain string.
      const raw = button.text as string | I18nValue | undefined;
      setTextRaw(raw || "");
      setActiveLang(defaultLanguage || languages[0] || "en");
      if (button.type === "web_app") {
        setWebAppUrl(button.webApp?.url || button.value || "");
        setValue("");
      } else {
        setValue(button.value || "");
        setWebAppUrl("");
      }
    }
  }, [button, defaultLanguage, languages]);

  // Current visible string for the active tab
  const currentText = isMultiLang
    ? getLangValue(textRaw, activeLang, defaultLanguage)
    : (typeof textRaw === "string" ? textRaw : getLangValue(textRaw, defaultLanguage, defaultLanguage));

  const handleTextChange = (nextStr: string) => {
    if (!isMultiLang) {
      setTextRaw(nextStr);
    } else {
      setTextRaw((prev) => setLangValue(prev, activeLang, nextStr, defaultLanguage));
    }
  };

  // Resolve final text value for saving: plain string when single-language.
  const resolveText = (): string | I18nValue => {
    if (!isMultiLang) {
      return typeof textRaw === "string" ? textRaw : getLangValue(textRaw, defaultLanguage, defaultLanguage);
    }
    return isI18nValue(textRaw) ? textRaw : { __i18n: true, [defaultLanguage]: typeof textRaw === "string" ? textRaw : "" };
  };

  const handleSave = () => {
    const finalText = resolveText();
    if (button?.type === "web_app") {
      if (!webAppUrl.startsWith("https://")) return;
      onSave({ text: finalText as string, webApp: { url: webAppUrl }, value: webAppUrl });
    } else {
      onSave({ text: finalText as string, value });
    }
    onClose();
  };

  if (!button) return null;

  const isWebApp = button.type === "web_app";
  const isUrlInvalid = isWebApp && webAppUrl.length > 0 && !webAppUrl.startsWith("https://");

  const getValueLabel = () => {
    switch (button.type) {
      case "url": return "URL";
      case "web_app": return "Web App URL";
      default: return "Callback data";
    }
  };

  const getValuePlaceholder = () => {
    switch (button.type) {
      case "url": return "https://example.com";
      case "web_app": return "https://app.example.com";
      default: return "callback_data";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tugmani tahrirlash</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-text">Tugma matni</Label>
            {isMultiLang && (
              <div className="flex flex-wrap gap-1 mb-1">
                {[defaultLanguage, ...languages.filter((l) => l !== defaultLanguage)].map((lang) => {
                  const hasContent = getLangValue(textRaw, lang, defaultLanguage).trim() !== "";
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLang(lang)}
                      className={cn(
                        "rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                        activeLang === lang
                          ? "bg-primary text-primary-foreground"
                          : [
                              "border text-muted-foreground hover:text-foreground",
                              hasContent ? "border-primary/40 text-foreground/70" : "border-border",
                            ]
                      )}
                    >
                      {LANG_LABELS[lang] || lang.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            )}
            <HighlightedInput
              id="edit-text"
              value={currentText}
              onChange={(e) => handleTextChange(e.target.value)}
              suggestions={suggestions}
              placeholder="Tugma matni... yoki {{public_name}}"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-value">{getValueLabel()}</Label>
            {isWebApp ? (
              <>
                <Input
                  id="edit-value"
                  value={webAppUrl}
                  onChange={(e) => setWebAppUrl(e.target.value)}
                  placeholder={getValuePlaceholder()}
                  className={cn(
                    isUrlInvalid && "border-destructive focus-visible:ring-destructive"
                  )}
                />
                {isUrlInvalid && (
                  <p className="text-[11px] text-destructive">
                    URL https:// bilan boshlanishi shart
                  </p>
                )}
              </>
            ) : (
              <HighlightedInput
                id="edit-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                suggestions={suggestions}
                placeholder={getValuePlaceholder()}
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            disabled={isWebApp && (!webAppUrl || !webAppUrl.startsWith("https://"))}
          >
            Saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
