"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { getNodeKeyboard } from "@/features/bot-constructor/lib/keyboard-compat";
import { ActionPanel } from "@/features/bot-constructor/nodes/shared/ActionPanel";
import { NodeHeader } from "@/features/bot-constructor/nodes/shared/NodeHeader";
import { HandlersList } from "@/features/bot-constructor/nodes/shared/HandlerBuilder/HandlersList";
import { useTranslations } from "next-intl";
import { NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { resolveNodeIcon } from "@/features/bot-constructor/manifest/iconRegistry";
import { renderHandleFromManifest } from "@/features/bot-constructor/manifest/handlePresetRegistry";
import { FieldWidget, getContentClassName, isFieldVisible } from "@/features/bot-constructor/manifest/fieldWidgetRegistry";
import { NodeManifest } from "@/features/bot-constructor/manifest/types";
import { NODE_COLOR_CLASS_REGISTRY } from "@/features/bot-constructor/manifest/colorRegistry";
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
  // ── SwitchNode height growth ─────────────────────────────────────────────
  // Nodes with dynamic case outputs grow taller as cases are added so the
  // per-case handles spread vertically (topPct) instead of overlapping.
  // React Flow re-measures the DOM height → edges/handles reroute automatically.
  const hasDynamicCases = manifest.handles?.some((h) => h.preset === "switch-case-sources");
  const sw = data as { cases?: unknown[]; default?: boolean };
  const caseHandleCount = hasDynamicCases
    ? (Array.isArray(sw.cases) ? sw.cases.length : 0) + (sw.default ? 1 : 0)
    : 0;
  const isGrownCard = caseHandleCount > 3;

  // ── HandlersList (inline-button) height growth ────────────────────────────
  // HandlersList nodes spread button handles using (N+2) vertical slots.
  // Each slot needs ~34 px (same constant as SwitchNode) so handles never
  // overlap. Compute routable button count from keyboard data directly here;
  // HandlersList deduplicates by label, but raw count is a safe over-estimate
  // for height purposes (node grows slightly more than strictly needed — fine).
  const hasHandlersList = manifest.footer?.some((f) => f.type === "handlersList") ?? false;
  const NON_ROUTABLE_KB = new Set([
    "url", "web_app", "login_url", "switch_inline_query", "switch_inline_query_current_chat",
  ]);
  let handlerButtonCount = 0;
  if (hasHandlersList) {
    // Use the same normalizer HandlersList uses so BOTH keyboard formats
    // (new {rows,keyboard_kind} and legacy {keyboard:{inline,reply}}) are
    // counted — otherwise the count is 0 and the node never grows.
    const normalized = getNodeKeyboard(data);
    const flat = (normalized[normalized.active] as unknown[][]).flat();
    handlerButtonCount = flat.filter((b: unknown) => {
      if (b == null || typeof b !== "object") return false;
      const btn = b as { type?: string; handler?: unknown };
      return btn.handler !== false && !NON_ROUTABLE_KB.has(btn.type ?? "");
    }).length;
  }

  // Combined min-height: SwitchNode wins when grown; HandlersList grows for
  // button handles; otherwise the manifest value is the floor.
  const dynamicMinHeight = isGrownCard
    ? Math.max(manifest.size.minHeight ?? 0, (caseHandleCount + 1) * 34)
    : hasHandlersList && handlerButtonCount > 0
      ? Math.max(manifest.size.minHeight ?? 0, (handlerButtonCount + 2) * 34)
      : manifest.size.minHeight;

  const sizeStyle = {
    width: manifest.size.width,
    minHeight: dynamicMinHeight,
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

  // All other handles rendered at the Card level as usual.
  // When hasHandlersList, source-default is excluded (HandlersList renders it).
  const cardHandles = hasHandlersList
    ? manifest.handles?.filter((h) => h.preset !== "source-default") ?? []
    : (manifest.handles ?? []);

  // NodeHeader handle slot is always empty — HandlersList manages source-handler
  // positioning for handlersList nodes; non-handlersList nodes never used this slot.
  const headerHandleSlot = undefined;

  // Trigger nodes get an asymmetric border-radius so they stand out visually
  // on the canvas: the left side (entry side) is more rounded than the right.
  const isTrigger = manifest.category === "triggers";

  return (
    <Card
      className={cn(
        "shadow-lg transition-shadow",
        selected && "ring-2 ring-primary",
        isTrigger && "rounded-tl-[2.5rem] rounded-bl-[2.5rem] rounded-tr-xl rounded-br-xl",
        // When the card is grown (for many switch cases OR many button
        // handles), vertically center the icon/title/badge instead of
        // pinning them to the top.
        (isGrownCard || (hasHandlersList && handlerButtonCount > 0)) &&
          "flex flex-col justify-center",
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
