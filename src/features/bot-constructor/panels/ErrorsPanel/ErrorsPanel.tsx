"use client";

import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDebugErrorsStore,
  FlowError,
  FlowAlertLevel,
} from "@/features/bot-constructor/store/debug-errors";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

// ── Level styling ─────────────────────────────────────────────────────────────

const LEVEL_STYLE: Record<
  FlowAlertLevel,
  { icon: typeof AlertCircle; text: string; chip: string; label: string }
> = {
  error: {
    icon: AlertCircle,
    text: "text-destructive",
    chip: "bg-destructive/15 text-destructive",
    label: "Xato",
  },
  warning: {
    icon: AlertTriangle,
    text: "text-amber-500",
    chip: "bg-amber-500/15 text-amber-500",
    label: "Ogohlantirish",
  },
  info: {
    icon: Info,
    text: "text-sky-500",
    chip: "bg-sky-500/15 text-sky-500",
    label: "Info",
  },
};

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

// ── Single alert row ──────────────────────────────────────────────────────────

function ErrorRow({ error }: { error: FlowError }) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("editor.toolbar");
  const hasDetail = Boolean(error.detail);
  const style = LEVEL_STYLE[error.level] ?? LEVEL_STYLE.error;
  const Icon = style.icon;

  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Level icon */}
        <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", style.text)} />

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
          <p className={cn("text-sm font-medium leading-snug break-words", style.text)}>
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

// ── Filter bar ────────────────────────────────────────────────────────────────

type Filter = "all" | FlowAlertLevel;

function FilterTab({
  active,
  onClick,
  label,
  count,
  className,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <span className={cn(active && className)}>{label}</span>
      <span
        className={cn(
          "rounded px-1 text-[10px] tabular-nums",
          active ? "bg-background/60" : "bg-muted/60"
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ── Main panel content ────────────────────────────────────────────────────────

export function ErrorsPanel() {
  const t = useTranslations("editor.toolbar");
  const { errors, clearErrors } = useDebugErrorsStore();
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c = { all: errors.length, error: 0, warning: 0, info: 0 };
    for (const e of errors) c[e.level] += 1;
    return c;
  }, [errors]);

  const visible = useMemo(
    () => (filter === "all" ? errors : errors.filter((e) => e.level === filter)),
    [errors, filter]
  );

  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-6 text-center">
        <Info className="w-8 h-8 opacity-30" />
        <p className="text-sm font-medium">{t("errorsEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar: level filters + clear */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          <FilterTab
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label="Hammasi"
            count={counts.all}
          />
          <FilterTab
            active={filter === "error"}
            onClick={() => setFilter("error")}
            label="Xato"
            count={counts.error}
            className={LEVEL_STYLE.error.text}
          />
          <FilterTab
            active={filter === "warning"}
            onClick={() => setFilter("warning")}
            label="Ogohlantirish"
            count={counts.warning}
            className={LEVEL_STYLE.warning.text}
          />
          <FilterTab
            active={filter === "info"}
            onClick={() => setFilter("info")}
            label="Info"
            count={counts.info}
            className={LEVEL_STYLE.info.text}
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1 shrink-0"
          onClick={clearErrors}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t("errorsClear")}
        </Button>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {visible.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
            Bu turdagi xabar yo&apos;q
          </div>
        ) : (
          visible.map((error) => <ErrorRow key={error.id} error={error} />)
        )}
      </div>
    </div>
  );
}
