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
import { MessageCircle, CornerDownLeft, MousePointerClick } from "lucide-react";
import { ConstructorData } from "@/features/bot-constructor/data";
import { ButtonConfig, KeyboardConfig } from "@/features/bot-constructor/components";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { CallbackQueryTriggerData, MessageTriggerNodeData, ReplyButtonTriggerData } from "./types";
import { getFiltersForType } from "./utils";
import { FilterSelector } from "./components/FilterSelector";
import { ParameterInput } from "./components/ParameterInput";
import { ValueInput } from "./components/ParameterInput/ValueInput";

// Constants
const HANDLER_TYPES = {
    MESSAGE: "message",
    REPLY_BUTTON: "reply_button",
    CALLBACK_BUTTON: "callback_button",
} as const;

const FILTER_ANY = "any";
const DEFAULT_MESSAGE_TYPE: MessageTriggerValueTypes = "text";

type HandlerType = typeof HANDLER_TYPES[keyof typeof HANDLER_TYPES];

interface NodeWithKeyboardData {
    keyboard?: KeyboardConfig;
    handlers?: Array<
        | MessageTriggerNodeData
        | ReplyButtonTriggerData
        | CallbackQueryTriggerData
    >;
}

interface HandlerAdderProps {
    /** Optional node ID to get buttons from (for reply/callback handlers) */
    sourceNodeId?: string;
    /** Handler to edit (if provided, component works in edit mode) */
    editingHandler?: HandlerData | null;
    /** Handler index to edit (required when editing) */
    editingHandlerIndex?: number | null;
    /** Callback when handler is updated (for edit mode) */
    onHandlerUpdated?: () => void;
}

interface CallbackItem {
    id: string;
    text: string;
    value: string;
    isCollection: boolean;
}

type HandlerData =
    | MessageTriggerNodeData
    | ReplyButtonTriggerData
    | CallbackQueryTriggerData;

