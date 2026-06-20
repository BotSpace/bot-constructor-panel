"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { ActionPanel } from "@/features/bot-constructor/nodes/components/shared/ActionPanel";
import { NodeHeader } from "@/features/bot-constructor/nodes/actions/shared/NodeHeader";
import { HandlersList } from "@/features/bot-constructor/nodes/actions/shared/HandlerBuilder/HandlersList";
import { useTranslations } from "next-intl";
import { NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { resolveNodeIcon } from "../registry/iconRegistry";
import { renderHandleFromManifest } from "../registry/handlePresetRegistry";
import { FieldWidget, getContentClassName, isFieldVisible } from "../registry/fieldWidgetRegistry";
import { NodeManifest } from "../registry/types";
import { NODE_COLOR_CLASS_REGISTRY } from "../registry/colorRegistry";
import { useDebugStatusStore } from "@/features/bot-constructor/store/debug-status";

// Debug status is surfaced via a `data-debug-status` attribute on the wrapper.
// For accessory (circle) nodes the visible status ring is applied to the inner
// `.acc-node-circle` div via CSS rules in globals.css (not to the wrapper, which
// is transparent). Selected ring is also CSS-driven via globals.css.

// ---------------------------------------------------------------------------
// AccessoryNodeCard — n8n-style circle node for AI provider / tool nodes.
// Layout: transparent bounding-box wrapper → circle (icon inside) → title below
// (outside the circle) → badge. Handle connects at the top of the wrapper.
// ---------------------------------------------------------------------------

// Circle diameter. Both provider and tool nodes share the same size.
const CIRCLE_SIZE = 76;

// Extra space below the circle for the title (2 lines) + badge.
// title: 2 × 13px line-height ≈ 28px, gap 6px, badge 16px, gap 4px + padding 8px
const LABEL_AREA_H = 64;

// Total bounding-box dimensions fed to React Flow.
const ACCESSORY_W = CIRCLE_SIZE + 24; // 24px horizontal padding keeps the circle centred with room for the handle overhang
const ACCESSORY_H = CIRCLE_SIZE + LABEL_AREA_H;

interface AccessoryNodeCardProps {
  id: string;
  manifest: NodeManifest;
  selected: boolean | undefined;
  title: string;
  description: string;
}

function AccessoryNodeCard({ id, manifest, selected, title }: AccessoryNodeCardProps) {
  const colorClass = NODE_COLOR_CLASS_REGISTRY[manifest.colorToken] || "bg-zinc-600";
  const icon = resolveNodeIcon(manifest.iconName);
  const debugStatus = useDebugStatusStore((s) => s.statuses[id]);

  const isTool = manifest.accessoryAttachesTo?.includes("ai_tool");
  const isProvider = manifest.accessoryAttachesTo?.includes("ai_model");

  return (
    // Outer wrapper: transparent bounding box. React Flow measures this for
    // canvas layout. Handles are positioned relative to this element.
    // .acc-node-wrapper class + data-debug-status/data-accessory-selected drive
    // CSS status ring on the inner .acc-node-circle (see globals.css).
    <div
      className="acc-node-wrapper relative flex flex-col items-center select-none"
      data-debug-status={debugStatus || undefined}
      data-accessory-selected={selected || undefined}
      style={{ width: ACCESSORY_W, height: ACCESSORY_H }}
    >
      {/* Handles rendered from manifest — id/preset UNCHANGED so edges survive. */}
      {manifest.handles?.map((handle, index) =>
        renderHandleFromManifest(handle, id, `${manifest.type}-${index}`, manifest.accessoryPorts)
      )}

      {/* Circle — the primary visual. Icon centred inside.
          Status ring + selected ring applied via CSS on .acc-node-circle
          using [data-debug-status] and [data-accessory-selected] on parent. */}
      <div
        className={cn(
          "acc-node-circle",
          "rounded-full flex items-center justify-center shrink-0",
          "border-2 border-white/20",
          "transition-shadow duration-150",
          "[&_svg]:text-white [&_svg]:stroke-[2px]",
          colorClass,
        )}
        style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
      >
        {typeof icon === "string" ? (
          <span style={{ fontSize: 28, lineHeight: 1 }}>{icon}</span>
        ) : (
          <span className="[&_svg]:w-8 [&_svg]:h-8">{icon}</span>
        )}
      </div>

      {/* Label area — sits below the circle, outside it, centred. */}
      <div className="flex flex-col items-center gap-1 pt-1.5 w-full px-1">
        {/* Node name — up to 2 lines */}
        <span className="text-[10px] font-semibold tracking-wide text-center leading-[13px] text-foreground/90 w-full line-clamp-2">
          {title}
        </span>

        {/* Type badge — tool (emerald) vs provider (sky) */}
        {isTool && (
          <Badge className="text-[8px] font-semibold tracking-widest uppercase px-1.5 py-0 h-3.5 pointer-events-none bg-emerald-500/15 text-emerald-600 border-emerald-500/30 shrink-0">
            tool
          </Badge>
        )}
        {isProvider && (
          <Badge className="text-[8px] font-semibold tracking-widest uppercase px-1.5 py-0 h-3.5 pointer-events-none bg-sky-500/15 text-sky-600 border-sky-500/30 shrink-0">
            provider
          </Badge>
        )}
      </div>
    </div>
  );
}

interface GenericNodeRendererProps extends NodeProps {
  manifest: NodeManifest;
}

function resolveTranslation(
  t: ReturnType<typeof useTranslations>,
  key: string,
  fallback: string
) {
  return typeof t.has === "function" && t.has(key) ? t(key) : fallback;
}

function resolveTitle(
  manifest: NodeManifest,
  data: Record<string, unknown>,
  translatedTitle: string
) {
  // User-defined inline label takes priority over everything.
  const customLabel = data.node_label;
  if (typeof customLabel === "string" && customLabel.trim() !== "") {
    return customLabel.trim();
  }

  if (!manifest.titleTemplate) {
    return translatedTitle;
  }

  return manifest.titleTemplate.replace(/\{\{(.*?)\}\}/g, (_, rawKey) => {
    const value = data[rawKey.trim()];
    return value === undefined || value === null || value === ""
      ? "default"
      : String(value);
  });
}

export function GenericNodeRenderer({
  id,
  data,
  selected,
  manifest,
}: GenericNodeRendererProps) {
  const t = useTranslations();
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  const debugStatus = useDebugStatusStore((s) => s.statuses[id]);
  const translatedTitle = resolveTranslation(
    t,
    manifest.titleKey,
    manifest.titleFallback
  );
  const title = resolveTitle(manifest, data as Record<string, unknown>, translatedTitle);
  const description = resolveTranslation(
    t,
    manifest.descriptionKey,
    manifest.descriptionFallback
  );
  const sizeStyle = {
    width: manifest.size.width,
    minHeight: manifest.size.minHeight,
    height: manifest.size.height,
  };

  // Accessory nodes (AI providers, tools) use a compact pill-shaped card
  // distinct from regular flow nodes — inspired by n8n sub-node styling.
  if (manifest.accessory) {
    return (
      <AccessoryNodeCard
        id={id}
        manifest={manifest}
        selected={selected}
        title={title}
        description={description}
      />
    );
  }

  // Nodes that render handler-button rows (handlersList footer) grow the card
  // vertically below the header.  If the main source handle stays at "top: 50%"
  // of the card it drifts down into / on-top-of the button handles.  Fix: move
  // the source-default handle into the NodeHeader slot so React Flow measures it
  // against the header element (whose own top:50% is the correct midpoint).
  const hasHandlersList = manifest.footer?.some((f) => f.type === "handlersList") ?? false;

  // Handles that should be lifted into the NodeHeader slot.
  const headerHandles = hasHandlersList
    ? manifest.handles?.filter((h) => h.preset === "source-default") ?? []
    : [];

  // All other handles rendered at the Card level as usual.
  const cardHandles = hasHandlersList
    ? manifest.handles?.filter((h) => h.preset !== "source-default") ?? []
    : (manifest.handles ?? []);

  // Build the JSX for the header slot (null when not needed).
  const headerHandleSlot =
    headerHandles.length > 0 ? (
      <>
        {headerHandles.map((handle, index) =>
          renderHandleFromManifest(handle, id, `${manifest.type}-header-${index}`, manifest.accessoryPorts)
        )}
      </>
    ) : undefined;

  // Trigger nodes get an asymmetric border-radius so they stand out visually
  // on the canvas: the left side (entry side) is more rounded than the right.
  const isTrigger = manifest.category === "triggers";

  return (
    <Card
      className={cn(
        "shadow-lg transition-shadow",
        selected && "ring-2 ring-primary",
        isTrigger && "rounded-tl-[2.5rem] rounded-bl-[2.5rem] rounded-tr-xl rounded-br-xl",
      )}
      data-debug-status={debugStatus || undefined}
      style={sizeStyle}
    >
      {cardHandles.map((handle, index) =>
        renderHandleFromManifest(handle, id, `${manifest.type}-${index}`, manifest.accessoryPorts)
      )}

      <NodeHeader
        icon={resolveNodeIcon(manifest.iconName)}
        title={title}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        color={NODE_COLOR_CLASS_REGISTRY[manifest.colorToken] || "bg-zinc-600"}
        handleSlot={headerHandleSlot}
        category={manifest.category}
        accessory={manifest.accessory}
        accessoryAttachesTo={manifest.accessoryAttachesTo}
      />

      {!isCollapsed ? (
        <>
          {manifest.content?.length ? (
            <CardContent className={getContentClassName(manifest.content[0].type)}>
              {manifest.content
                .filter((field) => isFieldVisible(data as Record<string, unknown>, field))
                .map((field, index) => (
                  <FieldWidget
                    key={`${manifest.type}-${field.key || field.type}-${index}`}
                    nodeId={id}
                    data={data as Record<string, unknown>}
                    field={{
                      ...field,
                      ...(field.type === "description"
                        ? {
                            textFallback: field.textKey
                              ? resolveTranslation(
                                  t,
                                  field.textKey,
                                  field.textFallback || description
                                )
                              : field.textFallback || description,
                          }
                        : {}),
                    }}
                  />
                ))}
            </CardContent>
          ) : null}

          {manifest.footer?.some((footer) => footer.type === "actionPanel") ? (
            <CardFooter className="flex flex-col gap-2">
              {manifest.footer.map((footer, index) =>
                footer.type === "actionPanel" ? (
                  <ActionPanel
                    key={`${manifest.type}-footer-${index}`}
                    keyboard={data.keyboard}
                    disableNotification={typeof data.disableNotification === "boolean" ? data.disableNotification : undefined}
                    id={id}
                    parseMode={typeof data.parseMode === "string" ? data.parseMode : undefined}
                    protectContent={typeof data.protectContent === "boolean" ? data.protectContent : undefined}
                    recipients={
                      data.recipients ?? {
                        sendToSender: true,
                        additionalIds: [],
                      }
                    }
                  />
                ) : null
              )}
            </CardFooter>
          ) : null}
        </>
      ) : null}

      {manifest.footer?.map((footer, index) =>
        footer.type === "handlersList" ? (
          <HandlersList
            key={`${manifest.type}-handlers-${index}`}
            keyboard={data.keyboard}
            sourceNodeId={id}
          />
        ) : null
      )}
    </Card>
  );
}
