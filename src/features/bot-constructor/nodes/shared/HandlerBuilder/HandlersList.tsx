"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { Position, useUpdateNodeInternals } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useIsInNodePanel } from "@/features/bot-constructor/hooks/NodePanelContext";
import { Button } from "@/components/ui/button";
import { KeyboardConfig } from "@/features/bot-constructor/panels";
import { PillHandle } from "@/features/bot-constructor/canvas/handles/PillHandle";
import { getNodeKeyboard } from "@/features/bot-constructor/lib/keyboard-compat";
import { localizedToString } from "@/features/bot-constructor/fields/generic-fields/i18n-helpers";

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
  const updateNodeInternals = useUpdateNodeInternals();

  // Source node ni topish
  const sourceNode = useMemo(() => {
    return nodes.find((n) => n.id === sourceNodeId);
  }, [nodes, sourceNodeId]);

  // Routable tugmalar ro'yxati — handle chiqaradigan (callback) tugmalar, matn bo'yicha
  // dedup qilingan (faqat birinchi takror handle oladi). Bitta joyda hisoblanadi:
  // ro'yxat ham, handle re-measure ham shundan.
  const routableButtons = useMemo(() => {
    const NON_ROUTABLE = ["url", "web_app", "login_url", "switch_inline_query", "switch_inline_query_current_chat"];
    const seenText = new Set<string>();
    const normalized = getNodeKeyboard(sourceNode?.data ?? { keyboard });
    return (normalized[normalized.active] as any[][]) // eslint-disable-line @typescript-eslint/no-explicit-any
      .flat()
      .filter((b: any) => b?.handler !== false && !NON_ROUTABLE.includes(b?.type)) // eslint-disable-line @typescript-eslint/no-explicit-any
      .map((button: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const label: string =
          localizedToString(button.text) || (button.collectionData?.collection ? button.collectionData.collection : "");
        const isFirstOccurrence = !seenText.has(label);
        if (isFirstOccurrence) seenText.add(label);
        return { button, label, isFirstOccurrence };
      });
  }, [sourceNode?.data, keyboard]);

  // React Flow dinamik handle'larni avtomatik qayta o'lchamaydi. Tugma qo'shil/o'chsa
  // yoki nomi o'zgarsa, mavjud handle ID'lar to'plami o'zgaradi — shu paytda
  // updateNodeInternals chaqirib hamma handle'ni qayta o'lchatamiz, aks holda oxirgi
  // qo'shilgan tugmaning handle pozitsiyasi stale qolib, undan chiqqan edge ko'rinmaydi.
  const handleSignature = routableButtons
    .filter((b) => b.isFirstOccurrence)
    .map((b) => b.label)
    .join("|");
  useEffect(() => {
    if (sourceNodeId) updateNodeInternals(sourceNodeId);
  }, [sourceNodeId, handleSignature, updateNodeInternals]);

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
        {routableButtons.length > 0 && (
          <div className="flex flex-col gap-2 mb-3 pb-3 border-b">
            {routableButtons.map(({ button, label, isFirstOccurrence }: { button: any; label: string; isFirstOccurrence: boolean }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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
