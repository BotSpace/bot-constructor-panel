"use client";

import { useMemo, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NodeManifest, NodeFieldManifest } from "@/features/bot-constructor/nodes/registry/types";
import { ModalFieldWidget } from "@/features/bot-constructor/components/NodeEditPanel/modal-field-widgets";
import { ModalActionPanel } from "@/features/bot-constructor/components/NodeEditPanel/modal-footer-widgets";
import { NodePanelProvider } from "@/features/bot-constructor/contexts/NodePanelContext";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useTranslations } from "next-intl";
import { ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Clear a field's stored value so a removed optional field stays hidden. */
function clearedFieldData(field: NodeFieldManifest): Record<string, unknown> {
  // The keyboard type selector (keyboard_kind) and its button rows are one
  // logical keyboard, but they are split into two independently removable
  // optional fields. Removing only the type selector would leave orphaned
  // `rows`, which getNodeKeyboard() then silently reinterprets as an INLINE
  // keyboard (kind !== "reply" → inline) — turning a saved reply keyboard into
  // an inline one. Clearing both keeps the keyboard consistent.
  if (field.key === "keyboard_kind") {
    return { keyboard_kind: undefined, rows: [] };
  }
  switch (field.type) {
    case "action-keyboard":
      return { rows: [], keyboard_kind: "inline" };
    case "action-recipients":
      return { recipients: { sendToSender: true, additionalIds: [] } };
    default:
      return field.key ? { [field.key]: undefined } : {};
  }
}

interface ModalNodeFormRendererProps {
  nodeId: string;
  data: Record<string, unknown>;
  manifest: NodeManifest;
}

function resolveTranslation(
  t: ReturnType<typeof useTranslations>,
  key: string,
  fallback: string
) {
  return typeof t.has === "function" && t.has(key) ? t(key) : fallback;
}

function isFieldVisible(data: Record<string, unknown>, field: NodeFieldManifest) {
  if (!field.visibleWhen) {
    return true;
  }

  const currentValue = data[field.visibleWhen.key];

  if (Object.prototype.hasOwnProperty.call(field.visibleWhen, "equals")) {
    return currentValue === field.visibleWhen.equals;
  }

  if (Object.prototype.hasOwnProperty.call(field.visibleWhen, "notEquals")) {
    return currentValue !== field.visibleWhen.notEquals;
  }

  if (Array.isArray(field.visibleWhen.oneOf)) {
    return field.visibleWhen.oneOf.includes(currentValue);
  }

  return true;
}

function fieldKey(field: NodeFieldManifest): string {
  return field.key ?? field.widgetKey ?? field.type;
}

/**
 * True if an optional field already holds a non-default value in the node data.
 * Used ONLY for backward-compat: when `activeOptionalFields` is absent we derive
 * the initial active set from value presence so existing flows don't break.
 */
function optionalFieldConfigured(
  field: NodeFieldManifest,
  data: Record<string, unknown>,
  defaultValue?: unknown
): boolean {
  const arrLen = (v: unknown) => (Array.isArray(v) ? v.length : 0);

  switch (field.type) {
    case "action-keyboard":
      return arrLen(data.rows) > 0;
    case "action-recipients": {
      const r = data.recipients as
        | { sendToSender?: boolean; additionalIds?: unknown[] }
        | undefined;
      return arrLen(r?.additionalIds) > 0 || r?.sendToSender === false;
    }
    default: {
      const key = field.key;
      if (!key) return false;
      const v = data[key];
      if (v === undefined || v === null) return false;
      // A value equal to the field's manifest default is NOT a user
      // configuration — keep such fields collapsed (e.g. parseMode === "None").
      if (defaultValue !== undefined && v === defaultValue) return false;
      if (typeof v === "boolean") return v === true;
      if (typeof v === "string") return v.trim() !== "";
      if (typeof v === "number") return true;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "object") return Object.keys(v).length > 0;
      return Boolean(v);
    }
  }
}

/**
 * Derive the initial `activeOptionalFields` from node data for backward-compat.
 * Called when `data.activeOptionalFields` is absent/empty — reads existing field
 * values so previously configured optional fields remain visible on first load.
 */
function deriveActiveOptionalKeys(
  fields: NodeFieldManifest[],
  data: Record<string, unknown>,
  defaults?: Record<string, unknown>
): string[] {
  return fields
    .filter(
      (f) =>
        f.optional &&
        !f.visibleWhen &&
        optionalFieldConfigured(f, data, defaults?.[fieldKey(f)])
    )
    .map(fieldKey);
}

