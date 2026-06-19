"use client";

import React, { useMemo, useState } from "react";
import { Braces, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebugContextStore } from "./debug-context-store";

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a single variable value for readable display.
 * Objects / arrays → pretty-printed JSON; primitives → plain string.
 */
export function formatVariableValue(v: unknown): { text: string; isComplex: boolean } {
  if (v === null) return { text: "null", isComplex: false };
  if (v === undefined) return { text: "undefined", isComplex: false };
  if (typeof v === "object" || Array.isArray(v)) {
    return { text: JSON.stringify(v, null, 2), isComplex: true };
  }
  return { text: String(v), isComplex: false };
}

// ── sub-components ────────────────────────────────────────────────────────────

interface VariableRowProps {
  varKey: string;
  value: unknown;
}

function VariableRow({ varKey, value }: VariableRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { text, isComplex } = formatVariableValue(value);

  const isLong = text.length > 120;
  const shouldCollapse = isComplex || isLong;
  const displayText = shouldCollapse && !expanded ? text.slice(0, 120) + "…" : text;

  return (
    <div className="border-b border-border/50 py-2 px-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-2">
        <span className="font-mono text-xs text-muted-foreground shrink-0 mt-0.5 select-all">
          {varKey}
        </span>
        <span className="text-muted-foreground/60 shrink-0 mt-0.5">:</span>
        <div className="flex-1 min-w-0">
          {isComplex ? (
            <pre
              className={cn(
                "font-mono text-xs text-foreground whitespace-pre-wrap break-all leading-relaxed",
                !expanded && "max-h-[4.5rem] overflow-hidden"
              )}
            >
              {displayText}
            </pre>
          ) : (
            <span className="font-mono text-xs text-foreground break-all select-all">
              {displayText}
            </span>
          )}
          {shouldCollapse && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs text-primary hover:underline focus:outline-none"
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface VariableInspectorPanelProps {
  /** Pass project debug status so we know if debug is active */
  debugActive: boolean;
}

export function VariableInspectorPanel({ debugActive }: VariableInspectorPanelProps) {
  const { snapshots } = useDebugContextStore();
  const chatIds = useMemo(() => Array.from(snapshots.keys()), [snapshots]);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Auto-select first chat when snapshots appear
  const effectiveChatId =
    selectedChatId && snapshots.has(selectedChatId)
      ? selectedChatId
      : chatIds[0] ?? null;

  const snapshot = effectiveChatId ? snapshots.get(effectiveChatId) : null;

  const filteredEntries = useMemo(() => {
    if (!snapshot) return [];
    const entries = Object.entries(snapshot.variables);
    if (!query.trim()) return entries;
    const lower = query.toLowerCase();
    return entries.filter(([k]) => k.toLowerCase().includes(lower));
  }, [snapshot, query]);

  // ── empty states ──────────────────────────────────────────────────────────

  if (!debugActive) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-6 text-center">
        <Braces className="w-8 h-8 opacity-40" />
        <p className="text-sm">Debug is not active.</p>
        <p className="text-xs opacity-70">Start the debug bot and send a message to collect variables.</p>
      </div>
    );
  }

  if (chatIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-6 text-center">
        <Braces className="w-8 h-8 opacity-40" />
        <p className="text-sm">No variable snapshots yet.</p>
        <p className="text-xs opacity-70">Send a message to your debug bot to see flow context variables here.</p>
      </div>
    );
  }

  // ── main view ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* Chat selector — shown only when more than one chat */}
      {chatIds.length > 1 && (
        <div className="border-b border-border px-3 py-2 shrink-0">
          <label className="text-xs text-muted-foreground mb-1 block">Chat</label>
          <select
            value={effectiveChatId ?? ""}
            onChange={(e) => setSelectedChatId(e.target.value)}
            className="w-full text-xs rounded-md border border-border bg-background text-foreground px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {chatIds.map((id) => (
              <option key={id} value={id}>
                chat_id: {id}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Timestamp & chat info bar */}
      {snapshot && (
        <div className="border-b border-border px-3 py-1.5 shrink-0 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {chatIds.length === 1 && (
              <span className="mr-2">chat_id: {effectiveChatId}</span>
            )}
          </span>
          <span className="text-xs text-muted-foreground/60 font-mono">
            {snapshot.ts}
          </span>
        </div>
      )}

      {/* Search */}
      <div className="border-b border-border px-3 py-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter variables…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Variables list */}
      <div className="flex-1 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4">
            {query ? "No variables match the filter." : "No variables in snapshot."}
          </div>
        ) : (
          filteredEntries.map(([k, v]) => (
            <VariableRow key={k} varKey={k} value={v} />
          ))
        )}
      </div>
    </div>
  );
}
