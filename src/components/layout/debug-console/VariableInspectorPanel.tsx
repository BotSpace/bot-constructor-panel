"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Braces, Copy, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebugContextStore } from "@/components/layout/debug-console/debug-context-store";

// ── JSON syntax highlighter (lightweight, no extra deps) ─────────────────────
// Converts a pretty-printed JSON string into HTML with <span> tokens.
// Uses CSS variables so it stays theme-consistent.

function highlightJson(raw: string): string {
  // Escape HTML first
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = "json-number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "json-key";
        } else {
          cls = "json-string";
        }
      } else if (/true|false/.test(match)) {
        cls = "json-bool";
      } else if (/null/.test(match)) {
        cls = "json-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

// ── timestamp formatter ───────────────────────────────────────────────────────

function formatTs(ts: number | string | undefined | null): string {
  if (ts === undefined || ts === null || ts === "") return "";
  // number yoki raqam-string → Unix ms deb qabul qilamiz
  const ms =
    typeof ts === "number"
      ? ts
      : /^\d+$/.test(String(ts).trim())
      ? Number(ts)
      : NaN;
  const date = isNaN(ms) ? new Date(ts) : new Date(ms);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── helpers ───────────────────────────────────────────────────────────────────

type ValueKind = "object" | "array" | "string" | "number" | "boolean" | "null" | "undefined";

function getValueKind(v: unknown): ValueKind {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (Array.isArray(v)) return "array";
  if (typeof v === "object") return "object";
  if (typeof v === "number") return "number";
  if (typeof v === "boolean") return "boolean";
  return "string";
}

const KIND_BADGE: Record<ValueKind, { label: string; cls: string }> = {
  object:    { label: "{}",    cls: "text-[color:var(--json-key)]   bg-[color:var(--json-key)]/10" },
  array:     { label: "[]",    cls: "text-[color:var(--json-string)] bg-[color:var(--json-string)]/10" },
  string:    { label: "str",   cls: "text-[color:var(--json-string)] bg-[color:var(--json-string)]/10" },
  number:    { label: "num",   cls: "text-[color:var(--json-number)] bg-[color:var(--json-number)]/10" },
  boolean:   { label: "bool",  cls: "text-[color:var(--json-bool)]   bg-[color:var(--json-bool)]/10" },
  null:      { label: "null",  cls: "text-muted-foreground bg-muted/40" },
  undefined: { label: "undef", cls: "text-muted-foreground bg-muted/40" },
};

function getDisplayName(vars: Record<string, unknown>): string {
  const first = vars["first_name"];
  const last = vars["last_name"];
  if (first || last) return [first, last].filter(Boolean).join(" ");
  if (vars["username"]) return String(vars["username"]);
  return "";
}

function getInitial(name: string, chatId: string): string {
  const src = name || chatId;
  return src.charAt(0).toUpperCase();
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard access may be denied — silently ignore
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      title="Copy value"
      className="shrink-0 p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── JSON value renderer ───────────────────────────────────────────────────────

function JsonValueView({ value }: { value: unknown }) {
  const kind = getValueKind(value);
  const isComplex = kind === "object" || kind === "array";

  const rawText = isComplex
    ? JSON.stringify(value, null, 2)
    : value === null
    ? "null"
    : value === undefined
    ? "undefined"
    : String(value);

  if (isComplex) {
    const html = highlightJson(rawText);
    return (
      <pre
        className="font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto json-highlighted"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const colorCls =
    kind === "number"
      ? "text-[color:var(--json-number)]"
      : kind === "boolean"
      ? "text-[color:var(--json-bool)]"
      : kind === "null" || kind === "undefined"
      ? "text-muted-foreground"
      : "text-[color:var(--json-string)]";

  return (
    <span className={cn("font-mono text-xs break-all select-all", colorCls)}>
      {rawText}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface VariableInspectorPanelProps {
  debugActive: boolean;
}

export function VariableInspectorPanel({ debugActive }: VariableInspectorPanelProps) {
  const { snapshots } = useDebugContextStore();
  const chatIds = useMemo(() => Array.from(snapshots.keys()), [snapshots]);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [keyQuery, setKeyQuery] = useState("");

  // Auto-select first chat
  const effectiveChatId =
    selectedChatId && snapshots.has(selectedChatId)
      ? selectedChatId
      : chatIds[0] ?? null;

  const snapshot = effectiveChatId ? snapshots.get(effectiveChatId) : null;

  const filteredEntries = useMemo(() => {
    if (!snapshot) return [];
    const entries = Object.entries(snapshot.variables);
    if (!keyQuery.trim()) return entries;
    const lower = keyQuery.toLowerCase();
    return entries.filter(([k]) => k.toLowerCase().includes(lower));
  }, [snapshot, keyQuery]);

  // When chat changes, reset key selection
  const handleSelectChat = useCallback(
    (id: string) => {
      if (id !== effectiveChatId) {
        setSelectedChatId(id);
        setSelectedKey(null);
        setKeyQuery("");
      }
    },
    [effectiveChatId]
  );

  // Auto-select first key when snapshot changes and no key selected
  const effectiveKey = useMemo(() => {
    if (selectedKey && snapshot && selectedKey in snapshot.variables) return selectedKey;
    if (filteredEntries.length === 1) return filteredEntries[0][0];
    return selectedKey && filteredEntries.some(([k]) => k === selectedKey)
      ? selectedKey
      : null;
  }, [selectedKey, snapshot, filteredEntries]);

  const selectedValue = effectiveKey && snapshot ? snapshot.variables[effectiveKey] : undefined;
  const selectedKind = getValueKind(selectedValue);

  const copyText = useMemo(() => {
    if (effectiveKey === null || selectedValue === undefined) return "";
    const kind = getValueKind(selectedValue);
    return kind === "object" || kind === "array"
      ? JSON.stringify(selectedValue, null, 2)
      : String(selectedValue ?? "");
  }, [effectiveKey, selectedValue]);

  // ── empty states ─────────────────────────────────────────────────────────

  if (!debugActive && chatIds.length === 0) {
    return (
      <EmptyState
        title="Debug ishga tushirilmagan"
        desc="Debug botni ishga tushiring va bot'ga xabar yuboring — o'zgaruvchilar shu yerda paydo bo'ladi."
      />
    );
  }

  if (chatIds.length === 0) {
    return (
      <EmptyState
        title="Snapshot yo'q"
        desc="Debug bot'ga xabar yuboring — flow context o'zgaruvchilari shu yerda paydo bo'ladi."
      />
    );
  }

  // ── 3-column layout ──────────────────────────────────────────────────────

  return (
    <>
      {/* Theme tokens injected via a style tag so they're in CSS scope.
          We avoid hardcoded hex by picking values that naturally
          contrast on both light and dark via oklch palettes. */}
      <style>{`
        :root {
          --json-key:    oklch(55% 0.18 260);
          --json-string: oklch(52% 0.17 145);
          --json-number: oklch(58% 0.18 40);
          --json-bool:   oklch(55% 0.18 310);
          --json-null:   oklch(55% 0.05 260);
        }
        .dark {
          --json-key:    oklch(72% 0.18 260);
          --json-string: oklch(72% 0.16 145);
          --json-number: oklch(75% 0.17 60);
          --json-bool:   oklch(72% 0.18 310);
          --json-null:   oklch(60% 0.05 260);
        }
        .json-highlighted .json-key    { color: var(--json-key); }
        .json-highlighted .json-string { color: var(--json-string); }
        .json-highlighted .json-number { color: var(--json-number); }
        .json-highlighted .json-bool   { color: var(--json-bool); }
        .json-highlighted .json-null   { color: var(--json-null); }
      `}</style>

      <div className="flex h-full min-h-0 divide-x divide-border">
        {/* ── LEFT: chat list ──────────────────────────────────────── */}
        <div className="w-[200px] shrink-0 flex flex-col min-h-0">
          <div className="px-3 py-2 border-b border-border shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Chatlar
            </span>
          </div>
          <ul className="flex-1 overflow-y-auto py-1">
            {chatIds.map((id) => {
              const snap = snapshots.get(id);
              const name = snap ? getDisplayName(snap.variables) : "";
              const initial = getInitial(name, id);
              const active = id === effectiveChatId;

              return (
                <li key={id}>
                  <button
                    onClick={() => handleSelectChat(id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50",
                      active && "bg-muted"
                    )}
                  >
                    {/* Avatar */}
                    <span
                      className={cn(
                        "shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold select-none",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-foreground leading-tight">
                        {name || "Foydalanuvchi"}
                      </div>
                      <div className="truncate text-[10px] text-muted-foreground leading-tight mt-0.5">
                        {id}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── MIDDLE: variable keys ────────────────────────────────── */}
        <div className="w-[190px] shrink-0 flex flex-col min-h-0">
          <div className="px-2 py-2 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Filter..."
                value={keyQuery}
                onChange={(e) => setKeyQuery(e.target.value)}
                className="w-full pl-6 pr-2 py-1 text-[11px] rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          {!snapshot ? (
            <div className="flex items-center justify-center flex-1 text-xs text-muted-foreground p-3 text-center">
              Chat tanlang
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex items-center justify-center flex-1 text-xs text-muted-foreground p-3 text-center">
              {keyQuery ? "Mos o'zgaruvchi yo'q" : "O'zgaruvchilar yo'q"}
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto py-1">
              {filteredEntries.map(([k, v]) => {
                const kind = getValueKind(v);
                const badge = KIND_BADGE[kind];
                const active = k === effectiveKey;

                return (
                  <li key={k}>
                    <button
                      onClick={() => setSelectedKey(k)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-muted/50 focus:outline-none focus-visible:bg-muted/50",
                        active && "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 text-[9px] font-mono font-semibold px-1 py-0.5 rounded leading-none",
                          badge.cls
                        )}
                      >
                        {badge.label}
                      </span>
                      <span
                        className={cn(
                          "truncate font-mono text-[11px] leading-tight",
                          active ? "text-foreground font-medium" : "text-muted-foreground"
                        )}
                      >
                        {k}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* ── RIGHT: value viewer ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {effectiveKey === null ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-2 text-muted-foreground p-6 text-center">
              <Braces className="w-7 h-7 opacity-30" />
              <p className="text-xs">O'zgaruvchi tanlang</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
                <span
                  className={cn(
                    "shrink-0 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded leading-none",
                    KIND_BADGE[selectedKind].cls
                  )}
                >
                  {KIND_BADGE[selectedKind].label}
                </span>
                <span className="font-mono text-xs text-foreground font-medium truncate flex-1">
                  {effectiveKey}
                </span>
                {snapshot && formatTs(snapshot.ts) && (
                  <span className="shrink-0 text-[10px] text-muted-foreground/60 font-mono">
                    {formatTs(snapshot.ts)}
                  </span>
                )}
                <CopyButton text={copyText} />
              </div>

              {/* Value */}
              <div className="flex-1 overflow-auto p-3">
                <JsonValueView value={selectedValue} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Empty state helper ────────────────────────────────────────────────────────

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-6 text-center">
      <Braces className="w-8 h-8 opacity-40" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs opacity-70 max-w-[260px]">{desc}</p>
    </div>
  );
}
