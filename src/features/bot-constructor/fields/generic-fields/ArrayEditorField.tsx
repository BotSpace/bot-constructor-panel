"use client";

import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Plus, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ItemFieldSpec {
  key: string;
  type: "text" | "number" | "select" | "checkbox" | "switch" | "textarea";
  label?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  visibleWhen?: { key: string; equals?: unknown; notEquals?: unknown };
}

export interface ArrayEditorFieldConfig {
  type: "array-editor";
  key: string;
  label?: string;
  addLabel?: string;
  maxItems?: number;
  defaultItem?: Record<string, unknown>;
  itemFields: ItemFieldSpec[];
}

export interface ArrayEditorFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  field: ArrayEditorFieldConfig;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isItemFieldVisible(
  item: Record<string, unknown>,
  spec: ItemFieldSpec
): boolean {
  const rule = spec.visibleWhen;
  if (!rule) return true;

  const current = item[rule.key];

  if (Object.prototype.hasOwnProperty.call(rule, "equals")) {
    return current === rule.equals;
  }
  if (Object.prototype.hasOwnProperty.call(rule, "notEquals")) {
    return current !== rule.notEquals;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Sub-field renderer
// ---------------------------------------------------------------------------

interface ItemFieldProps {
  spec: ItemFieldSpec;
  item: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

function ItemField({ spec, item, onChange }: ItemFieldProps) {
  if (!isItemFieldVisible(item, spec)) return null;

  const rawValue = item[spec.key];

  if (spec.type === "select") {
    const strValue = typeof rawValue === "string" ? rawValue : "";
    return (
      <div className="grid gap-1">
        {spec.label ? (
          <Label className="text-[11px] text-white/50">{spec.label}</Label>
        ) : null}
        <Select value={strValue} onValueChange={(v) => onChange(spec.key, v)}>
          <SelectTrigger className="h-8 border-white/10 bg-zinc-950/60 text-xs">
            <SelectValue placeholder={spec.placeholder ?? "Tanlang"} />
          </SelectTrigger>
          <SelectContent>
            {(spec.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (spec.type === "checkbox") {
    return (
      <Label className="flex cursor-pointer items-center gap-2 text-xs">
        <Checkbox
          checked={Boolean(rawValue)}
          onCheckedChange={(checked) => onChange(spec.key, Boolean(checked))}
        />
        {spec.label ?? spec.key}
      </Label>
    );
  }

  if (spec.type === "switch") {
    return (
      <div className="flex items-center justify-between gap-2">
        {spec.label ? (
          <Label className="text-xs">{spec.label}</Label>
        ) : null}
        <Switch
          checked={Boolean(rawValue)}
          onCheckedChange={(checked) => onChange(spec.key, checked)}
        />
      </div>
    );
  }

  if (spec.type === "textarea") {
    const strValue = typeof rawValue === "string" ? rawValue : "";
    return (
      <div className="grid gap-1">
        {spec.label ? (
          <Label className="text-[11px] text-white/50">{spec.label}</Label>
        ) : null}
        <Textarea
          placeholder={spec.placeholder}
          value={strValue}
          rows={2}
          className="border-white/10 bg-zinc-950/60 text-xs"
          onChange={(e) => onChange(spec.key, e.target.value)}
        />
      </div>
    );
  }

  if (spec.type === "number") {
    const numValue =
      rawValue === undefined || rawValue === null ? "" : String(rawValue);
    return (
      <div className="grid gap-1">
        {spec.label ? (
          <Label className="text-[11px] text-white/50">{spec.label}</Label>
        ) : null}
        <Input
          type="number"
          placeholder={spec.placeholder}
          value={numValue}
          className="h-8 border-white/10 bg-zinc-950/60 text-xs"
          onChange={(e) =>
            onChange(
              spec.key,
              e.target.value === "" ? undefined : Number(e.target.value)
            )
          }
        />
      </div>
    );
  }

  // default: text
  const strValue = typeof rawValue === "string" ? rawValue : "";
  return (
    <div className="grid gap-1">
      {spec.label ? (
        <Label className="text-[11px] text-white/50">{spec.label}</Label>
      ) : null}
      <Input
        type="text"
        placeholder={spec.placeholder}
        value={strValue}
        className="h-8 border-white/10 bg-zinc-950/60 text-xs"
        onChange={(e) => onChange(spec.key, e.target.value)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ArrayEditorField({
  nodeId,
  data,
  field,
}: ArrayEditorFieldProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const maxItems = field.maxItems ?? 20;
  const items: Record<string, unknown>[] = Array.isArray(data[field.key])
    ? (data[field.key] as Record<string, unknown>[])
    : [];

  const handleAddItem = () => {
    if (items.length >= maxItems) return;
    const newItem: Record<string, unknown> = { ...(field.defaultItem ?? {}) };
    updateNodeData(nodeId, { [field.key]: [...items, newItem] });
  };

  const handleRemoveItem = (index: number) => {
    updateNodeData(nodeId, {
      [field.key]: items.filter((_, i) => i !== index),
    });
  };

  const handleFieldChange = (
    index: number,
    subKey: string,
    value: unknown
  ) => {
    updateNodeData(nodeId, {
      [field.key]: items.map((item, i) =>
        i === index ? { ...item, [subKey]: value } : item
      ),
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
      {field.label ? (
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-white/70">
            {field.label}
          </Label>
          <span className="text-[10px] text-white/30">
            {items.length}/{maxItems}
          </span>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/8 bg-white/[0.02] p-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium text-white/40">
                  #{index + 1}
                </span>
                <button
                  type="button"
                  aria-label="O'chirish"
                  className="flex h-5 w-5 items-center justify-center rounded text-white/30 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                  onClick={() => handleRemoveItem(index)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>

              {field.itemFields.map((spec) => (
                <ItemField
                  key={spec.key}
                  spec={spec}
                  item={item}
                  onChange={(subKey, value) =>
                    handleFieldChange(index, subKey, value)
                  }
                />
              ))}
            </div>
          ))}
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={items.length >= maxItems}
        className="w-full border-white/10 bg-transparent text-xs text-white/50 hover:bg-white/5 hover:text-white/80 disabled:opacity-30"
        onClick={handleAddItem}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        {field.addLabel ?? "Qo'shish"}
      </Button>
    </div>
  );
}
