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

// Debug status is surfaced via a `data-debug-status` attribute. The visible
// node border/shadow is controlled by !important rules in globals.css
// (.react-flow__node > *), which override Tailwind ring classes — so the
// status colour must be applied there too (see globals.css).

// ---------------------------------------------------------------------------
// AccessoryNodeCard — circular compact card for AI provider / tool nodes.
// All accessory nodes share the same fixed 96 × 110 footprint so they line up
// uniformly regardless of title length or type (provider vs tool).
// ---------------------------------------------------------------------------

// Fixed dimensions applied to every accessory node so they are all identical.
const ACCESSORY_W = 96;
const ACCESSORY_H = 110;

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
    <div
      className={cn(
        // Fully rounded card — same shape for every accessory node.
        "relative flex flex-col items-center justify-center select-none",
        "rounded-2xl",
        "border border-border/60 bg-card shadow-md",
        "transition-shadow duration-150",
        selected && "ring-2 ring-primary shadow-lg",
      )}
      data-debug-status={debugStatus || undefined}
      style={{ width: ACCESSORY_W, height: ACCESSORY_H }}
    >
      {/* Handles rendered at the node level (React Flow needs them in the DOM) */}
      {manifest.handles?.map((handle, index) =>
        renderHandleFromManifest(handle, id, `${manifest.type}-${index}`, manifest.accessoryPorts)
      )}

      {/* Icon + label body */}
      <div className="flex flex-col items-center gap-1.5 px-2 py-3 w-full">
        {/* Circular icon — the defining visual of an accessory node */}
        <div
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center shadow-sm shrink-0",
            "[&_svg]:w-5 [&_svg]:h-5 [&_svg]:text-white [&_svg]:stroke-[2.5px]",
            colorClass,
          )}
        >
          {typeof icon === "string" ? (
            <span className="text-base">{icon}</span>
          ) : (
            icon
          )}
        </div>

        <span className="text-[10px] font-semibold tracking-wide text-center leading-tight text-foreground/75 w-full line-clamp-2 px-1">
          {title}
        </span>

        {/* Type badge — tool (emerald) vs provider (sky) */}
        {isTool && (
          <Badge className="text-[8px] font-semibold tracking-widest uppercase px-1.5 py-0 h-3.5 pointer-events-none bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
            tool
          </Badge>
        )}
        {isProvider && (
          <Badge className="text-[8px] font-semibold tracking-widest uppercase px-1.5 py-0 h-3.5 pointer-events-none bg-sky-500/15 text-sky-600 border-sky-500/30">
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
        isTrigger && "rounded-tl-3xl rounded-bl-3xl rounded-tr-xl rounded-br-xl",
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
