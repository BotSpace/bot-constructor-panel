"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Braces, GripVertical, MousePointer2 } from "lucide-react";
import { DragEvent } from "react";
import { useVariableInsertion } from "@/features/bot-constructor/components/NodeEditPanel/variable-insertion";

interface NodeVariablePanelProps {
  stateKeys: string[];
}

export function NodeVariablePanel({ stateKeys }: NodeVariablePanelProps) {
  const { insertVariable } = useVariableInsertion();

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, key: string) => {
    const token = `{{${key}}}`;

    event.dataTransfer.setData("text/plain", token);
    event.dataTransfer.setData("application/x-botmother-variable", token);
    event.dataTransfer.effectAllowed = "copy";
  };

  return (
    <aside className="flex min-h-0 flex-col border-t border-white/10 bg-zinc-950/80 lg:w-[320px] lg:border-l lg:border-t-0">
      <div className="shrink-0 border-b border-white/10 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            <Braces className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">Available variables</h3>
            <p className="text-xs text-zinc-400">Click yoki drag qilib ishlating</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {stateKeys.length ? (
          <div className="space-y-2">
            {stateKeys.map((key) => (
              <Button
                key={key}
                type="button"
                variant="ghost"
                draggable
                onClick={() => insertVariable(key)}
                onDragStart={(event) => handleDragStart(event, key)}
                className={cn(
                  "group h-auto w-full justify-start rounded-xl border border-white/10",
                  "bg-white/[0.03] px-3 py-2 text-left hover:border-cyan-300/40 hover:bg-cyan-300/10"
                )}
              >
                <GripVertical className="mr-2 h-4 w-4 shrink-0 text-zinc-500 group-hover:text-cyan-300" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-xs text-cyan-100">
                    {`{{${key}}}`}
                  </span>
                  <span className="block truncate text-[11px] text-zinc-500">
                    upstream state
                  </span>
                </span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center">
            <MousePointer2 className="mx-auto mb-3 h-5 w-5 text-zinc-500" />
            <p className="text-sm font-medium text-zinc-300">State topilmadi</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Bu node&apos;ga upstream ulangan `StateNode` yoki state yoqilgan trigger
              bo&apos;lsa, tokenlar shu yerda chiqadi.
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-white/10 p-4">
        <Badge variant="outline" className="border-white/10 text-[11px] text-zinc-400">
          Format: {`{{state_key}}`}
        </Badge>
      </div>
    </aside>
  );
}