export function HandlerAdder({
    sourceNodeId,
    editingHandler,
    editingHandlerIndex,
    onHandlerUpdated
}: HandlerAdderProps) {
    const { getNode } = useReactFlow();
    const updateNodeData = useFlowStore((state) => state.updateNodeData);
    const nodes = useNodes();

    const isEditMode = !!editingHandler && editingHandlerIndex !== null && editingHandlerIndex !== undefined;

    const [handlerType, setHandlerType] = useState<HandlerType | "">("");
    const [isCreating, setIsCreating] = useState(false);

    // Message handler states
    const [messageType, setMessageType] = useState<MessageTriggerValueTypes>(DEFAULT_MESSAGE_TYPE);
    const [messageFilter, setMessageFilter] = useState<string>(FILTER_ANY);
    const [messageContext, setMessageContext] = useState<
        MessageTriggerNodeData["context"]
    >({});
    const [messageGlobal, setMessageGlobal] = useState(false);

    // Reply button handler states
    const [replySelectedButtons, setReplySelectedButtons] = useState<ButtonConfig[]>([]);
    const [replyCatchNoButton, setReplyCatchNoButton] = useState(false);
    const [replyGlobal, setReplyGlobal] = useState(false);

    // Callback button handler states
    const [callbackFilter, setCallbackFilter] = useState<string>(FILTER_ANY);
    const [callbackValue, setCallbackValue] = useState<string>("");
    const [callbackGlobal, setCallbackGlobal] = useState(false);

    // Update handlers in global store
    const handleUpdateHandlers = useCallback(
        (handlerData: HandlerData) => {
            if (!sourceNodeId) return;

            const node = getNode(sourceNodeId);
            if (!node) return;

            const nodeData = node.data as NodeWithKeyboardData;
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

    // Get available reply buttons from source node
    const availableReplyButtons = useMemo(() => {
        if (!sourceNodeId) return [];

        const sourceNode = nodes.find((node) => node.id === sourceNodeId);
        if (!sourceNode) return [];

        const sourceNodeData = sourceNode.data as NodeWithKeyboardData;
        const replyButtons = sourceNodeData.keyboard?.reply;

        if (!replyButtons) return [];

        const validButtonTypes = ["reply", "request_contact", "request_location"] as const;

        return replyButtons
            .flat()
            .filter((button) => validButtonTypes.includes(button.type as typeof validButtonTypes[number]));
    }, [nodes, sourceNodeId]);

    // Get available callback buttons from source node
    const availableCallbacks = useMemo((): CallbackItem[] => {
        if (!sourceNodeId) return [];

        const sourceNode = nodes.find((node) => node.id === sourceNodeId);
        if (!sourceNode) return [];

        const sourceNodeData = sourceNode.data as NodeWithKeyboardData;
        const inlineButtons = sourceNodeData.keyboard?.inline;

        if (!inlineButtons) return [];

        const callbacks: CallbackItem[] = [];

        for (const button of inlineButtons.flat()) {
            // Static callback button
            if (
                button.type === "callback" &&
                button.value &&
                !button.collectionData
            ) {
                callbacks.push({
                    id: button.id,
                    text: button.text,
                    value: button.value,
                    isCollection: false,
                });
            }

            // Collection button (dynamic)
            if (button.collectionData) {
                const { collection, text } = button.collectionData;
                callbacks.push({
                    id: button.id,
                    text: button.text.replace("📦 ", ""),
                    value: `collection:${collection}:${text}`,
                    isCollection: true,
                });
            }
        }

        return callbacks;
    }, [nodes, sourceNodeId]);

    // Get filters for selected message type
    const filtersForMessageType = useMemo(() => {
        return getFiltersForType(messageType);
    }, [messageType]);

    // Populate form when editing
    useEffect(() => {
        if (editingHandler) {
            // Determine handler type
            if ("type" in editingHandler) {
                setHandlerType(HANDLER_TYPES.MESSAGE);
                setMessageType(editingHandler.type);
                setMessageFilter(editingHandler.filter || FILTER_ANY);
                setMessageContext(editingHandler.context || {});
                setMessageGlobal(editingHandler.global || false);
            } else if ("selectedButtons" in editingHandler || "catchNoButton" in editingHandler) {
                setHandlerType(HANDLER_TYPES.REPLY_BUTTON);
                setReplySelectedButtons(editingHandler.selectedButtons || []);
                setReplyCatchNoButton(editingHandler.catchNoButton || false);
                setReplyGlobal(editingHandler.global || false);
            } else if ("filter" in editingHandler && "context" in editingHandler) {
                setHandlerType(HANDLER_TYPES.CALLBACK_BUTTON);
                setCallbackFilter(editingHandler.filter || FILTER_ANY);
                setCallbackValue(editingHandler.context?.value || "");
                setCallbackGlobal(editingHandler.global || false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingHandler]);

    // Handle reply button selection toggle
    const handleReplyButtonToggle = useCallback(
        (button: ButtonConfig, checked: boolean) => {
            if (checked) {
                setReplySelectedButtons((prev) => [...prev, button]);
            } else {
                setReplySelectedButtons((prev) => prev.filter((btn) => btn.id !== button.id));
            }
        },
        []
    );

    // Handle reply catch no button toggle
    const handleReplyCatchNoButtonToggle = useCallback((checked: boolean) => {
        setReplyCatchNoButton(checked);
        if (checked) {
            setReplySelectedButtons([]);
        }
    }, []);

    // Get placeholder text for callback value input based on filter type
    const getCallbackPlaceholder = useCallback((filter: string): string => {
        switch (filter) {
            case "regex":
                return "Masalan: item:.*";
            case "collection":
                return "Masalan: collection:users:id";
            default:
                return "Masalan: main_menu";
        }
    }, []);

    // Reset all form fields to initial state
    const resetForm = useCallback(() => {
        setHandlerType("");
        setMessageType(DEFAULT_MESSAGE_TYPE);
        setMessageFilter(FILTER_ANY);
        setMessageContext({});
        setMessageGlobal(false);
        setReplySelectedButtons([]);
        setReplyCatchNoButton(false);
        setReplyGlobal(false);
        setCallbackFilter(FILTER_ANY);
        setCallbackValue("");
        setCallbackGlobal(false);
    }, []);

    // Create handler data based on handler type
    const createHandlerData = useCallback((): HandlerData | null => {
        if (!handlerType) return null;

        switch (handlerType) {
            case HANDLER_TYPES.MESSAGE:
                return {
                    type: messageType,
                    filter: messageFilter,
                    global: messageGlobal,
                    context: messageContext,
                } as MessageTriggerNodeData;
            case HANDLER_TYPES.REPLY_BUTTON:
                return {
                    selectedButtons: replySelectedButtons,
                    catchNoButton: replyCatchNoButton,
                    global: replyGlobal,
                    context: {},
                } as ReplyButtonTriggerData;
            case HANDLER_TYPES.CALLBACK_BUTTON:
                return {
                    filter: callbackFilter,
                    global: callbackGlobal,
                    context: {
                        value: callbackValue,
                    },
                } as CallbackQueryTriggerData;
            default:
                return null;
        }
    }, [
        handlerType,
        messageType,
        messageFilter,
        messageGlobal,
        messageContext,
        replySelectedButtons,
        replyCatchNoButton,
        replyGlobal,
        callbackFilter,
        callbackValue,
        callbackGlobal,
    ]);

    const handleCreateHandler = useCallback(async () => {
        if (!handlerType) return;

        setIsCreating(true);

        const handlerData = createHandlerData();
        if (handlerData) {
            handleUpdateHandlers(handlerData);
        }

        setIsCreating(false);
        resetForm();
    }, [handlerType, createHandlerData, handleUpdateHandlers, resetForm]);

    const isFormValid = useMemo(() => {
        if (!handlerType) return false;

        switch (handlerType) {
            case HANDLER_TYPES.MESSAGE:
                return messageType === "any" || (!!messageType && !!messageFilter);
            case HANDLER_TYPES.REPLY_BUTTON:
                return replySelectedButtons.length > 0 || replyCatchNoButton;
            case HANDLER_TYPES.CALLBACK_BUTTON:
                return callbackFilter === FILTER_ANY || !!callbackValue;
            default:
                return false;
        }
    }, [
        handlerType,
        messageType,
        messageFilter,
        replySelectedButtons,
        replyCatchNoButton,
        callbackFilter,
        callbackValue,
    ]);

    return (
        <div className="space-y-4 py-4">
            <div>
                <h3 className="text-sm font-semibold mb-2">
                    {isEditMode ? "Handler tahrirlash" : "Handler qo'shish"}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                    {isEditMode
                        ? "Handler sozlamalarini o'zgartiring"
                        : "Handler turini tanlang va sozlamalarni to'ldiring"
                    }
                </p>
            </div>

            {/* Handler type selector */}
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Handler turi</Label>
                <Select
                    value={handlerType}
                    onValueChange={(value) => setHandlerType(value as HandlerType)}
                    disabled={isEditMode}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Handler turini tanlang..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={HANDLER_TYPES.MESSAGE}>
                            <div className="flex items-center gap-2">
                                <MessageCircle className="h-4 w-4" />
                                <span>Message Handler</span>
                            </div>
                        </SelectItem>
                        <SelectItem value={HANDLER_TYPES.REPLY_BUTTON}>
                            <div className="flex items-center gap-2">
                                <CornerDownLeft className="h-4 w-4" />
                                <span>Reply Button Handler</span>
                            </div>
                        </SelectItem>
                        <SelectItem value={HANDLER_TYPES.CALLBACK_BUTTON}>
                            <div className="flex items-center gap-2">
                                <MousePointerClick className="h-4 w-4" />
                                <span>Callback Button Handler</span>
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Message Handler Form */}
            {handlerType === HANDLER_TYPES.MESSAGE && (
                <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-2">
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
            )}

            {/* Reply Button Handler Form */}
            {handlerType === HANDLER_TYPES.REPLY_BUTTON && (
                <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-2">
                    <Separator />
                    {availableReplyButtons.length > 0 ? (
                        <div className="space-y-3">
                            <Label className="text-xs text-muted-foreground">
                                Qaysi tugma ushlansin?
                            </Label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {availableReplyButtons.map((button) => {
                                    const isSelected = replySelectedButtons.some(
                                        (btn) => btn.id === button.id
                                    );
                                    return (
                                        <div key={button.id} className="flex items-center gap-3">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) =>
                                                    handleReplyButtonToggle(button, checked as boolean)
                                                }
                                            />
                                            <Label className="text-sm cursor-pointer">{button.text}</Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground p-3 rounded-lg border border-dashed">
                            Tugmalar topilmadi. Avval xabar yuborish node'iga reply tugmalar qo'shing.
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="reply-catch-no-button"
                            checked={replyCatchNoButton}
                            onCheckedChange={(checked) => handleReplyCatchNoButtonToggle(checked as boolean)}
                        />
                        <Label htmlFor="reply-catch-no-button" className="text-sm cursor-pointer">
                            Hech qanday tugma bosilmasa ham tutib olish
                        </Label>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="reply-global"
                            checked={replyGlobal}
                            onCheckedChange={(checked) => setReplyGlobal(checked as boolean)}
                        />
                        <Label htmlFor="reply-global" className="text-sm cursor-pointer">
                            Global
                        </Label>
                    </div>
                </div>
            )}

            {/* Callback Button Handler Form */}
            {handlerType === HANDLER_TYPES.CALLBACK_BUTTON && (
                <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-2">
                    <Separator />
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                            Callback ma'lumoti filtri
                        </Label>
                        <FilterSelector
                            value={callbackFilter}
                            onValueChange={setCallbackFilter}
                            options={ConstructorData.Filters.callbackFilters}
                        />
                    </div>

                    {callbackFilter && callbackFilter !== FILTER_ANY && (
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Parametr</Label>
                            {availableCallbacks.length > 0 && callbackFilter === "equals" ? (
                                <Select value={callbackValue} onValueChange={setCallbackValue}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Callback tanlang..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCallbacks.map((callback) => (
                                            <SelectItem key={callback.id} value={callback.value}>
                                                <div className="flex items-center justify-between w-full gap-2">
                                                    <span>{callback.text}</span>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {callback.value}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <ValueInput
                                    value={callbackValue}
                                    onChange={setCallbackValue}
                                    placeholder={getCallbackPlaceholder(callbackFilter)}
                                />
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="callback-global"
                            checked={callbackGlobal}
                            onCheckedChange={(checked) => setCallbackGlobal(checked as boolean)}
                        />
                        <Label htmlFor="callback-global" className="text-sm cursor-pointer">
                            Global
                        </Label>
                    </div>
                </div>
            )}

            {/* Create/Update Button */}
            {handlerType && (
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
            )}
        </div>
    );
}
