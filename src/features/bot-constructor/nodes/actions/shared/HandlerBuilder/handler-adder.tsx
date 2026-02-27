"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useNodes } from "reactflow";
import { useReactFlow } from "reactflow";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ConstructorData } from "@/features/bot-constructor/data";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { MessageTriggerNodeData } from "./types";
import { getFiltersForType } from "./utils";
import { FilterSelector } from "./components/FilterSelector";
import { ParameterInput } from "./components/ParameterInput";

// Constants
const FILTER_ANY = "any";
const DEFAULT_MESSAGE_TYPE: MessageTriggerValueTypes = "text";

interface NodeWithHandlerData {
    handlers?: MessageTriggerNodeData[];
}

interface HandlerAdderProps {
    /** Optional node ID to get buttons from */
    sourceNodeId?: string;
    /** Handler to edit (if provided, component works in edit mode) */
    editingHandler?: MessageTriggerNodeData | null;
    /** Handler index to edit (required when editing) */
    editingHandlerIndex?: number | null;
    /** Callback when handler is updated (for edit mode) */
    onHandlerUpdated?: () => void;
}

export function HandlerAdder({
    sourceNodeId,
    editingHandler,
    editingHandlerIndex,
    onHandlerUpdated
}: HandlerAdderProps) {
    const { getNode } = useReactFlow();
    const updateNodeData = useFlowStore((state) => state.updateNodeData);

    const isEditMode = !!editingHandler && editingHandlerIndex !== null && editingHandlerIndex !== undefined;

    const [isCreating, setIsCreating] = useState(false);

    // Message handler states
    const [messageType, setMessageType] = useState<MessageTriggerValueTypes>(DEFAULT_MESSAGE_TYPE);
    const [messageFilter, setMessageFilter] = useState<string>(FILTER_ANY);
    const [messageContext, setMessageContext] = useState<
        MessageTriggerNodeData["context"]
    >({});
    const [messageGlobal, setMessageGlobal] = useState(false);

    // Update handlers in global store
    const handleUpdateHandlers = useCallback(
        (handlerData: MessageTriggerNodeData) => {
            if (!sourceNodeId) return;

            const node = getNode(sourceNodeId);
            if (!node) return;

            const nodeData = node.data as NodeWithHandlerData;
            const existingHandlers = nodeData.handlers || [];

            if (isEditMode && editingHandlerIndex !== null && editingHandlerIndex !== undefined) {
                // Edit mode: replace handler at index
                const updatedHandlers = [...existingHandlers];
                updatedHandlers[editingHandlerIndex] = handlerData;
                updateNodeData(sourceNodeId, {
                    ...nodeData,
                    handlers: updatedHandlers,
                });
                if (onHandlerUpdated) {
                    onHandlerUpdated();
                }
            } else {
                // Create mode: add new handler
                updateNodeData(sourceNodeId, {
                    ...nodeData,
                    handlers: [...existingHandlers, handlerData],
                });
            }
        },
        [sourceNodeId, getNode, updateNodeData, isEditMode, editingHandlerIndex, onHandlerUpdated]
    );

    // Get filters for selected message type
    const filtersForMessageType = useMemo(() => {
        return getFiltersForType(messageType);
    }, [messageType]);

    // Populate form when editing
    useEffect(() => {
        if (editingHandler && "type" in editingHandler) {
            setMessageType(editingHandler.type);
            setMessageFilter(editingHandler.filter || FILTER_ANY);
            setMessageContext(editingHandler.context || {});
            setMessageGlobal(editingHandler.global || false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingHandler]);

    // Reset all form fields to initial state
    const resetForm = useCallback(() => {
        setMessageType(DEFAULT_MESSAGE_TYPE);
        setMessageFilter(FILTER_ANY);
        setMessageContext({});
        setMessageGlobal(false);
    }, []);

    // Create handler data
    const createHandlerData = useCallback((): MessageTriggerNodeData => {
        return {
            type: messageType,
            filter: messageFilter,
            global: messageGlobal,
            context: messageContext,
        };
    }, [messageType, messageFilter, messageGlobal, messageContext]);

    const handleCreateHandler = useCallback(async () => {
        setIsCreating(true);

        const handlerData = createHandlerData();
        handleUpdateHandlers(handlerData);

        setIsCreating(false);
        resetForm();
    }, [createHandlerData, handleUpdateHandlers, resetForm]);

    const isFormValid = useMemo(() => {
        return messageType === "any" || (!!messageType && !!messageFilter);
    }, [messageType, messageFilter]);

    return (
        <div className="space-y-4 py-4">
            <div>
                <h3 className="text-sm font-semibold mb-2">
                    {isEditMode ? "Handler tahrirlash" : "Handler qo'shish"}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                    {isEditMode
                        ? "Handler sozlamalarini o'zgartiring"
                        : "Message Trigger sozlamalarini to'ldiring"
                    }
                </p>
            </div>

            {/* Message Handler Form */}
            <div className="space-y-4">
                <Separator />
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Xabar turi</Label>
                    <Select
                        value={messageType}
                        onValueChange={(value) => {
                            setMessageType(value as MessageTriggerValueTypes);
                            setMessageFilter(FILTER_ANY);
                            setMessageContext({});
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Xabar turini tanlang..." />
                        </SelectTrigger>
                        <SelectContent>
                            {ConstructorData.MessageTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                        <type.icon className="h-3 w-3" />
                                        <span>{type.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {messageType && messageType !== FILTER_ANY && (
                    <>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Filter</Label>
                            <FilterSelector
                                value={messageFilter}
                                onValueChange={setMessageFilter}
                                options={filtersForMessageType}
                            />
                        </div>

                        {messageFilter && messageFilter !== FILTER_ANY && (
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Parametr</Label>
                                <ParameterInput
                                    filter={messageFilter}
                                    context={messageContext}
                                    onContextUpdate={setMessageContext}
                                />
                            </div>
                        )}
                    </>
                )}

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="message-global"
                        checked={messageGlobal}
                        onCheckedChange={(checked) => setMessageGlobal(checked as boolean)}
                    />
                    <Label htmlFor="message-global" className="text-sm cursor-pointer">
                        Global
                    </Label>
                </div>
            </div>

            {/* Create/Update Button */}
            <Button
                onClick={handleCreateHandler}
                disabled={!isFormValid || isCreating}
                className="w-full"
            >
                {isCreating
                    ? (isEditMode ? "Yangilanmoqda..." : "Yaratilmoqda...")
                    : (isEditMode ? "Handler yangilash" : "Handler yaratish")
                }
            </Button>
        </div>
    );
}
