"use client";

import React, { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebugErrorsStore, FlowError } from "@/features/bot-constructor/store/debug-errors";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

// ── timestamp formatter ───────────────────────────────────────────────────────

function formatTs(ts: number | string | undefined | null): string {
  if (ts === undefined || ts === null || ts === "") return "";
  const ms =
    typeof ts === "number"
      ? ts
      : /^\d+$/.test(String(ts).trim())
      ? Number(ts)
      : NaN;
  const date = isNaN(ms) ? new Date(ts as string) : new Date(ms);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ── Single error row ──────────────────────────────────────────────────────────

function ErrorRow({ error }: { error: FlowError }) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("editor.toolbar");
  const hasDetail = Boolean(error.detail);

  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Icon */}
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Node label + time */}
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            {(error.node_type || error.node_id) && (
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                {error.node_type ?? error.node_id}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">
              {formatTs(error.ts)}
            </span>
          </div>

          {/* Message */}
          <p className="text-sm text-destructive font-medium leading-snug break-words">
            {error.message}
          </p>

          {/* Expandable detail */}
          {hasDetail && (
            <div className="mt-1.5">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus-visible:underline"
              >
                {expanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                {t("errorsDetail")}
              </button>
              {expanded && (
                <pre className="mt-1.5 text-[11px] font-mono leading-relaxed whitespace-pre-wrap break-all bg-muted/50 rounded-md p-2 text-muted-foreground overflow-x-auto max-h-[160px]">
                  {error.detail}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main panel content ────────────────────────────────────────────────────────

export function ErrorsPanel() {
  const t = useTranslations("editor.toolbar");
  const { errors, clearErrors } = useDebugErrorsStore();

  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-6 text-center">
        <AlertTriangle className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium">{t("errorsEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
        <span className="text-xs text-muted-foreground">
          {errors.length} {errors.length === 1 ? "xato" : "xato"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1"
          onClick={clearErrors}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t("errorsClear")}
        </Button>
      </div>

      {/* Error list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {errors.map((error) => (
          <ErrorRow key={error.id} error={error} />
        ))}
      </div>
    </div>
  );
}
