"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GLOBAL_CONTEXT_VARIABLE_GROUPS } from "@/features/bot-constructor/data/global-context-variables";
import { useVariableInsertion } from "@/features/bot-constructor/components/NodeEditPanel/variable-insertion";
import { cn } from "@/lib/utils";
import { Braces, Globe, GripVertical, MousePointer2 } from "lucide-react";
import { DragEvent } from "react";
import { useTranslations } from "next-intl";

interface NodeVariablePanelProps {
  stateKeys: string[];
}

function t_safe(
  t: ReturnType<typeof useTranslations>,
  key: string,
  fallback: string,
): string {
  try {
    return typeof t.has === "function" && t.has(key) ? (t(key) as string) : fallback;
  } catch {
    return fallback;
  }
}

export function NodeVariablePanel({ stateKeys }: NodeVariablePanelProps) {
  const { insertVariable } = useVariableInsertion();
  const t = useTranslations("variablePanel");

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, key: string) => {
    const token = `{{${key}}}`;

    event.dataTransfer.setData("text/plain", token);
    event.dataTransfer.setData("application/x-botspace-variable", token);
    event.dataTransfer.effectAllowed = "copy";
  };

  const title = t_safe(t, "title", "Available variables");
  const subtitle = t_safe(t, "subtitle", "Click or drag to use");
  const emptyTitle = t_safe(t, "emptyTitle", "No state found");
  const emptyDesc = t_safe(t, "emptyDesc", "StateNode or a trigger with state enabled will appear here.");
  const sectionState = t_safe(t, "sectionState", "Flow state");
  const sectionGlobal = t_safe(t, "sectionGlobal", "Global / auto context");

  return (
    <aside className="hidden min-h-0 flex-col border-t border-white/10 bg-zinc-950/80 lg:flex lg:w-[320px] lg:border-l lg:border-t-0">
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <Braces className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-xs text-zinc-400">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-5">

        {/* ── Flow state section ── */}
        <section>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {sectionState}
          </p>

          {stateKeys.length > 0 ? (
            <div className="space-y-2">
              {stateKeys.map((key) => (
                <VariableButton
                  key={key}
                  varKey={key}
                  description="upstream state"
                  onInsert={insertVariable}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center">
              <MousePointer2 className="mx-auto mb-3 h-5 w-5 text-zinc-500" />
              <p className="text-sm font-medium text-zinc-300">{emptyTitle}</p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">{emptyDesc}</p>
            </div>
          )}
        </section>

        {/* ── Global / auto context section ── */}
        <section>
          <div className="mb-2 flex items-center gap-1.5">
            <Globe className="h-3 w-3 text-violet-400" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              {sectionGlobal}
            </p>
          </div>

          <div className="space-y-3">
            {GLOBAL_CONTEXT_VARIABLE_GROUPS.map((group) => {
              const groupLabel = t_safe(t, `globalVars.${group.labelKey}`, group.labelKey);
              return (
                <div key={group.labelKey}>
                  <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                    {groupLabel}
                  </p>
                  <div className="space-y-1.5">
                    {group.variables.map((variable) => {
                      const desc = t_safe(
                        t,
                        `globalVars.${variable.descriptionKey}`,
                        variable.key,
                      );
                      return (
                        <VariableButton
                          key={variable.key}
                          varKey={variable.key}
                          description={desc}
                          accent="violet"
                          onInsert={insertVariable}
                          onDragStart={handleDragStart}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-white/10 p-4">
        <Badge variant="outline" className="border-white/10 text-[11px] text-zinc-400">
          Format: {`{{variable}}`}
        </Badge>
      </div>
    </aside>
  );
}

/* ── Shared variable button ── */

interface VariableButtonProps {
  varKey: string;
  description: string;
  accent?: "cyan" | "violet";
  onInsert: (key: string) => void;
  onDragStart: (event: DragEvent<HTMLButtonElement>, key: string) => void;
}

function VariableButton({
  varKey,
  description,
  accent = "cyan",
  onInsert,
  onDragStart,
}: VariableButtonProps) {
  const isViolet = accent === "violet";

  return (
    <Button
      type="button"
      variant="ghost"
      draggable
      onClick={() => onInsert(varKey)}
      onDragStart={(event) => onDragStart(event, varKey)}
      className={cn(
        "group h-auto w-full justify-start rounded-xl border border-white/10",
        "bg-white/[0.03] px-3 py-2 text-left",
        isViolet
          ? "hover:border-violet-400/40 hover:bg-violet-400/10"
          : "hover:border-cyan-300/40 hover:bg-cyan-300/10",
      )}
    >
      <GripVertical
        className={cn(
          "mr-2 h-4 w-4 shrink-0 text-zinc-500",
          isViolet ? "group-hover:text-violet-300" : "group-hover:text-cyan-300",
        )}
      />
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate font-mono text-xs",
            isViolet ? "text-violet-200" : "text-cyan-100",
          )}
        >
          {`{{${varKey}}}`}
        </span>
        <span className="block truncate text-[11px] text-zinc-500">{description}</span>
      </span>
    </Button>
  );
}
