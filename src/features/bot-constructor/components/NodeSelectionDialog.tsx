"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useElements } from "@/features/bot-constructor/data/useElements";
import { ElementItemType, ElementTypes } from "@/types/element-types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
    Search,
    Zap,
    MessageSquare,
    Mail,
    GitBranch,
    Plug,
    Code,
    Star,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    "sidebar-triggers": <Zap className="h-4 w-4" />,
    "sidebar-actions": <MessageSquare className="h-4 w-4" />,
    "sidebar-plugins": <Plug className="h-4 w-4" />,
};

const CATEGORY_ICON_FALLBACKS = [
    <Mail className="h-4 w-4" key="mail" />,
    <GitBranch className="h-4 w-4" key="git" />,
    <Plug className="h-4 w-4" key="plug" />,
    <Code className="h-4 w-4" key="code" />,
];

function getCategoryIcon(group: ElementTypes, index: number): React.ReactNode {
    if (group.id && CATEGORY_ICONS[group.id]) return CATEGORY_ICONS[group.id];
    // Plugin categories: use the first element's icon (emoji from API)
    if (group.id?.startsWith("plugin-") && group.elements?.[0]?.icon) {
        return <span className="text-sm">{group.elements[0].icon}</span>;
    }
    return CATEGORY_ICON_FALLBACKS[index % CATEGORY_ICON_FALLBACKS.length];
}

interface NodeSelectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (element: ElementItemType) => void;
}

