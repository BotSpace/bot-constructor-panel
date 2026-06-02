"use client";

import { useState } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, X } from "lucide-react";
import { CodeEditorDialog } from "@/features/bot-constructor/nodes/custom/CustomCodeNode/components/CodeEditorDialog";

const BOT_GLOBALS = ["message", "user", "state"];

interface OutputItem {
  name: string;
  description?: string;
}

interface CodeEditorFieldDef {
  type: "code-editor";
  key: string;
  outputsKey?: string;
  language?: "javascript" | "python";
  label?: string;
}

interface CodeEditorFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: CodeEditorFieldDef;
}

export function CodeEditorField({ nodeId, data, field }: CodeEditorFieldProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [newOutput, setNewOutput] = useState("");

  const codeValue =
    typeof data[field.key] === "string" ? (data[field.key] as string) : "";

  const outputs: OutputItem[] =
    field.outputsKey && Array.isArray(data[field.outputsKey])
      ? (data[field.outputsKey] as OutputItem[])
      : [];

  const handleCodeChange = (code: string) => {
    updateNodeData(nodeId, { ...data, [field.key]: code });
  };

  const addOutput = () => {
    if (!field.outputsKey) return;
    const name = newOutput.trim();
    if (!name) return;
    if (outputs.some((o) => o.name === name)) {
      setNewOutput("");
      return;
    }
    updateNodeData(nodeId, {
      ...data,
      [field.outputsKey]: [...outputs, { name }],
    });
    setNewOutput("");
  };

  const removeOutput = (name: string) => {
    if (!field.outputsKey) return;
    updateNodeData(nodeId, {
      ...data,
      [field.outputsKey]: outputs.filter((o) => o.name !== name),
    });
  };

  const previewText =
    codeValue.trim()
      ? codeValue.slice(0, 80)
      : field.language === "python"
        ? "# Kod yozilmagan"
        : "// Kod yozilmagan";

  return (
    <div className="grid gap-3">
      {field.label && (
        <Label className="text-xs font-medium">{field.label}</Label>
      )}

      <div className="rounded-md border border-dashed border-white/10 bg-zinc-950/60 p-2">
        <pre className="w-full overflow-hidden truncate text-[10px] opacity-70">
          {previewText}
        </pre>
      </div>

      <CodeEditorDialog
        code={codeValue}
        onChange={handleCodeChange}
        globals={BOT_GLOBALS}
      />

      {field.outputsKey && (
        <div className="grid gap-2">
          <Label className="text-xs">
            Chiqishlar (exit nomlar)
            <span className="ml-1 text-[10px] text-muted-foreground font-normal">
              — kod ichida exit("nom") ishlatilganda shu nom orqali yo&apos;naltirish
            </span>
          </Label>

          <div className="flex flex-wrap gap-1">
            {outputs.map((o) => (
              <span
                key={o.name}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[11px] border border-emerald-500/20 font-mono"
              >
                {o.name}
                <button
                  type="button"
                  onClick={() => removeOutput(o.name)}
                  className="hover:text-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 rounded"
                  aria-label={`${o.name} ni o'chirish`}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
            {outputs.length === 0 && (
              <span className="text-[10px] text-muted-foreground italic">
                Chiqish yo&apos;q — bitta default source handle ishlatiladi
              </span>
            )}
          </div>

          <div className="flex gap-1">
            <Input
              value={newOutput}
              onChange={(e) => setNewOutput(e.target.value)}
              placeholder="masalan: ok, invalid, not_found"
              className="h-8 text-xs border-white/10 bg-zinc-950/60"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addOutput();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addOutput}
              disabled={!newOutput.trim()}
              aria-label="Chiqish qo'shish"
            >
              <PlusIcon className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
