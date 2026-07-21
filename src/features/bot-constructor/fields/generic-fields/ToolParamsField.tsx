"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldHelp } from "@/features/bot-constructor/components/FieldHelp";
import { useFlowStore } from "@/features/bot-constructor/store";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

// Visual builder for an AI tool's input schema (JSON Schema object). Lets the
// builder declare the parameters the LLM must pass — name / type / description /
// required — WITHOUT writing raw JSON. Persists as a standard JSON Schema under
// `field.key` (default "parametersSchema"), which the engine forwards to the LLM
// as the tool's function parameters.

const PARAM_TYPES = ["string", "number", "boolean", "object", "array"] as const;

interface ParamRow {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface ToolParamsFieldConfig {
  type: "tool-params";
  key?: string; // default "parametersSchema"
  label?: string;
  /** Helper text under the label. Default is AI-tool wording; override for other nodes. */
  hint?: string;
  /** Shown when there are no params. Default is AI-tool wording. */
  emptyHint?: string;
  /** Placeholder for each param's description input. */
  descriptionPlaceholder?: string;
}

export interface ToolParamsFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: ToolParamsFieldConfig;
}

// JSON Schema → rows
function parseSchema(schema: unknown): ParamRow[] {
  const s = (schema ?? {}) as Record<string, unknown>;
  const properties = (s.properties ?? {}) as Record<string, Record<string, unknown>>;
  const required = Array.isArray(s.required) ? (s.required as string[]) : [];
  return Object.entries(properties).map(([name, prop]) => ({
    name,
    type: typeof prop?.type === "string" ? (prop.type as string) : "string",
    description: typeof prop?.description === "string" ? (prop.description as string) : "",
    required: required.includes(name),
  }));
}

// rows → JSON Schema
function buildSchema(rows: ParamRow[]): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const row of rows) {
    const name = row.name.trim();
    if (!name) continue;
    const prop: Record<string, unknown> = { type: row.type };
    if (row.description.trim()) prop.description = row.description.trim();
    properties[name] = prop;
    if (row.required) required.push(name);
  }
  const schema: Record<string, unknown> = { type: "object", properties };
  if (required.length) schema.required = required;
  return schema;
}

export function ToolParamsField({ nodeId, data, field }: ToolParamsFieldProps) {
  const key = field.key ?? "parametersSchema";
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Local row state (keeps stable identity while editing a name; the JSON
  // Schema is rebuilt and persisted on every change).
  const [rows, setRows] = useState<ParamRow[]>(() => parseSchema(data[key]));

  const commit = (next: ParamRow[]) => {
    setRows(next);
    updateNodeData(nodeId, { [key]: buildSchema(next) });
  };

  const update = (index: number, patch: Partial<ParamRow>) =>
    commit(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const add = () => commit([...rows, { name: "", type: "string", description: "", required: false }]);
  const remove = (index: number) => commit(rows.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      {field.label ? (
        <div className="flex items-center gap-1.5">
          <Label className="text-sm text-zinc-200">{field.label}</Label>
          <FieldHelp
            text={
              field.hint ??
              "AI toolni chaqirganda beradigan parametrlar. Kodda args.<nom> orqali olasiz."
            }
          />
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-3 text-center text-xs text-zinc-500">
          {field.emptyHint ?? "Parametr yo'q — AI argumentsiz chaqiradi."}
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg border border-white/10 bg-zinc-950/40 p-2"
            >
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-[1fr_120px]">
                <Input
                  value={row.name}
                  onChange={(e) => update(index, { name: e.target.value })}
                  placeholder="nom (masalan: query)"
                  className="h-9 border-white/10 bg-zinc-950/60 font-mono text-sm"
                />
                <Select value={row.type} onValueChange={(v) => update(index, { type: v })}>
                  <SelectTrigger className="h-9 border-white/10 bg-zinc-950/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARAM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={row.description}
                  onChange={(e) => update(index, { description: e.target.value })}
                  placeholder={field.descriptionPlaceholder ?? "izoh (AI uchun) — nima uchun kerak"}
                  className="h-9 border-white/10 bg-zinc-950/60 text-sm sm:col-span-2"
                />
                <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400 sm:col-span-2">
                  <Checkbox
                    checked={row.required}
                    onCheckedChange={(c) => update(index, { required: Boolean(c) })}
                  />
                  Majburiy
                </label>
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className={cn(
                  "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                  "text-zinc-500 hover:text-red-400",
                )}
                title="O'chirish"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={add}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
      >
        <Plus className="h-4 w-4" />
        Parametr qo&apos;shish
      </button>
    </div>
  );
}
