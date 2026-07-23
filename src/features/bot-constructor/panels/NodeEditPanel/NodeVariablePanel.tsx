"use client";

import { Button } from "@/components/ui/button";
import { useDebugContextStore } from "@/components/layout/debug-console/debug-context-store";
import { GLOBAL_CONTEXT_VARIABLE_GROUPS } from "@/features/bot-constructor/lib/global-context-variables";

import { cn } from "@/lib/utils";
import {
  Braces,
  ChevronDown,

  ChevronRight,
  Clock3,
  Globe,
  GripVertical,
  X,
} from "lucide-react";
import { DragEvent, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

interface NodeVariablePanelProps {
  nodeId: string;
  stateKeys: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function displayValue(value: unknown): string {
  if (value === undefined) return "—";
  if (value === null) return "null";
  if (typeof value === "string") return value === "" ? '""' : value;
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function resolveContextValue(
  variables: Record<string, unknown> | undefined,
  key: string,
): { found: boolean; value?: unknown } {
  if (!variables) return { found: false };
  if (Object.prototype.hasOwnProperty.call(variables, key)) {
    return { found: true, value: variables[key] };
  }

  const path = key.split(".").filter(Boolean);
  if (path.length < 2) return { found: false };

  let current: unknown = variables;
  for (const segment of path) {
    if (current === null || typeof current !== "object") return { found: false };
    const record = current as Record<string, unknown>;
    if (!Object.prototype.hasOwnProperty.call(record, segment)) return { found: false };
    current = record[segment];
  }

  return { found: true, value: current };
}

function timestampValue(value: number | string): number {
  if (typeof value === "number") return value < 10_000_000_000 ? value * 1000 : value;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric < 10_000_000_000 ? numeric * 1000 : numeric;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function NodeVariablePanel({
  nodeId,
  stateKeys,
  open,
  onOpenChange,
}: NodeVariablePanelProps) {
  const t = useTranslations("variablePanel");
  const nodeSnapshot = useDebugContextStore((state) => state.nodeSnapshots.get(nodeId));
  const snapshots = useDebugContextStore((state) => state.snapshots);


  const activeContext = useMemo(() => {
    if (nodeSnapshot) {
      return {
        chatId: nodeSnapshot.chat_id,
        variables: nodeSnapshot.variables,
        ts: nodeSnapshot.ts,
      };
    }
    let latest:
      | { chatId: string; variables: Record<string, unknown>; ts: number | string }
      | undefined;
    for (const [chatId, snapshot] of snapshots) {
      if (!latest || timestampValue(snapshot.ts) > timestampValue(latest.ts)) {
        latest = { chatId, variables: snapshot.variables, ts: snapshot.ts };
      }
    }
    return latest;
  }, [nodeSnapshot, snapshots]);

  if (!open) return null;

  const changes = nodeSnapshot ? Object.entries(nodeSnapshot.changes) : [];
  const allVariables = activeContext ? Object.entries(activeContext.variables) : [];
  const availableVariables = stateKeys.map((key) => {
    const resolved = resolveContextValue(activeContext?.variables, key);
    return [key, resolved.found ? resolved.value : t("valueUnavailable")] as [string, unknown];
  });

  return (
    <aside className="fixed inset-y-0 right-[560px] z-40 hidden w-[400px] flex-col border-l border-r border-white/10 bg-[#101011] shadow-2xl lg:flex">
        <PanelHeader
          icon={<Braces className="h-4 w-4" />}
          title={t("nodeTitle")}
          subtitle={t("nodeSubtitle")}
          onClose={() => onOpenChange(false)}
        />

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {t("latestWrites")}
              </p>
              {nodeSnapshot && (
                <span className="flex items-center gap-1 text-[10px] text-zinc-600">
                  <Clock3 className="h-3 w-3" />
                  run {nodeSnapshot.run_id ?? "—"}
                </span>
              )}
            </div>

            {changes.length > 0 || (nodeSnapshot?.removed.length ?? 0) > 0 ? (
              <div className="space-y-2">
                <VariableList entries={changes} />
                {nodeSnapshot?.removed.map((key) => (
                  <div
                    key={key}
                    className="rounded-xl border border-red-400/15 bg-red-400/[0.05] px-3 py-2"
                  >
                    <p className="font-mono text-xs text-red-300">{key}</p>
                    <p className="text-[10px] text-red-400/60">{t("removed")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                text={
                  nodeSnapshot
                    ? t("noChanges")
                    : t("notRun")
                }
              />
            )}
          </section>

          <section>
            <div className="mb-2 flex items-center gap-2">
              <Globe className="h-4 w-4 text-violet-300" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  {t("allContext")}
                </p>
                <p className="truncate text-[10px] text-zinc-600">
                  {activeContext
                    ? `Chat ${activeContext.chatId} · ${new Date(timestampValue(activeContext.ts)).toLocaleTimeString()}`
                    : t("latestContext")}
                </p>
              </div>
            </div>
            {allVariables.length > 0 ? (
              <div className="space-y-2">
                <VariableList entries={allVariables} accent="violet" />
              </div>
            ) : (
              <EmptyState text={t("sendDebug")} />
            )}

            <div className="mt-4 space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                {t("autoContext")}
              </p>
              {GLOBAL_CONTEXT_VARIABLE_GROUPS.map((group) => (
                <div key={group.labelKey}>
                  <p className="mb-1.5 text-[10px] text-zinc-500">{group.labelKey}</p>
                  <VariableList
                    entries={group.variables.map((variable) => [variable.key, variable.descriptionKey])}
                    accent="violet"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
  );
}

function PanelHeader({
  icon,
  title,
  subtitle,
  onClose,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex h-[73px] shrink-0 items-center gap-3 border-b border-white/10 px-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="truncate text-[11px] text-zinc-500">{subtitle}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 text-zinc-500 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-5 text-center text-xs leading-5 text-zinc-500">
      {text}
    </div>
  );
}

type SchemaKind = "object" | "array" | "string" | "number" | "boolean" | "null";

interface InspectedValue {
  value: unknown;
  kind: SchemaKind;
  parsedJson: boolean;
}

function inspectValue(value: unknown): InspectedValue {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (parsed !== null && typeof parsed === "object") {
          return {
            value: parsed,
            kind: Array.isArray(parsed) ? "array" : "object",
            parsedJson: true,
          };
        }
      } catch {
        // Oddiy string sifatida ko'rsatamiz.
      }
    }
    return { value, kind: "string", parsedJson: false };
  }
  if (value === null || value === undefined) {
    return { value, kind: "null", parsedJson: false };
  }
  if (Array.isArray(value)) return { value, kind: "array", parsedJson: false };
  if (typeof value === "object") return { value, kind: "object", parsedJson: false };
  if (typeof value === "number") return { value, kind: "number", parsedJson: false };
  if (typeof value === "boolean") return { value, kind: "boolean", parsedJson: false };
  return { value: String(value), kind: "string", parsedJson: false };
}

const SCHEMA_KIND_CLASS: Record<SchemaKind, string> = {
  object: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  array: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  string: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  number: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  boolean: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300",
  null: "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
};

function valueCount(inspected: InspectedValue): number {
  if (inspected.kind === "object") {
    return Object.keys(inspected.value as Record<string, unknown>).length;
  }
  if (inspected.kind === "array") {
    return (inspected.value as unknown[]).length;
  }
  return 0;
}

function VariableList({
  entries,
  accent = "cyan",
}: {
  entries: Array<[string, unknown]>;
  accent?: "cyan" | "violet";
}) {
  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <VariableCard key={key} variableKey={key} value={value} accent={accent} />
      ))}
    </div>
  );
}

function setVariableDragData<T extends HTMLElement>(event: DragEvent<T>, variablePath: string) {
  const token = `{{${variablePath}}}`;
  event.dataTransfer.setData("text/plain", token);
  event.dataTransfer.setData("application/x-botspace-variable", token);
  event.dataTransfer.effectAllowed = "copy";
}

function VariableCard({
  variableKey,
  value,
  accent,
}: {
  variableKey: string;
  value: unknown;
  accent: "cyan" | "violet";
}) {
  const t = useTranslations("variablePanel");
  const [expanded, setExpanded] = useState(false);
  const inspected = useMemo(() => inspectValue(value), [value]);
  const complex = inspected.kind === "object" || inspected.kind === "array";
  const longString = inspected.kind === "string" && String(inspected.value).length > 100;
  const expandable = complex || longString;
  const token = `{{${variableKey}}}`;
  const summary = complex
    ? t(inspected.kind === "object" ? "fieldCount" : "itemCount", {
        count: valueCount(inspected),
      })
    : displayValue(inspected.value);

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    setVariableDragData(event, variableKey);
  };

  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors",
        accent === "violet"
          ? "hover:border-violet-400/40"
          : "hover:border-cyan-300/40",
      )}
    >
      <div className="flex items-start gap-2 px-2.5 py-2.5">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-zinc-600 group-hover:text-zinc-400" />

        <div
          draggable
          onDragStart={handleDragStart}
          className="min-w-0 flex-1 cursor-grab text-left active:cursor-grabbing"
          title={t("dragVariable", { variable: token })}
        >
          <span
            className={cn(
              "block truncate font-mono text-xs font-medium",
              accent === "violet" ? "text-violet-200" : "text-cyan-100",
            )}
          >
            {token}
          </span>
          <span className="mt-1 flex min-w-0 items-center gap-1.5">
            <SchemaKindBadge kind={inspected.kind} parsedJson={inspected.parsedJson} />
            <span
              className="min-w-0 truncate text-[10px] leading-4 text-zinc-500"
              title={displayValue(value)}
            >
              {summary}
            </span>
          </span>
        </div>

        {expandable && (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200"
            title={expanded ? t("collapseValue") : t("expandValue")}
            aria-expanded={expanded}
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>

      {expanded && (
        <div className="border-t border-white/10 bg-black/20 px-3 py-2.5">
          {complex ? (
            <SchemaTree value={inspected.value} path={variableKey} />
          ) : (
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-emerald-200/80">
              {String(inspected.value)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function SchemaKindBadge({ kind, parsedJson }: { kind: SchemaKind; parsedJson?: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase leading-none",
        SCHEMA_KIND_CLASS[kind],
      )}
    >
      {parsedJson ? "json" : kind}
    </span>
  );
}

function SchemaTree({ value, path }: { value: unknown; path: string }) {
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as [string, unknown])
    : Object.entries((value as Record<string, unknown>) ?? {});

  if (entries.length === 0) {
    return <span className="font-mono text-[11px] text-zinc-600">{Array.isArray(value) ? "[]" : "{}"}</span>;
  }

  return (
    <div className="space-y-0.5 font-mono">
      {entries.map(([key, child]) => {
        const childPath = `${path}.${key}`;
        return (
          <SchemaTreeRow
            key={key}
            name={key}
            path={childPath}
            value={child}
          />
        );
      })}
    </div>
  );
}

function SchemaTreeRow({
  name,
  path,
  value,
}: {
  name: string;
  path: string;
  value: unknown;
}) {
  const t = useTranslations("variablePanel");
  const [open, setOpen] = useState(false);
  const inspected = useMemo(() => inspectValue(value), [value]);
  const complex = inspected.kind === "object" || inspected.kind === "array";
  const summary = complex
    ? t(inspected.kind === "object" ? "fieldCount" : "itemCount", {
        count: valueCount(inspected),
      })
    : displayValue(inspected.value);

  const token = `{{${path}}}`;

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setVariableDragData(event, path);
  };

  return (
    <div>
      <div className="flex min-h-7 items-center gap-1 rounded-md px-1 py-1 hover:bg-white/[0.04]">
        {complex ? (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-zinc-600 hover:bg-white/10 hover:text-zinc-300"
            aria-expanded={open}
          >
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" />
        )}
        <div
          draggable
          onDragStart={handleDragStart}
          className="flex min-w-0 flex-1 cursor-grab items-center gap-1.5 rounded px-1 text-left active:cursor-grabbing"
          title={t("dragVariable", { variable: token })}
        >
          <GripVertical className="h-3.5 w-3.5 shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-500" />
          <span className="min-w-0 truncate text-[11px] text-sky-200">{name}</span>
          <span className="text-zinc-700">:</span>
          <SchemaKindBadge kind={inspected.kind} parsedJson={inspected.parsedJson} />
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[10px]",
              inspected.kind === "string" && "text-emerald-300/75",
              inspected.kind === "number" && "text-amber-300/75",
              inspected.kind === "boolean" && "text-fuchsia-300/75",
              inspected.kind === "null" && "text-zinc-600",
              complex && "text-zinc-500",
            )}
            title={displayValue(value)}
          >
            {summary}
          </span>
        </div>
      </div>
      {complex && open && (
        <div className="ml-3 border-l border-white/10 pl-2">
          <SchemaTree value={inspected.value} path={path} />
        </div>
      )}
    </div>
  );
}
