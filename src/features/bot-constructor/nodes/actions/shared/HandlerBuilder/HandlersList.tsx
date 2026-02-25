"use client";

import React, { useMemo, useState } from "react";
import { Handle, Position, useNodes } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
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
import { MessageCircle, CornerDownLeft, MousePointerClick, Trash2, Globe, Pencil, PlusIcon } from "lucide-react";
import { HandlerAdder } from "./handler-adder";
import { ConstructorData } from "@/features/bot-constructor/data";
import { CallbackQueryTriggerData, MessageTriggerNodeData, ReplyButtonTriggerData } from "./types";

type HandlerData =
    | MessageTriggerNodeData
    | ReplyButtonTriggerData
    | CallbackQueryTriggerData;

interface NodeWithHandlersData {
    handlers?: HandlerData[];
}

interface HandlersListProps {
    /** Node ID to get handlers from */
    sourceNodeId?: string;

    showHandle?: boolean;
}

export function HandlersList({ sourceNodeId, showHandle = true }: HandlersListProps) {
    const nodes = useNodes();
    const updateNodeData = useFlowStore((state) => state.updateNodeData);
    const [editingHandler, setEditingHandler] = useState<{
        handler: HandlerData;
        index: number;
    } | null>(null);

    const handlers = useMemo(() => {
        if (!sourceNodeId) return [];

        const node = nodes.find((n) => n.id === sourceNodeId);
        if (!node) return [];

        const nodeData = node.data as NodeWithHandlersData;
        return nodeData.handlers || [];
    }, [sourceNodeId, nodes]);

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

    const getHandlerTypeLabel = (handler: HandlerData): string => {
        if ("type" in handler) {
            // Message handler
            const messageType = ConstructorData.MessageTypes.find(
                (t) => t.value === handler.type
            );
            return messageType?.label || handler.type;
        }
        if ("selectedButtons" in handler || "catchNoButton" in handler) {
            return "Reply Button";
        }
        if ("filter" in handler && "context" in handler) {
            return "Callback Button";
        }
        return "Unknown";
    };

    const getHandlerIcon = (handler: HandlerData) => {
        if ("type" in handler) {
            return MessageCircle;
        }
        if ("selectedButtons" in handler || "catchNoButton" in handler) {
            return CornerDownLeft;
        }
        if ("filter" in handler && "context" in handler) {
            return MousePointerClick;
        }
        return MessageCircle;
    };

    const getFilterLabel = (filterValue: string, handlerType: "message" | "callback"): string => {
        if (filterValue === "any") {
            return "Har qanday";
        }

        if (handlerType === "message") {
            // Message handler filterlarini topish
            const allFilters = [
                ...ConstructorData.Filters.textFilters,
                ...ConstructorData.Filters.locationFilters,
                ...ConstructorData.Filters.fileFilters,
                ...ConstructorData.Filters.documentFilters,
            ];
            const filter = allFilters.find((f) => f.value === filterValue);
            return filter?.label || filterValue;
        } else {
            // Callback handler filterlarini topish
            const filter = ConstructorData.Filters.callbackFilters.find(
                (f) => f.value === filterValue
            );
            return filter?.label || filterValue;
        }
    };

    const getHandlerSummary = (handler: HandlerData): string => {
        // Message handler summary
        if ("type" in handler) {
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

            const filterLabel = getFilterLabel(handler.filter, "message");

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
        }

        // Reply button handler summary
        if ("selectedButtons" in handler) {
            if (handler.catchNoButton) {
                return "Reply Button → Hech qanday tugma bosilmasa";
            }

            if (handler.selectedButtons && handler.selectedButtons.length > 0) {
                const buttonTexts = handler.selectedButtons.map((btn) => btn.text).join(", ");
                return `Reply Button → ${buttonTexts}`;
            }

            return "Reply Button";
        }

        // Callback button handler summary
        if ("filter" in handler && "context" in handler) {
            if (!handler.filter || handler.filter === "any") {
                return "Callback Button → Har qanday";
            }

            const filterLabel = getFilterLabel(handler.filter, "callback");

            if (handler.context?.value) {
                return `Callback Button → ${filterLabel} → "${handler.context.value}"`;
            }

            return `Callback Button → ${filterLabel}`;
        }

        return "Noma'lum handler";
    };

    if (handlers.length === 0) {
        return (
            <div className="py-4">
                <p className="text-sm text-muted-foreground text-center">
                    Hozircha handlerlar mavjud emas
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2 py-4 w-full px-2">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Yaratilgan handlerlar</h3>
                <Badge variant="secondary" className="text-xs">
                    {handlers.length} ta
                </Badge>
            </div>

            <div className="space-y-2 overflow-y-auto">
                {handlers.map((handler, index) => {
                    const Icon = getHandlerIcon(handler);
                    const summary = getHandlerSummary(handler);
                    const isGlobal = "global" in handler && handler.global;

                    const handleId = `source-handler-${sourceNodeId}-${index}`;

                    return (
                        <Card key={index} className="group py-1 relative">
                            <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                                    {showHandle && (
                                        <Handle
                                            type="source"
                                            id={handleId}
                                            position={Position.Right}
                                            className="!w-3 !h-3 !bg-blue-500 translate-x-[-5px] flex items-center justify-center"
                                        >
                                            <PlusIcon size={12} className="w-2 h-2 text-white pointer-events-none" />
                                        </Handle>
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
