"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, X, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { getNodeManifestByType } from "@/features/bot-constructor/manifest/manifestStore";
import type { NodeFieldManifest } from "@/features/bot-constructor/manifest/types";

// Node types that are triggers — they don't send messages so we exclude them.
const TRIGGER_CATEGORIES = new Set(["triggers"]);

// Accessory nodes (AI providers/tools) also don't send messages.
function isExcluded(nodeType: string, currentNodeId: string, nodeId: string): boolean {
  if (nodeId === currentNodeId) return true;
  const manifest = getNodeManifestByType(nodeType);
  if (!manifest) return false;
  if (TRIGGER_CATEGORIES.has(manifest.category)) return true;
  if (manifest.accessory) return true;
  return false;
}

interface NodeSelectFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: NodeFieldManifest;
}

export function NodeSelectField({ nodeId, data, field }: NodeSelectFieldProps) {
  const t = useTranslations("constructor");
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const nodes = useFlowStore((s) => s.nodes);
  const [open, setOpen] = useState(false);

  const fieldKey = field.key ?? "targetNodeId";
  const currentValue = typeof data[fieldKey] === "string" ? (data[fieldKey] as string) : "";

  // Filter out current node, triggers, and accessory nodes.
  const selectableNodes = nodes.filter(
    (n) => !isExcluded(n.type ?? "", nodeId, n.id)
  );

  // Resolve a human-readable title for a node.
  function resolveNodeTitle(nodeType: string | undefined, nodeData: Record<string, unknown>): string {
    if (!nodeType) return "Unknown";
    // Foydalanuvchi o'zgartirgan nom node.data.node_label'da saqlanadi (NodeEditPanel
    // shunga yozadi) — u manifest titledan USTUN.
    if (typeof nodeData.node_label === "string" && nodeData.node_label)
      return nodeData.node_label;
    const manifest = getNodeManifestByType(nodeType);
    if (!manifest) return nodeType;
    // Try i18n key first, fall back to titleFallback
    try {
      const translated = t(manifest.titleKey.replace("constructor.", "") as Parameters<typeof t>[0]);
      if (translated && translated !== manifest.titleKey) return translated;
    } catch {
      // key missing — use fallback
    }
    return manifest.titleFallback ?? nodeType;
  }

  const selectedNode = currentValue ? nodes.find((n) => n.id === currentValue) : undefined;
  const selectedTitle = selectedNode
    ? resolveNodeTitle(selectedNode.type, selectedNode.data as Record<string, unknown>)
    : null;

  const handleSelect = (id: string) => {
    updateNodeData(nodeId, { [fieldKey]: id === currentValue ? "" : id });
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateNodeData(nodeId, { [fieldKey]: "" });
  };

  return (
    <div className="space-y-1.5">
      {field.label && (
        <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Network className="h-3 w-3" />
          {field.label}
          {field.required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-white/10 bg-zinc-950/60 text-sm font-normal"
          >
            {selectedTitle ? (
              <span className="flex min-w-0 items-center gap-2 truncate">
                <span className="truncate">{selectedTitle}</span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {currentValue}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                {field.placeholder ?? "Node tanlang..."}
              </span>
            )}
            <span className="ml-1 flex shrink-0 items-center gap-1">
              {currentValue && (
                <span
                  role="button"
                  tabIndex={0}
                  className="rounded p-0.5 hover:text-foreground"
                  onClick={handleClear}
                  onKeyDown={(e) => e.key === "Enter" && handleClear(e as unknown as React.MouseEvent)}
                >
                  <X className="h-3 w-3" />
                </span>
              )}
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
            </span>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[--radix-popover-trigger-width] p-0"
          align="start"
          sideOffset={4}
        >
          <Command
            filter={(value, search) => {
              // value is the node id; we search both title and id
              const node = nodes.find((n) => n.id === value);
              if (!node) return 0;
              const title = resolveNodeTitle(
                node.type,
                node.data as Record<string, unknown>
              ).toLowerCase();
              const q = search.toLowerCase();
              return title.includes(q) || value.toLowerCase().includes(q) ? 1 : 0;
            }}
          >
            <CommandInput placeholder="Qidirish..." />
            <CommandList>
              <CommandEmpty>Node topilmadi</CommandEmpty>
              <CommandGroup>
                {selectableNodes.map((node) => {
                  const title = resolveNodeTitle(
                    node.type,
                    node.data as Record<string, unknown>
                  );
                  return (
                    <CommandItem
                      key={node.id}
                      value={node.id}
                      onSelect={handleSelect}
                      className="flex items-start gap-2"
                    >
                      <Check
                        className={cn(
                          "mt-0.5 h-3.5 w-3.5 shrink-0",
                          currentValue === node.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium leading-tight">{title}</p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground">
                          {node.id}
                        </p>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
    </div>
  );
}
