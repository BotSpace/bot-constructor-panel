"use client";

import { NodeManifest, NodeFieldManifest } from "@/features/bot-constructor/nodes/registry/types";
import { ModalFieldWidget } from "@/features/bot-constructor/components/NodeEditPanel/modal-field-widgets";
import {
  ModalActionPanel,
  ModalHandlersList,
} from "@/features/bot-constructor/components/NodeEditPanel/modal-footer-widgets";
import { NodePanelProvider } from "@/features/bot-constructor/contexts/NodePanelContext";
import { useTranslations } from "next-intl";

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

  const fields = (manifest.content || [])
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

  return (
    <NodePanelProvider>
      <div className="mx-auto w-full max-w-[820px] space-y-4 p-4 lg:p-6">
        {fields.length ? (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <ModalFieldWidget
                key={`${manifest.type}-${field.key || field.widgetKey || field.type}-${index}`}
                nodeId={nodeId}
                data={data}
                field={field}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center text-sm text-zinc-500">
            Bu node uchun alohida sozlama maydonlari yo'q.
          </div>
        )}

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