export function NodeSelectionDialog({
    open,
    onOpenChange,
    onSelect,
}: NodeSelectionDialogProps) {
    const t = useTranslations("editor.nodeSelector");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const [activeElementIndex, setActiveElementIndex] = useState(0);
    const [focusPanel, setFocusPanel] = useState<"categories" | "elements">("categories");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const elementRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
    const categoryRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    const elements = useElements();

    // Must have element ID lari
    const MUST_HAVE_IDS = useMemo(
        () => ["CommandTriggerNode", "SendTextMessageNode", "MessageTriggerNode", "EditMessageNode", "EditOrSendMessageNode"] as const,
        []
    );

    const mustHaveElements = useMemo(() => {
        const found: ElementItemType[] = [];
        for (const id of MUST_HAVE_IDS) {
            for (const group of elements) {
                const el = group.elements?.find((e) => e.triggerId === id);
                if (el) {
                    found.push(el);
                    break;
                }
            }
        }
        return found;
    }, [elements, MUST_HAVE_IDS]);

    const filteredGroups = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        const mustHaveGroup: ElementTypes = {
            title: "⭐ Tez-tez",
            id: "must-have",
            elements: query
                ? mustHaveElements.filter(
                    (el) =>
                        el.name.toLowerCase().includes(query) ||
                        el.description.toLowerCase().includes(query)
                )
                : mustHaveElements,
        };

        const baseGroups = query
            ? elements
                .map((group) => ({
                    ...group,
                    elements: group.elements?.filter(
                        (el) =>
                            el.name.toLowerCase().includes(query) ||
                            el.description.toLowerCase().includes(query)
                    ),
                }))
                .filter((group) => group.elements && group.elements.length > 0)
            : elements;

        return mustHaveGroup.elements.length > 0
            ? [mustHaveGroup, ...baseGroups]
            : baseGroups;
    }, [elements, searchQuery, mustHaveElements]);

    useEffect(() => {
        setActiveCategoryIndex(0);
        setActiveElementIndex(0);
        setFocusPanel("categories");
    }, [searchQuery]);

    useEffect(() => {
        if (open) {
            setSearchQuery("");
            setActiveCategoryIndex(0);
            setActiveElementIndex(0);
            setFocusPanel("categories");
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [open]);

    useEffect(() => {
        setActiveElementIndex(0);
    }, [activeCategoryIndex]);

    useEffect(() => {
        if (focusPanel === "elements") {
            elementRefs.current.get(activeElementIndex)?.scrollIntoView({ block: "nearest" });
        }
    }, [activeElementIndex, focusPanel]);

    useEffect(() => {
        if (focusPanel === "categories") {
            categoryRefs.current.get(activeCategoryIndex)?.scrollIntoView({ block: "nearest" });
        }
    }, [activeCategoryIndex, focusPanel]);

    const handleSelect = useCallback(
        (element: ElementItemType) => {
            onSelect(element);
            setSearchQuery("");
            onOpenChange(false);
        },
        [onSelect, onOpenChange]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const groupCount = filteredGroups.length;
            const elementCount = filteredGroups[activeCategoryIndex]?.elements?.length || 0;

            switch (e.key) {
                case "ArrowDown": {
                    e.preventDefault();
                    if (focusPanel === "categories") {
                        setActiveCategoryIndex((i) => Math.min(i + 1, groupCount - 1));
                    } else {
                        setActiveElementIndex((i) => Math.min(i + 1, elementCount - 1));
                    }
                    break;
                }
                case "ArrowUp": {
                    e.preventDefault();
                    if (focusPanel === "categories") {
                        setActiveCategoryIndex((i) => Math.max(i - 1, 0));
                    } else {
                        setActiveElementIndex((i) => Math.max(i - 1, 0));
                    }
                    break;
                }
                case "ArrowRight": {
                    if (focusPanel === "categories" && elementCount > 0) {
                        e.preventDefault();
                        setFocusPanel("elements");
                        setActiveElementIndex(0);
                    }
                    break;
                }
                case "ArrowLeft": {
                    if (focusPanel === "elements") {
                        e.preventDefault();
                        setFocusPanel("categories");
                    }
                    break;
                }
                case "Enter": {
                    e.preventDefault();
                    if (focusPanel === "categories" && elementCount > 0) {
                        setFocusPanel("elements");
                        setActiveElementIndex(0);
                    } else if (focusPanel === "elements") {
                        const el = filteredGroups[activeCategoryIndex]?.elements?.[activeElementIndex];
                        if (el) handleSelect(el);
                    }
                    break;
                }
                case "Escape": {
                    if (focusPanel === "elements") {
                        e.preventDefault();
                        e.stopPropagation();
                        setFocusPanel("categories");
                    }
                    break;
                }
            }
        },
        [focusPanel, filteredGroups, activeCategoryIndex, activeElementIndex, handleSelect]
    );

    const activeGroup = filteredGroups[activeCategoryIndex];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[820px] max-h-[90vh] gap-0 p-0 overflow-auto"
                onKeyDown={handleKeyDown}
            >
                <DialogHeader className="px-5 pt-5 pb-3">
                    <DialogTitle>{t("title")}</DialogTitle>
                    <DialogDescription>
                        {t("description")}
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="px-5 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder={t("searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="flex border-t h-[500px]">
                    {/* Left: Categories */}
                    <div className="w-[260px] border-r bg-muted/30 flex flex-col min-h-0 overflow-hidden">
                        <ScrollArea className="h-full">
                            <div className="py-2">
                                {filteredGroups.map((group, index) => (
                                    <button
                                        key={group.id || index}
                                        ref={(el) => {
                                            if (el) categoryRefs.current.set(index, el);
                                            else categoryRefs.current.delete(index);
                                        }}
                                        onMouseEnter={() => {
                                            setActiveCategoryIndex(index);
                                            setFocusPanel("categories");
                                        }}
                                        onClick={() => {
                                            setActiveCategoryIndex(index);
                                            setFocusPanel("elements");
                                            setActiveElementIndex(0);
                                        }}
                                        className={cn(
                                            "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors",
                                            "hover:bg-accent/60",
                                            index === activeCategoryIndex &&
                                            "bg-accent text-accent-foreground font-medium border-r-2 border-primary"
                                        )}
                                    >
                                        <span className="shrink-0 text-muted-foreground">
                                            {group.id === "must-have" ? (
                                                <Star className="h-4 w-4 text-amber-500" />
                                            ) : (
                                                getCategoryIcon(group, index)
                                            )}
                                        </span>
                                        <span className="truncate">{group.title}</span>
                                        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                                            {group.elements?.length || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right: Nodes */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                        {activeGroup ? (
                            <React.Fragment key={activeGroup.id || activeCategoryIndex}>
                                <div className="px-4 py-3 border-b bg-muted/20 shrink-0">
                                    <h3 className="text-sm font-semibold text-foreground">
                                        {activeGroup.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {activeGroup.elements?.length || 0} ta node mavjud
                                    </p>
                                </div>
                                <ScrollArea className="flex-1 overflow-auto">
                                    <div className="p-2 grid gap-1">
                                        {activeGroup.elements?.map((element, idx) => (
                                            <button
                                                key={`${element.triggerId}-${idx}`}
                                                ref={(el) => {
                                                    if (el) elementRefs.current.set(idx, el);
                                                    else elementRefs.current.delete(idx);
                                                }}
                                                onClick={() => handleSelect(element)}
                                                onMouseEnter={() => {
                                                    setFocusPanel("elements");
                                                    setActiveElementIndex(idx);
                                                }}
                                                className={cn(
                                                    "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                                                    "hover:bg-accent/50 focus-visible:outline-none",
                                                    "active:scale-[0.98] transition-transform duration-100",
                                                    focusPanel === "elements" && idx === activeElementIndex &&
                                                    "bg-accent/50 ring-1 ring-primary/30"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-lg",
                                                        element.color
                                                    )}
                                                >
                                                    {element.icon}
                                                </div>
                                                <div className="flex flex-col gap-0.5 min-w-0">
                                                    <span className="text-sm font-medium leading-tight text-foreground">
                                                        {element.name}
                                                    </span>
                                                    <span className="text-xs leading-snug text-muted-foreground line-clamp-2">
                                                        {element.description}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </React.Fragment>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                {t("noResults")}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
