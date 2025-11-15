"use client";

export function toKey(val: any, fallback: string) {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (typeof val === "object") {
    if (typeof (val as any).toString === "function") {
      const s = (val as any).toString();
      if (s && s !== "[object Object]") return s;
    }
    try {
      return JSON.stringify(val);
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
}
