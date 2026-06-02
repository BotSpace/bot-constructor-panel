"use client";

import { useState } from "react";
import { NodeManifest, NodeFieldManifest } from "@/features/bot-constructor/nodes/registry/types";
import { ModalFieldWidget } from "@/features/bot-constructor/components/NodeEditPanel/modal-field-widgets";
import {
  ModalActionPanel,
  ModalHandlersList,
} from "@/features/bot-constructor/components/NodeEditPanel/modal-footer-widgets";
import { NodePanelProvider } from "@/features/bot-constructor/contexts/NodePanelContext";
import { useTranslations } from "next-intl";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const addedOptionalFields = allFields.filter(
    (f) => f.optional && addedOptionalKeys.includes(fieldKey(f))
  );

  const availableOptionalFields = allFields.filter(
    (f) => f.optional && !addedOptionalKeys.includes(fieldKey(f))
  );

  const shownFields = [...requiredFields, ...addedOptionalFields];

  return (
    <NodePanelProvider>
      <div className="mx-auto w-full max-w-[820px] space-y-4 p-4 lg:p-6">
        {shownFields.length ? (
          <div className="space-y-5">
            {shownFields.map((field, index) => (
              <div
                key={`${manifest.type}-${fieldKey(field)}-${index}`}
                className="group relative"
              >
                <ModalFieldWidget nodeId={nodeId} data={data} field={field} />
                {field.optional ? (
                  <button
                    type="button"
                    className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white group-hover:flex"
                    onClick={() =>
                      setAddedOptionalKeys((prev) =>
                        prev.filter((k) => k !== fieldKey(field))
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                ) : null}
              </div>
            ))}
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
