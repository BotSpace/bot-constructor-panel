"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useFlowStore } from "@/features/bot-constructor/store";
import { ModalFieldWidget } from "@/features/bot-constructor/panels/NodeEditPanel/modal-field-widgets";
import {
  NodeFieldManifest,
  ArrayEditorItemFieldSpec,
} from "@/features/bot-constructor/manifest/types";
import { Plus, X } from "lucide-react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// Re-export the canonical ItemFieldSpec type so consumers can import it from here
export type { ArrayEditorItemFieldSpec } from "@/features/bot-constructor/manifest/types";

/**
 * @deprecated Use ArrayEditorItemFieldSpec instead.
 * Kept for backward-compat in case any old import uses ItemFieldSpec.
 */
export type ItemFieldSpec = ArrayEditorItemFieldSpec;

export interface ArrayEditorFieldConfig {
  type: "array-editor";
  key: string;
  label?: string;
  addLabel?: string;
  maxItems?: number;
  defaultItem?: Record<string, unknown>;
  itemFields: ArrayEditorItemFieldSpec[];
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
  spec: ArrayEditorItemFieldSpec
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

/** Convert an ArrayEditorItemFieldSpec to a NodeFieldManifest for FieldWidget. */
function specToManifest(spec: ArrayEditorItemFieldSpec): NodeFieldManifest {
  return {
    type: spec.type,
    key: spec.key,
    label: spec.label,
    placeholder: spec.placeholder,
    options: spec.options,
    helpText: spec.helpText,
    rows: spec.rows,
    min: spec.min,
    max: spec.max,
    step: spec.step,
  };
}

// ---------------------------------------------------------------------------
// Per-item row
// ---------------------------------------------------------------------------

interface ItemRowProps {
  index: number;
  item: Record<string, unknown>;
  specs: ArrayEditorItemFieldSpec[];
  nodeId: string;
  onPatch: (partial: Record<string, unknown>) => void;
  onRemove: () => void;
}

function ItemRow({ index, item, specs, nodeId, onPatch, onRemove }: ItemRowProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-start gap-2 px-2 py-2.5">
        {/* Index number */}
        <span
          className="mt-1.5 shrink-0 text-[11px] font-medium text-white/30"
          style={{ minWidth: "1.1rem", textAlign: "right" }}
        >
          {index + 1}
        </span>

        {/* Fields stack */}
        <div className="flex-1 space-y-2 min-w-0">
          {specs.map((spec) => {
            if (!isItemFieldVisible(item, spec)) return null;
            const manifest = specToManifest(spec);
            return (
              <ModalFieldWidget
                key={spec.key}
                nodeId={nodeId}
                data={item}
                field={manifest}
                valueOverride={item[spec.key]}
                onPatch={onPatch}
              />
            );
          })}
        </div>

        {/* Delete button — fades in on row hover */}
        <button
          type="button"
          aria-label="O'chirish"
          className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/30 transition-colors hover:text-red-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
          style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
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

  /** Merge a partial patch into a single item and write the whole array back. */
  const handlePatch = (index: number, partial: Record<string, unknown>) => {
    updateNodeData(nodeId, {
      [field.key]: items.map((item, i) =>
        i === index ? { ...item, ...partial } : item
      ),
    });
  };

  return (
    <div className="space-y-1">
      {/* Header row: label left, count right */}
      <div className="flex items-center justify-between pb-0.5">
        {field.label ? (
          <Label className="text-xs font-medium text-white/70">
            {field.label}
          </Label>
        ) : null}
        <span className="ml-auto text-[10px] text-white/30">
          {items.length}/{maxItems}
        </span>
      </div>

      {/* Items — flat rows inside a single light container */}
      {items.length > 0 ? (
        <div className="rounded-lg border border-white/[0.07] bg-white/[0.02]">
          {items.map((item, index) => (
            <div key={index}>
              <ItemRow
                index={index}
                item={item}
                specs={field.itemFields}
                nodeId={nodeId}
                onPatch={(partial) => handlePatch(index, partial)}
                onRemove={() => handleRemoveItem(index)}
              />
              {/* Thin separator between items; none after the last */}
              {index < items.length - 1 ? (
                <div
                  className="mx-2"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Add button */}
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
