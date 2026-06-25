"use client";

/**
 * LocalizedField.tsx
 *
 * Wrapper that adds per-language tab strip editing to any richTextMessage field
 * whose manifest entry carries `i18n: true`.
 *
 * Value contract (agreed with Go engine):
 *   - Single-language project: field value stays a plain string.
 *   - Multi-language project:  field value becomes { __i18n: true, en: "...", uz: "..." }.
 *   - On load: a plain string in multi-lang mode is treated as the defaultLanguage value.
 */

import { useState } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { NodeFieldManifest } from "@/features/bot-constructor/manifest/types";
import { RichTextMessageField } from "@/features/bot-constructor/fields/shared-message-fields";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// I18n marker type helpers
// ---------------------------------------------------------------------------

export interface I18nValue {
  __i18n: true;
  [lang: string]: string | true;
}

export function isI18nValue(v: unknown): v is I18nValue {
  return (
    typeof v === "object" &&
    v !== null &&
    (v as Record<string, unknown>).__i18n === true
  );
}

/** Extract per-language string from an i18n marker (or plain string). */
export function getLangValue(raw: unknown, lang: string, defaultLang: string): string {
  if (isI18nValue(raw)) {
    const v = (raw as Record<string, unknown>)[lang];
    return typeof v === "string" ? v : "";
  }
  // Plain string: belongs to the default language only.
  if (typeof raw === "string" && lang === defaultLang) return raw;
  return "";
}

/** Build a new I18nValue by updating one language's string. */
export function setLangValue(
  raw: unknown,
  lang: string,
  nextStr: string,
  defaultLang: string
): I18nValue {
  const base: I18nValue = isI18nValue(raw)
    ? (raw as I18nValue)
    : { __i18n: true, [defaultLang]: typeof raw === "string" ? raw : "" };
  return { ...base, [lang]: nextStr };
}

// ---------------------------------------------------------------------------
// Label map
// ---------------------------------------------------------------------------

const LANG_LABELS: Record<string, string> = {
  en: "EN",
  ru: "RU",
  uz: "UZ",
  de: "DE",
  fr: "FR",
  ar: "AR",
  tr: "TR",
  kz: "KZ",
  ja: "JA",
  zh: "ZH",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface LocalizedFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NodeFieldManifest;
}

export function LocalizedField({ nodeId, data, field }: LocalizedFieldProps) {
  const languages = useFlowStore((s) => s.languages);
  const defaultLanguage = useFlowStore((s) => s.defaultLanguage);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  const fieldKey = field.key || "messageText";
  const rawValue = data[fieldKey];

  // Active language tab — start on defaultLanguage.
  const [activeLang, setActiveLang] = useState<string>(
    defaultLanguage || languages[0] || "en"
  );

  // Guard: single-language mode → plain widget, no tabs, no markers.
  if (languages.length <= 1) {
    return (
      <RichTextMessageField
        nodeId={nodeId}
        data={data}
        textKey={fieldKey}
        label={field.label || ""}
        helpText={field.helpText}
        intro={field.intro}
        showParseMode={false}
      />
    );
  }

  // Resolve the string value for the currently active language tab.
  const currentValue = getLangValue(rawValue, activeLang, defaultLanguage);

  // Fake data slice: the inner widget only sees a plain string for textKey.
  const slottedData: Record<string, unknown> = { ...data, [fieldKey]: currentValue };

  // Override onChange to write back the full i18n marker object.
  const handleChange = (nextStr: string) => {
    const nextMarker = setLangValue(rawValue, activeLang, nextStr, defaultLanguage);
    updateNodeData(nodeId, { [fieldKey]: nextMarker });
  };

  // Sort tabs: defaultLanguage always first.
  const sortedLangs = [
    defaultLanguage,
    ...languages.filter((l) => l !== defaultLanguage),
  ];

  return (
    <div className="space-y-2">
      {/* Language tab strip */}
      <div className="flex flex-wrap gap-1">
        {sortedLangs.map((lang) => {
          const hasContent =
            getLangValue(rawValue, lang, defaultLanguage).trim() !== "";
          const isActive = activeLang === lang;

          return (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : [
                      "border text-muted-foreground hover:text-foreground",
                      hasContent
                        ? "border-primary/40 text-foreground/70"
                        : "border-border",
                    ]
              )}
            >
              {LANG_LABELS[lang] || lang.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/*
        key={activeLang} forces TelegramRichTextEditor to remount on tab switch
        so it picks up the new defaultValue for the selected language.
      */}
      <RichTextMessageField
        key={activeLang}
        nodeId={nodeId}
        data={slottedData}
        textKey={fieldKey}
        label={field.label || ""}
        helpText={field.helpText}
        intro={field.intro}
        showParseMode={false}
        onChange={handleChange}
      />
    </div>
  );
}
