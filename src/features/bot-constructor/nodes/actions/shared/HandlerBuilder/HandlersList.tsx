"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Handle, Position } from "reactflow";
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
import { MessageCircle, Trash2, Globe, Pencil, PlusIcon } from "lucide-react";
import { HandlerAdder } from "./handler-adder";
import { ConstructorData } from "@/features/bot-constructor/data";
import { MessageTriggerNodeData } from "./types";
import { KeyboardConfig } from "@/features/bot-constructor/components";

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
        <div className="space-y-2 py-4 w-full px-2">

            <div className="space-y-2 overflow-y-auto">
                {keyboard && keyboard.active && keyboard[keyboard.active] && keyboard[keyboard.active].flat().length > 0 && (
                    <div className="flex flex-wrap flex-col gap-2 mb-3 pb-3 border-b">
                        {keyboard[keyboard.active].flat().map((button) => (
                            <Button
                                key={button.id}
                                variant="outline"
                                className="text-xs px-2 py-1 relative"
                            >
                                {button.text}
                                {!inPanel && (() => {
                                    const handleId = `target-handler-${sourceNodeId}-${button.text}`;
                                    const pos = getHandlePosition(handleId);
                                    const isLeft = pos === Position.Left;
                                    return (
                                        <Handle
                                            type="source"
                                            id={handleId}
                                            position={pos}
                                            className={`!w-4 !h-full !rounded-[6px] !bg-blue-500 flex items-center justify-center ${isLeft ? 'translate-x-[5px]' : 'translate-x-[-5px]'}`}
                                        >
                                            <PlusIcon size={12} className="w-2 h-2 text-white pointer-events-none" />
                                        </Handle>
                                    );
                                })()}
                            </Button>
                        ))}
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
                                    {!inPanel && (() => {
                                        const pos = getHandlePosition(handleId);
                                        const isLeft = pos === Position.Left;
                                        return (
                                            <Handle
                                                type="source"
                                                id={handleId}
                                                position={pos}
                                                className={`!w-4 !h-full !rounded-[6px] !bg-blue-500 flex items-center justify-center ${isLeft ? 'translate-x-[5px]' : 'translate-x-[-5px]'}`}
                                            >
                                                <PlusIcon size={12} className="w-2 h-2 text-white pointer-events-none" />
                                            </Handle>
                                        );
                                    })()}
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
