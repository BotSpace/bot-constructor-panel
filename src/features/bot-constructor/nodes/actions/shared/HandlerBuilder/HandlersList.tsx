"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Position } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, Trash2, Globe, Pencil } from "lucide-react";
import { HandlerAdder } from "./handler-adder";
import { ConstructorData } from "@/features/bot-constructor/data";
import { MessageTriggerNodeData } from "@/features/bot-constructor/nodes/types";
import { KeyboardConfig } from "@/features/bot-constructor/components";
import { PillHandle } from "../../../components/shared/ReactFlowHandles/PillHandle";
import { getNodeKeyboard } from "@/features/bot-constructor/utils/keyboard-compat";

interface NodeWithHandlersData {
  handlers?: MessageTriggerNodeData[];
}

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
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [editingHandler, setEditingHandler] = useState<{
    handler: MessageTriggerNodeData;
    index: number;
  } | null>(null);

  const handlers = useMemo(() => {
    if (!sourceNodeId) return [];

    const node = nodes.find((n) => n.id === sourceNodeId);
    if (!node) return [];

    const nodeData = node.data as NodeWithHandlersData;
    return nodeData.handlers || [];
  }, [sourceNodeId, nodes]);

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

  const handleRemoveHandler = (index: number) => {
    if (!sourceNodeId) return;

    const node = nodes.find((n) => n.id === sourceNodeId);
    if (!node) return;

    const nodeData = node.data as NodeWithHandlersData;
    const updatedHandlers = (nodeData.handlers || []).filter((_, i) => i !== index);

    updateNodeData(sourceNodeId, {
      ...nodeData,
      handlers: updatedHandlers,
    });
  };

  const getFilterLabel = (filterValue: string): string => {
    if (filterValue === "any") {
      return "Har qanday";
    }

    const allFilters = [
      ...ConstructorData.Filters.textFilters,
      ...ConstructorData.Filters.locationFilters,
      ...ConstructorData.Filters.fileFilters,
      ...ConstructorData.Filters.documentFilters,
    ];
    const filter = allFilters.find((f) => f.value === filterValue);
    return filter?.label || filterValue;
  };

  const getHandlerSummary = (handler: MessageTriggerNodeData): string => {
    const messageType = ConstructorData.MessageTypes.find(
      (t) => t.value === handler.type
    );
    const messageTypeLabel = messageType?.label || handler.type;

    if (handler.type === "any") {
      return messageTypeLabel;
    }

    if (!handler.filter || handler.filter === "any") {
      return `${messageTypeLabel} → Har qanday`;
    }

    const filterLabel = getFilterLabel(handler.filter);

    // Agar parametr bo'lsa, uni ko'rsatamiz
    if (handler.context?.value) {
      return `${messageTypeLabel} → ${filterLabel} → "${handler.context.value}"`;
    }

    // Radius parametri
    if (handler.context?.radius) {
      const { lat, lng, km } = handler.context.radius;
      if (lat || lng || km) {
        const radiusParts = [lat, lng, km].filter(Boolean).join(", ");
        return `${messageTypeLabel} → ${filterLabel} → ${radiusParts}`;
      }
    }

    // Size parametri
    if (handler.context?.size) {
      const { min, max } = handler.context.size;
      if (min || max) {
        const sizeText = min && max ? `${min} - ${max} MB` : min ? `${min} MB` : `${max} MB`;
        return `${messageTypeLabel} → ${filterLabel} → ${sizeText}`;
      }
    }

    return `${messageTypeLabel} → ${filterLabel}`;
  };


  return (
    <div className="space-y-2 w-full">

      <div className="space-y-2">
        {(() => {
          const normalized = getNodeKeyboard(sourceNode?.data ?? { keyboard });
          return normalized[normalized.active] as any[][];
        })().flat().length > 0 && (
          <div className="flex flex-col gap-2 mb-3 pb-3 border-b">
            {(() => {
              const seenText = new Set<string>();
              const normalized = getNodeKeyboard(sourceNode?.data ?? { keyboard });
              return (normalized[normalized.active] as any[][])
                .flat()
                // handler switch: false bo'lsa tugma handle sifatida ko'rinmaydi
                // (faqat callback). undefined = true (backward-compat).
                .filter((button: any) => button?.handler !== false)
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

        {handlers.map((handler, index) => {
          const summary = getHandlerSummary(handler);
          const isGlobal = handler.global;

          const handleId = `source-handler-${sourceNodeId}-${index}`;

          return (
            <Card key={index} className="group py-1 relative">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <MessageCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium leading-relaxed">
                        {summary}
                      </span>
                      {isGlobal && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                          <Globe className="h-2.5 w-2.5 mr-1" />
                          Global
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-primary"
                      onClick={() => setEditingHandler({ handler, index })}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveHandler(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {!inPanel && (
                    <PillHandle
                      id={handleId}
                      type="source"
                      position={getHandlePosition(handleId)}
                      tone="primary"
                      title={summary}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Handler Dialog */}
      <Dialog open={!!editingHandler} onOpenChange={(open) => !open && setEditingHandler(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Handler tahrirlash</DialogTitle>
            <DialogDescription>
              Handler sozlamalarini o'zgartiring
            </DialogDescription>
          </DialogHeader>
          {editingHandler && (
            <HandlerAdder
              sourceNodeId={sourceNodeId}
              editingHandler={editingHandler.handler}
              editingHandlerIndex={editingHandler.index}
              onHandlerUpdated={() => setEditingHandler(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
