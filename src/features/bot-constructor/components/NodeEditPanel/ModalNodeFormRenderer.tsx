"use client";

import { useState } from "react";
import { NodeManifest, NodeFieldManifest } from "@/features/bot-constructor/nodes/registry/types";
import { ModalFieldWidget } from "@/features/bot-constructor/components/NodeEditPanel/modal-field-widgets";
import {
  ModalActionPanel,
  ModalHandlersList,
} from "@/features/bot-constructor/components/NodeEditPanel/modal-footer-widgets";
import { NodePanelProvider } from "@/features/bot-constructor/contexts/NodePanelContext";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useTranslations } from "next-intl";
import { ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Clear a field's stored value so a removed optional field stays hidden. */
function clearedFieldData(field: NodeFieldManifest): Record<string, unknown> {
  switch (field.type) {
    case "action-keyboard":
      return { rows: [], keyboard_kind: "inline" };
    case "action-handlers":
      return { handlers: [] };
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

  return true;
}

function fieldKey(field: NodeFieldManifest): string {
  return field.key ?? field.widgetKey ?? field.type;
}

/**
 * True if an optional field already holds a non-default value in the node data.
 * Such fields must stay visible across a page refresh (where the in-memory
 * "added" set resets), otherwise the user's configured values look lost.
 */
function optionalFieldConfigured(
  field: NodeFieldManifest,
  data: Record<string, unknown>
): boolean {
  const arrLen = (v: unknown) => (Array.isArray(v) ? v.length : 0);

  switch (field.type) {
    case "action-keyboard":
      return arrLen(data.rows) > 0;
    case "action-handlers":
      return arrLen(data.handlers) > 0;
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
      if (typeof v === "boolean") return v === true;
      if (typeof v === "string") return v.trim() !== "";
      if (typeof v === "number") return true;
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === "object") return Object.keys(v).length > 0;
      return Boolean(v);
    }
  }
}

function AddOptionButton({
  options,
  onAdd,
}: {
  options: NodeFieldManifest[];
  onAdd: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
      >
        <span>Qo&apos;shimcha maydon qo&apos;shish</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <>
          {/* Outside click overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-white/10 bg-zinc-900 py-1 shadow-xl">
            {options.map((field) => (
              <button
                key={fieldKey(field)}
                type="button"
                className="flex w-full items-center px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
                onClick={() => {
                  onAdd(fieldKey(field));
                  setOpen(false);
                }}
              >
                {field.label ?? field.key ?? field.type}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
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
  const [addedOptionalKeys, setAddedOptionalKeys] = useState<string[]>([]);

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

  // An optional field is shown if the user added it this session OR it already
  // carries a configured value (so it survives a page refresh).
  const isShownOptional = (f: NodeFieldManifest) =>
    f.optional &&
    (addedOptionalKeys.includes(fieldKey(f)) || optionalFieldConfigured(f, data));

  const addedOptionalFields = allFields.filter(isShownOptional);

  const availableOptionalFields = allFields.filter(
    (f) => f.optional && !isShownOptional(f)
  );

  const shownFields = [...requiredFields, ...addedOptionalFields];

  return (
    <NodePanelProvider>
      <div className="mx-auto w-full max-w-[820px] space-y-4 p-4 lg:p-6">
        {shownFields.length ? (
          <div className="space-y-5">
            {shownFields.map((field, index) =>
              field.optional ? (
                <div
                  key={`${manifest.type}-${fieldKey(field)}-${index}`}
                  className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
                >
                  {/* Persistent remove control on the left, separated by a divider */}
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center self-center rounded-md border-r border-white/10 pr-3 text-zinc-500 hover:text-red-400"
                    title="Maydonni olib tashlash"
                    onClick={() => {
                      setAddedOptionalKeys((prev) =>
                        prev.filter((k) => k !== fieldKey(field))
                      );
                      // Also clear its stored value so it doesn't auto-reappear.
                      updateNodeData(nodeId, clearedFieldData(field));
                    }}
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
            onAdd={(key) => setAddedOptionalKeys((prev) => [...prev, key])}
          />
        ) : null}

        {manifest.footer?.length ? (
          <div className="space-y-3 border-t border-white/10 pt-4">
            {manifest.footer.map((footer, index) => {
              if (footer.type === "actionPanel") {
                return (
                  <ModalActionPanel
                    key={`${manifest.type}-action-panel-${index}`}
                    nodeId={nodeId}
                    data={data}
                    hideHandlers={footer.hideHandlers}
                  />
                );
              }

              if (footer.type === "handlersList") {
                return (
                  <ModalHandlersList
                    key={`${manifest.type}-handlers-${index}`}
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