function AddOptionButton({
  options,
  onAdd,
}: {
  options: NodeFieldManifest[];
  onAdd: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);

  // Radix DropdownMenu — Dialog ichida focus-lock, positioning va overflow'ni
  // o'zi to'g'ri boshqaradi (custom portal kerak emas, click bloklanmaydi).
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
        >
          <span>Qo&apos;shimcha maydon qo&apos;shish</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto border-white/10 bg-zinc-900"
      >
        {options.map((field) => (
          <DropdownMenuItem
            key={fieldKey(field)}
            className="text-sm text-zinc-300 focus:bg-white/5 focus:text-white"
            onSelect={() => onAdd(fieldKey(field))}
          >
            {field.label ?? field.key ?? field.type}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ModalNodeFormRenderer({
  nodeId,
  data,
  manifest,
}: ModalNodeFormRendererProps) {
  const t = useTranslations();
  const description = resolveTranslation(
    t,
    manifest.descriptionKey,
    manifest.descriptionFallback
  );

  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // ── activeOptionalFields ─────────────────────────────────────────────────
  // Persistent list of manually activated optional fields, stored inside node
  // data so it survives panel close/reopen without relying on value presence.
  //
  // Backward-compat: when the key is absent (existing flows) we derive the
  // initial list from value presence (same heuristic as before) and persist it
  // once — after that the list is the source of truth.
  const allManifestFields = manifest.content || [];

  const storedActive = useMemo(() => {
    const v = data.activeOptionalFields;
    return Array.isArray(v) ? (v as string[]) : null;
  }, [data.activeOptionalFields]);

  // On first render for nodes that lack activeOptionalFields, derive and persist.
  useEffect(() => {
    if (storedActive !== null) return; // already present — nothing to do
    const derived = deriveActiveOptionalKeys(allManifestFields, data, manifest.defaults);
    // Always write, even if empty — that marks the node as "migrated" so we
    // won't re-derive on the next render (storedActive will be [] not null).
    updateNodeData(nodeId, { activeOptionalFields: derived });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId]); // run once per node (nodeId change = different node)

  // Use storedActive when available, fall back to derived for the current
  // render while the useEffect above hasn't fired yet.
  const activeOptionalKeys: string[] = useMemo(() => {
    if (storedActive !== null) return storedActive;
    return deriveActiveOptionalKeys(allManifestFields, data, manifest.defaults);
  }, [storedActive, allManifestFields, data, manifest.defaults]);

  // ── Field lists ──────────────────────────────────────────────────────────

  const allFields = (manifest.content || [])
    .filter((field) => isFieldVisible(data, field))
    .map((field) => ({
      ...field,
      ...(field.type === "description"
        ? {
            textFallback: field.textKey
              ? resolveTranslation(t, field.textKey, field.textFallback || description)
              : field.textFallback || description,
          }
        : {}),
    }));

  const requiredFields = allFields.filter((f) => !f.optional);

  // Auto-revealed optional fields: optional + visibleWhen — condition-driven,
  // managed automatically. Shown/hidden by isFieldVisible above; no manual add.
  const autoRevealedFields = allFields.filter((f) => f.optional && f.visibleWhen);
  const autoRevealedKeys = new Set(autoRevealedFields.map(fieldKey));

  // Manually activated optional fields (no visibleWhen), in activation order.
  // Source of truth is activeOptionalKeys (stored in node data).
  const manuallyAddedFields = activeOptionalKeys
    .map((key) => allFields.find((f) => fieldKey(f) === key && !f.visibleWhen))
    .filter((f): f is NodeFieldManifest => Boolean(f));

  // Dedupe across auto-revealed + manually added (edge case: field has both).
  const seenOptional = new Set<string>();
  const addedOptionalFields = [...autoRevealedFields, ...manuallyAddedFields].filter((f) => {
    const k = fieldKey(f);
    if (seenOptional.has(k)) return false;
    seenOptional.add(k);
    return true;
  });

  const shownOptionalKeys = new Set(addedOptionalFields.map(fieldKey));

  // Dropdown shows only fields not yet active and not condition-driven.
  const availableOptionalFields = allFields.filter(
    (f) => f.optional && !f.visibleWhen && !shownOptionalKeys.has(fieldKey(f))
  );

  const shownFields = [...requiredFields, ...addedOptionalFields];

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleAddOptional(key: string) {
    const next = [...activeOptionalKeys, key];
    updateNodeData(nodeId, { activeOptionalFields: next });
  }

  function handleRemoveOptional(field: NodeFieldManifest) {
    const key = fieldKey(field);
    const next = activeOptionalKeys.filter((k) => k !== key);
    updateNodeData(nodeId, {
      activeOptionalFields: next,
      ...clearedFieldData(field),
    });
  }

  return (
    <NodePanelProvider>
      <div className="mx-auto w-full max-w-[820px] space-y-4 p-4 lg:p-6">
        {shownFields.length ? (
          <div className="space-y-5">
            {shownFields.map((field, index) =>
              // Auto-revealed (condition-driven) optional fields render like required
              // fields — no manual remove control.
              field.optional && !autoRevealedKeys.has(fieldKey(field)) ? (
                <div
                  key={`${manifest.type}-${fieldKey(field)}-${index}`}
                  className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
                >
                  {/* Persistent remove control on the left, separated by a divider.
                      mt-7 drops it to the input's vertical center (past the
                      text-xs label + space-y-1.5 gap) instead of centering on the
                      whole label+input block. */}
                  <button
                    type="button"
                    className="mt-7 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-r border-white/10 pr-3 text-zinc-500 hover:text-red-400"
                    title="Maydonni olib tashlash"
                    onClick={() => handleRemoveOptional(field)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <ModalFieldWidget nodeId={nodeId} data={data} field={field} />
                  </div>
                </div>
              ) : (
                <div key={`${manifest.type}-${fieldKey(field)}-${index}`}>
                  <ModalFieldWidget nodeId={nodeId} data={data} field={field} />
                </div>
              )
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-zinc-500">
            Bu node uchun alohida sozlama maydonlari yo&apos;q.
          </div>
        )}

        {availableOptionalFields.length > 0 ? (
          <AddOptionButton
            options={availableOptionalFields}
            onAdd={handleAddOptional}
          />
        ) : null}

        {manifest.footer?.some((f) => f.type === "actionPanel") ? (
          <div className="space-y-3 border-t border-white/10 pt-4">
            {manifest.footer.map((footer, index) => {
              if (footer.type === "actionPanel") {
                return (
                  <ModalActionPanel
                    key={`${manifest.type}-action-panel-${index}`}
                    nodeId={nodeId}
                    data={data}
                  />
                );
              }

              return null;
            })}
          </div>
        ) : null}
      </div>
    </NodePanelProvider>
  );
}
