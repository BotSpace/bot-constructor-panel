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
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Search yoki dialog o'zgarganda resetlash
    useEffect(() => {
        setActiveCategoryIndex(0);
    }, [searchQuery]);

    useEffect(() => {
        if (open) {
            setSearchQuery("");
            setActiveCategoryIndex(0);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [open]);

    const handleSelect = useCallback(
        (element: ElementItemType) => {
            onSelect(element);
            setSearchQuery("");
            onOpenChange(false);
        },
        [onSelect, onOpenChange]
    );

    const activeGroup = filteredGroups[activeCategoryIndex];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[820px] max-h-[90vh] gap-0 p-0 overflow-auto"
            >
                <DialogHeader className="px-5 pt-5 pb-3">
                    <DialogTitle>Node qo&#39;shish</DialogTitle>
                    <DialogDescription>
                        Kategoriyani tanlang va kerakli node ni bosing
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="px-5 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            placeholder="Qidirish..."
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
                                        onMouseEnter={() => setActiveCategoryIndex(index)}
                                        onClick={() => setActiveCategoryIndex(index)}
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
                                                onClick={() => handleSelect(element)}
                                                className={cn(
                                                    "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                                                    "hover:bg-accent/50 focus-visible:outline-none",
                                                    "active:scale-[0.98] transition-transform duration-100"
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
                                Hech narsa topilmadi
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
