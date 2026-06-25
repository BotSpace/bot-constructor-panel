/**
 * i18n-helpers.ts
 *
 * Pure value helpers for the bot-constructor i18n marker system.
 * Imported by LocalizedField, shared-message-fields, and NestedRowsField
 * to avoid circular dependencies (LocalizedField imports shared-message-fields,
 * so shared-message-fields cannot import LocalizedField).
 *
 * Value contract (agreed with Go engine):
 *   - Single-language project: field value stays a plain string.
 *   - Multi-language project:  field value becomes { __i18n: true, en: "...", uz: "..." }.
 *   - On load: a plain string in multi-lang mode is treated as the defaultLanguage value.
 */

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

export const LANG_LABELS: Record<string, string> = {
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
