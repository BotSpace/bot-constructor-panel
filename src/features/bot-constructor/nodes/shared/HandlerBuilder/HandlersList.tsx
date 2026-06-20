"use client";

import React, { useCallback, useMemo } from "react";
import { Position } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { Button } from "@/components/ui/button";
import { KeyboardConfig } from "@/features/bot-constructor/panels";
import { PillHandle } from "@/features/bot-constructor/canvas/handles/PillHandle";
import { getNodeKeyboard } from "@/features/bot-constructor/utils/keyboard-compat";

interface HandlersListProps {
  /** Node ID to get handlers from */
  sourceNodeId?: string;

  // Keyboardlarni handler qilish uchun
  keyboard: KeyboardConfig;
}

export function HandlersList({ sourceNodeId, keyboard }: HandlersListProps) {
  const inPanel = useIsInNodePanel();
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

  // Source node ni topish
  const sourceNode = useMemo(() => {
    return nodes.find((n) => n.id === sourceNodeId);
  }, [nodes, sourceNodeId]);

  /**
   * Handle uchun pozitsiyani aniqlash:
   * Agar ulangan target node source node dan chap tarafda bo'lsa → Left
   * Aks holda → Right (default)
   */
  const getHandlePosition = useCallback(
    (handleId: string): Position => {
      if (!sourceNode) return Position.Right;

      // Shu handle dan chiqqan edge ni topamiz
      const edge = edges.find(
        (e) => e.source === sourceNodeId && e.sourceHandle === handleId
      );
      if (!edge) return Position.Right;

      // Target node ni topamiz
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!targetNode) return Position.Right;

      const sourceX = sourceNode.position.x;
      const targetX = targetNode.position.x;

      // Agar target node chap tarafda bo'lsa, handle ham chap tarafga o'tadi
      return targetX < sourceX ? Position.Left : Position.Right;
    },
    [sourceNode, edges, nodes, sourceNodeId]
  );

  return (
    <div className="space-y-2 w-full">
      <div className="space-y-2">
        {(() => {
          const normalized = getNodeKeyboard(sourceNode?.data ?? { keyboard });
          const NON_ROUTABLE = ["url", "web_app", "login_url", "switch_inline_query", "switch_inline_query_current_chat"];
          return (normalized[normalized.active] as any[][])
            .flat()
            .filter((b: any) => b?.handler !== false && !NON_ROUTABLE.includes(b?.type));
        })().length > 0 && (
          <div className="flex flex-col gap-2 mb-3 pb-3 border-b">
            {(() => {
              const seenText = new Set<string>();
              const normalized = getNodeKeyboard(sourceNode?.data ?? { keyboard });
              return (normalized[normalized.active] as any[][])
                .flat()
                // handler switch: false bo'lsa tugma handle sifatida ko'rinmaydi.
                // url, web_app, login_url va switch_inline_* turlari callback emas —
                // ulardan routing edge chiqmasligi kerak, shuning uchun filtrlanadi.
                .filter((button: any) =>
                  button?.handler !== false &&
                  !["url", "web_app", "login_url", "switch_inline_query", "switch_inline_query_current_chat"].includes(button?.type)
                )
                .map((button: any) => {
                  const label: string =
                    button.text ||
                    (button.collectionData?.collection
                      ? button.collectionData.collection
                      : "");
                  const isFirstOccurrence = !seenText.has(label);
                  if (isFirstOccurrence) seenText.add(label);
                  return { button, label, isFirstOccurrence };
                });
            })().map(({ button, label, isFirstOccurrence }: { button: any; label: string; isFirstOccurrence: boolean }) => {
              const handleId = `target-handler-${sourceNodeId}-${label}`;
              const pos = getHandlePosition(handleId);
              return (
                <Button
                  key={button.id}
                  variant="outline"
                  className="w-full text-xs px-2 py-1 relative overflow-visible"
                >
                  <span className="truncate">{label}</span>
                  {!inPanel && isFirstOccurrence && (
                    <PillHandle
                      id={handleId}
                      type="source"
                      position={pos}
                      tone="primary"
                      title={label}
                    />
                  )}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
