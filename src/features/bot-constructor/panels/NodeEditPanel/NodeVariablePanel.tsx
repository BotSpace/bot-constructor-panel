"use client";

import { Button } from "@/components/ui/button";
import { useDebugContextStore } from "@/components/layout/debug-console/debug-context-store";
import { GLOBAL_CONTEXT_VARIABLE_GROUPS } from "@/features/bot-constructor/lib/global-context-variables";
import { useVariableInsertion } from "@/features/bot-constructor/panels/NodeEditPanel/variable-insertion";
import { cn } from "@/lib/utils";
import { Braces, ChevronLeft, Clock3, Globe, GripVertical, X } from "lucide-react";
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
  const { insertVariable } = useVariableInsertion();
  const t = useTranslations("variablePanel");
  const nodeSnapshot = useDebugContextStore((state) => state.nodeSnapshots.get(nodeId));
  const snapshots = useDebugContextStore((state) => state.snapshots);
  const [contextOpen, setContextOpen] = useState(false);

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
    <>
      {contextOpen && (
        <aside className="fixed inset-y-0 right-[920px] z-40 hidden w-[360px] flex-col border-l border-r border-white/10 bg-[#0c0c0d] shadow-2xl xl:flex">
          <PanelHeader
            icon={<Globe className="h-4 w-4" />}
            title={t("allContext")}
            subtitle={
              activeContext
                ? `Chat ${activeContext.chatId} · ${new Date(timestampValue(activeContext.ts)).toLocaleTimeString()}`
                : t("latestContext")
            }
            onClose={() => setContextOpen(false)}
          />
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
            {allVariables.length > 0 ? (
              <VariableList entries={allVariables} onInsert={insertVariable} accent="violet" />
            ) : (
              <EmptyState text={t("sendDebug")} />
            )}

            <section>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                {t("autoContext")}
              </p>
              <div className="space-y-4">
                {GLOBAL_CONTEXT_VARIABLE_GROUPS.map((group) => (
                  <div key={group.labelKey}>
                    <p className="mb-1.5 text-[10px] text-zinc-500">{group.labelKey}</p>
                    <VariableList
                      entries={group.variables.map((variable) => [variable.key, variable.descriptionKey])}
                      onInsert={insertVariable}
                      accent="violet"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </aside>
      )}

      <aside className="fixed inset-y-0 right-[560px] z-40 hidden w-[360px] flex-col border-l border-r border-white/10 bg-[#101011] shadow-2xl lg:flex">
        <PanelHeader
          icon={<Braces className="h-4 w-4" />}
          title={t("nodeTitle")}
          subtitle={t("nodeSubtitle")}
          onClose={() => {
            setContextOpen(false);
            onOpenChange(false);
          }}
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
                <VariableList entries={changes} onInsert={insertVariable} />
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
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {t("availableHere")}
            </p>
            {stateKeys.length > 0 ? (
              <VariableList entries={availableVariables} onInsert={insertVariable} />
            ) : (
              <EmptyState text={t("noAvailable")} />
            )}
          </section>
        </div>

        <div className="shrink-0 border-t border-white/10 p-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setContextOpen((value) => !value)}
            className="h-10 w-full justify-between border-white/10 bg-white/[0.03] text-zinc-200 hover:bg-white/[0.07]"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-violet-300" />
              {t("allContext")}
            </span>
            <ChevronLeft className={cn("h-4 w-4 transition-transform", contextOpen && "rotate-180")} />
          </Button>
        </div>
      </aside>
    </>
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

function VariableList({
  entries,
  onInsert,
  accent = "cyan",
}: {
  entries: Array<[string, unknown]>;
  onInsert: (key: string) => void;
  accent?: "cyan" | "violet";
}) {
  const handleDragStart = (event: DragEvent<HTMLButtonElement>, key: string) => {
    const token = `{{${key}}}`;
    event.dataTransfer.setData("text/plain", token);
    event.dataTransfer.setData("application/x-botspace-variable", token);
    event.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="space-y-2">
      {entries.map(([key, value]) => (
        <button
          key={key}
          type="button"
          draggable
          onClick={() => onInsert(key)}
          onDragStart={(event) => handleDragStart(event, key)}
          className={cn(
            "group flex w-full items-start rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition-colors",
            accent === "violet"
              ? "hover:border-violet-400/40 hover:bg-violet-400/10"
              : "hover:border-cyan-300/40 hover:bg-cyan-300/10",
          )}
        >
          <GripVertical className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400" />
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate font-mono text-xs",
                accent === "violet" ? "text-violet-200" : "text-cyan-100",
              )}
            >
              {`{{${key}}}`}
            </span>
            <span
              className="mt-0.5 block line-clamp-3 break-all text-[10px] leading-4 text-zinc-500"
              title={displayValue(value)}
            >
              {displayValue(value)}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
