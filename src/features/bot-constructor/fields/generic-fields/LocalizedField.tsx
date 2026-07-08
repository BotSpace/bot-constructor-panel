"use client";

/**
 * LocalizedField.tsx
 *
 * Type-aware wrapper that adds per-language tab strip editing to any field
 * whose manifest entry carries `i18n: true`.
 *
 * Supported field types:
 *   richTextMessage → RichTextMessageField (TipTap editor)
 *   text            → HighlightedInput (variable-aware single-line)
 *   textarea        → HighlightedTextarea (variable-aware multi-line)
 *
 * Value contract (agreed with Go engine):
 *   - Single-language project: field value stays a plain string.
 *   - Multi-language project:  field value becomes { __i18n: true, en: "...", uz: "..." }.
 *   - On load: a plain string in multi-lang mode is treated as the defaultLanguage value.
 *
 * I18n value helpers live in ./i18n-helpers.ts to avoid a circular dependency
 * (this file imports shared-message-fields; shared-message-fields also needs helpers).
 */

import { useState } from "react";
// Import helpers for local use AND re-export for backward compat.
import {
  type I18nValue,
  isI18nValue,
  getLangValue,
  setLangValue,
  LANG_LABELS,
} from "./i18n-helpers";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useVarSuggestions } from "@/features/bot-constructor/hooks/useVarSuggestions";
import { NodeFieldManifest } from "@/features/bot-constructor/manifest/types";
import { RichTextMessageField } from "@/features/bot-constructor/fields/shared-message-fields";
import {
  HighlightedInput,
  HighlightedTextarea,
} from "@/features/bot-constructor/components/HighlightedInput";
import { Label } from "@/components/ui/label";
import { FieldHelp } from "@/features/bot-constructor/components/FieldHelp";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Re-export helpers so existing callers that import from this file keep working.
// ---------------------------------------------------------------------------
export type { I18nValue };
export { isI18nValue, getLangValue, setLangValue, LANG_LABELS };

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
  const suggestions = useVarSuggestions(nodeId);

  const fieldKey = field.key || "messageText";
  const rawValue = data[fieldKey];

  // Active language tab — start on defaultLanguage.
  const [activeLang, setActiveLang] = useState<string>(
    defaultLanguage || languages[0] || "en"
  );

  // ---------------------------------------------------------------------------
  // Single-language mode: plain widget, no tabs, no markers.
  // ---------------------------------------------------------------------------
  if (languages.length <= 1) {
    if (field.type === "richTextMessage") {
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

    // text / textarea — render type-appropriate widget, write plain string directly.
    const plainStr = typeof rawValue === "string" ? rawValue : "";
    const handlePlainChange = (next: string) =>
      updateNodeData(nodeId, { [fieldKey]: next });

    return (
      <div className="space-y-1.5">
        {(field.label || field.helpText) ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {field.label ? (
              <Label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {field.label}
              </Label>
            ) : null}
            {field.helpText ? <FieldHelp text={field.helpText} /> : null}
          </div>
        ) : null}
        {field.type === "textarea" ? (
          <HighlightedTextarea
            placeholder={field.placeholder}
            rows={field.rows ?? 3}
            value={plainStr}
            onChange={(e) => handlePlainChange(e.target.value)}
            suggestions={suggestions}
            className="border-white/10 bg-zinc-950/60"
          />
        ) : (
          <HighlightedInput
            type="text"
            placeholder={field.placeholder}
            value={plainStr}
            onChange={(e) => handlePlainChange(e.target.value)}
            suggestions={suggestions}
            className="h-10 border-white/10 bg-zinc-950/60"
          />
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Multi-language mode: tab strip + per-language inner widget.
  // ---------------------------------------------------------------------------

  // Sort tabs: defaultLanguage always first.
  const sortedLangs = [
    defaultLanguage,
    ...languages.filter((l) => l !== defaultLanguage),
  ];

  // Resolve the string value for the currently active language tab.
  const currentValue = getLangValue(rawValue, activeLang, defaultLanguage);

  // Override onChange to write back the full i18n marker object.
  const handleChange = (nextStr: string) => {
    const nextMarker = setLangValue(rawValue, activeLang, nextStr, defaultLanguage);
    updateNodeData(nodeId, { [fieldKey]: nextMarker });
  };

  const tabStrip = (
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
  );

  // richTextMessage: existing path unchanged — slottedData trick for uncontrolled TipTap.
  if (field.type === "richTextMessage") {
    const slottedData: Record<string, unknown> = { ...data, [fieldKey]: currentValue };
    return (
      <div className="space-y-2">
        {tabStrip}
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

  // text / textarea: label → tab strip → controlled input.
  return (
    <div className="space-y-1.5">
      {(field.label || field.helpText) ? (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {field.label ? (
            <Label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {field.label}
            </Label>
          ) : null}
          {field.helpText ? <FieldHelp text={field.helpText} /> : null}
        </div>
      ) : null}
      <div className="space-y-2">
        {tabStrip}
        {field.type === "textarea" ? (
          // key={activeLang} resets internal dropdown state on language switch.
          <HighlightedTextarea
            key={activeLang}
            placeholder={field.placeholder}
            rows={field.rows ?? 3}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            suggestions={suggestions}
            className="border-white/10 bg-zinc-950/60"
          />
        ) : (
          <HighlightedInput
            key={activeLang}
            type="text"
            placeholder={field.placeholder}
            value={currentValue}
            onChange={(e) => handleChange(e.target.value)}
            suggestions={suggestions}
            className="h-10 border-white/10 bg-zinc-950/60"
          />
        )}
      </div>
    </div>
  );
}
