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

/**
 * Coerce a possibly-localized value to a plain display string. Use at ANY
 * read-only render site (canvas previews, button labels, selects) where the
 * value may be an i18n marker object — rendering the object directly crashes
 * React (#31). Prefers `preferLang`, then any non-empty language value.
 */
export function localizedToString(raw: unknown, preferLang?: string): string {
  if (typeof raw === "string") return raw;
  if (isI18nValue(raw)) {
    const m = raw as Record<string, unknown>;
    if (preferLang && typeof m[preferLang] === "string") return m[preferLang] as string;
    for (const [k, v] of Object.entries(m)) {
      if (k !== "__i18n" && typeof v === "string" && v) return v;
    }
  }
  return "";
}

/**
 * Deterministic canonical string for an i18n value — used to build stable
 * handle IDs (`target-handler-<nodeId>-<canonical>`) that must match the
 * engine's routing logic regardless of JS object key order.
 *
 * Rules (must mirror the Go engine):
 *   1. plain string  → that string unchanged.
 *   2. i18n marker   → marker[defaultLang] if non-empty;
 *                      else first non-empty value from `languages` in order;
 *                      else "".
 *   3. anything else → "".
 *
 * Compatibility: canonicalLocalized("Salom", "en", ["en"]) === "Salom"
 *   so legacy plain-string handle IDs are preserved.
 */
export function canonicalLocalized(
  value: unknown,
  defaultLang: string,
  languages: string[]
): string {
  if (typeof value === "string") return value;
  if (isI18nValue(value)) {
    const m = value as Record<string, unknown>;
    // a. prefer defaultLanguage
    const defVal = m[defaultLang];
    if (typeof defVal === "string" && defVal) return defVal;
    // b. iterate languages in declaration order
    for (const lang of languages) {
      const v = m[lang];
      if (typeof v === "string" && v) return v;
    }
  }
  return "";
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
