"use client";

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useElements } from "@/features/bot-constructor/data/useElements";
import { ElementItemType, ElementTypes } from "@/types/element-types";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
    Search,
    Zap,
    MessageSquare,
    Settings,
    GitBranch,
    Plug,
    Code2,
    Star,
    BrainCircuit,
    Globe,
    LayoutGrid,
    ArrowLeft,
    ChevronRight,
    Layers,
    Pencil,
    Wrench,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    "sidebar-triggers": <Zap className="h-4 w-4" />,
    "sidebar-actions": <MessageSquare className="h-4 w-4" />,
    "sidebar-messageOperations": <Pencil className="h-4 w-4" />,
    "sidebar-flowControl": <GitBranch className="h-4 w-4" />,
    "sidebar-integrations": <Globe className="h-4 w-4" />,
    "sidebar-customLogic": <Code2 className="h-4 w-4" />,
    "sidebar-ai": <BrainCircuit className="h-4 w-4" />,
    "sidebar-ai_tools": <Wrench className="h-4 w-4" />,
    "must-have": <Star className="h-4 w-4 text-amber-500" />,
};

/** Returns a short role label ("Trigger", "Action", "Tool", "Provider", "Logic", …) from the group id. */
function getRoleLabel(groupId: string | undefined): string | null {
    if (!groupId) return null;
    if (groupId === "sidebar-triggers") return "Trigger";
    if (groupId === "sidebar-actions") return "Action";
    if (groupId === "sidebar-messageOperations") return "Action";
    if (groupId === "sidebar-flowControl") return "Logic";
    if (groupId === "sidebar-customLogic") return "Logic";
    if (groupId === "sidebar-integrations") return "Integration";
    if (groupId === "sidebar-ai") return "AI";
    if (groupId === "sidebar-ai_tools") return "Tool";
    return null;
}

/** Returns Tailwind classes for the role badge. */
function getRoleBadgeClass(role: string): string {
    switch (role) {
        case "Trigger": return "bg-blue-500/15 text-blue-400 border-blue-500/25";
        case "Action": return "bg-amber-500/15 text-amber-400 border-amber-500/25";
        case "Logic": return "bg-violet-500/15 text-violet-400 border-violet-500/25";
        case "Integration": return "bg-indigo-500/15 text-indigo-400 border-indigo-500/25";
        case "AI": return "bg-purple-500/15 text-purple-400 border-purple-500/25";
        case "Tool": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
        default: return "bg-zinc-500/15 text-zinc-400 border-zinc-500/25";
    }
}

// Fallbacks for plugin categories (indexed by position)
const FALLBACK_ICONS = [
    <Plug className="h-4 w-4" key="plug" />,
    <Settings className="h-4 w-4" key="settings" />,
    <Layers className="h-4 w-4" key="layers" />,
    <LayoutGrid className="h-4 w-4" key="grid" />,
];

function getCategoryIcon(group: ElementTypes, index: number): React.ReactNode {
    if (group.id && CATEGORY_ICONS[group.id]) return CATEGORY_ICONS[group.id];
    if (group.id?.startsWith("plugin-") && group.elements?.[0]?.icon) {
        const rawIcon = group.elements[0].icon;
        if (typeof rawIcon === "string") {
            return <span className="text-sm">{rawIcon}</span>;
        }
    }
    return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
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
    // drill-in: null = category list view, string = selected category id
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
    const [activeElementIndex, setActiveElementIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const elementRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
    const categoryRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
    const [activeCategoryIndexNav, setActiveCategoryIndexNav] = useState(0);

    const elements = useElements();

    const MUST_HAVE_IDS = useMemo(
        () => ["CommandTriggerNode", "SendTextMessageNode", "MessageTriggerNode", "EditMessageNode", "EditOrSendMessageNode"] as const,
        []
    );

    const mustHaveElements = useMemo(() => {
        const found: ElementItemType[] = [];
        for (const id of MUST_HAVE_IDS) {
            for (const group of elements) {
                const el = group.elements?.find((e) => e.triggerId === id);
                if (el) { found.push(el); break; }
            }
        }
        return found;
    }, [elements, MUST_HAVE_IDS]);

    const filteredGroups = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        const mustHaveGroup: ElementTypes = {
            title: "Tez-tez",
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

    // When searching, show flat search results instead of drill-down
    const isSearching = searchQuery.trim().length > 0;

    // Active group for the drilled-in view
    const activeDrillGroup = useMemo(
        () => filteredGroups.find((g) => g.id === activeCategoryId) ?? null,
        [filteredGroups, activeCategoryId]
    );

    // Reset state when opening/closing
    useEffect(() => {
        if (open) {
            setSearchQuery("");
            setActiveCategoryId(null);
            setActiveElementIndex(0);
            setActiveCategoryIndexNav(0);
            setTimeout(() => searchInputRef.current?.focus(), 80);
        }
    }, [open]);

    // When search query changes, collapse back to category list (search shows flat results)
    useEffect(() => {
        setActiveCategoryId(null);
        setActiveElementIndex(0);
        setActiveCategoryIndexNav(0);
    }, [searchQuery]);

    // Scroll active element into view
    useEffect(() => {
        if (activeCategoryId) {
            elementRefs.current.get(activeElementIndex)?.scrollIntoView({ block: "nearest" });
        }
    }, [activeElementIndex, activeCategoryId]);

    // Scroll active category into view (keyboard nav)
    useEffect(() => {
        if (!activeCategoryId && !isSearching) {
            const id = filteredGroups[activeCategoryIndexNav]?.id;
            if (id) categoryRefs.current.get(id)?.scrollIntoView({ block: "nearest" });
        }
    }, [activeCategoryIndexNav, activeCategoryId, isSearching, filteredGroups]);

    const handleSelect = useCallback(
        (element: ElementItemType) => {
            onSelect(element);
            setSearchQuery("");
            onOpenChange(false);
        },
        [onSelect, onOpenChange]
    );

    const handleBack = useCallback(() => {
        setActiveCategoryId(null);
        setActiveElementIndex(0);
        setTimeout(() => searchInputRef.current?.focus(), 50);
    }, []);

    const handleDrillIn = useCallback((categoryId: string) => {
        setActiveCategoryId(categoryId);
        setActiveElementIndex(0);
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (isSearching) {
                // In search: no drill-in, just navigate flat list (handled by natural tab/enter)
                return;
            }

            if (!activeCategoryId) {
                // Category list navigation
                const groupCount = filteredGroups.length;
                switch (e.key) {
                    case "ArrowDown":
                        e.preventDefault();
                        setActiveCategoryIndexNav((i) => Math.min(i + 1, groupCount - 1));
                        break;
                    case "ArrowUp":
                        e.preventDefault();
                        setActiveCategoryIndexNav((i) => Math.max(i - 1, 0));
                        break;
                    case "Enter":
                    case "ArrowRight": {
                        e.preventDefault();
                        const group = filteredGroups[activeCategoryIndexNav];
                        if (group?.id) handleDrillIn(group.id);
                        break;
                    }
                }
            } else {
                // Drilled-in element navigation
                const elementCount = activeDrillGroup?.elements?.length || 0;
                switch (e.key) {
                    case "ArrowDown":
                        e.preventDefault();
                        setActiveElementIndex((i) => Math.min(i + 1, elementCount - 1));
                        break;
                    case "ArrowUp":
                        e.preventDefault();
                        setActiveElementIndex((i) => Math.max(i - 1, 0));
                        break;
                    case "Enter": {
                        e.preventDefault();
                        const el = activeDrillGroup?.elements?.[activeElementIndex];
                        if (el) handleSelect(el);
                        break;
                    }
                    case "ArrowLeft":
                    case "Escape":
                        e.preventDefault();
                        e.stopPropagation();
                        handleBack();
                        break;
                }
            }
        },
        [
            isSearching,
            activeCategoryId,
            filteredGroups,
            activeCategoryIndexNav,
            activeDrillGroup,
            activeElementIndex,
            handleDrillIn,
            handleSelect,
            handleBack,
        ]
    );

    // Build flat search results across all groups
    const searchResults = useMemo(() => {
        if (!isSearching) return [];
        const query = searchQuery.trim().toLowerCase();
        const results: Array<{ element: ElementItemType; groupTitle: string; groupId: string | undefined }> = [];
        for (const group of filteredGroups) {
            for (const el of group.elements || []) {
                if (
                    el.name.toLowerCase().includes(query) ||
                    el.description.toLowerCase().includes(query)
                ) {
                    results.push({ element: el, groupTitle: group.title, groupId: group.id });
                }
            }
        }
        return results;
    }, [isSearching, searchQuery, filteredGroups]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
            <SheetContent
                side="right"
                showOverlay={false}
                showCloseButton={false}
                onInteractOutside={() => onOpenChange(false)}
                className={cn(
                    "w-full gap-0 overflow-hidden border-l border-white/10 bg-[#141414] p-0 text-white shadow-2xl",
                    "sm:max-w-[420px]"
                )}
                onKeyDown={handleKeyDown}
            >
                {/* Header */}
                <SheetHeader className="shrink-0 gap-0 space-y-0 border-b border-white/10 bg-[#171717] px-5 py-4">
                    <div className="flex items-center gap-3">
                        {activeCategoryId && !isSearching ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-zinc-400 hover:bg-white/10 hover:text-white shrink-0"
                                onClick={handleBack}
                                aria-label="Back"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                                <Layers className="h-4 w-4 text-zinc-400" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <SheetTitle className="text-base font-semibold text-white leading-tight">
                                {activeCategoryId && !isSearching
                                    ? (activeDrillGroup?.title ?? t("title"))
                                    : t("title")}
                            </SheetTitle>
                            <SheetDescription className="text-xs text-zinc-500 mt-0.5">
                                {activeCategoryId && !isSearching
                                    ? `${activeDrillGroup?.elements?.length ?? 0} ta node`
                                    : t("description")}
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {/* Search */}
                <div className="shrink-0 px-4 py-3 border-b border-white/10 bg-[#141414]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                            ref={searchInputRef}
                            placeholder={t("searchPlaceholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-primary/40"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    {isSearching ? (
                        /* ---- SEARCH RESULTS (flat, grouped by category) ---- */
                        <ScrollArea className="h-0 flex-1">
                            {searchResults.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-sm text-zinc-500 gap-2">
                                    <Search className="h-8 w-8 opacity-30" />
                                    <span>{t("noResults")}</span>
                                </div>
                            ) : (
                                <div className="p-3 flex flex-col gap-1">
                                    {searchResults.map(({ element, groupTitle, groupId }, idx) => (
                                        <NodeCard
                                            key={`${element.triggerId}-${idx}`}
                                            element={element}
                                            isActive={false}
                                            groupLabel={groupTitle}
                                            groupId={groupId}
                                            onClick={() => handleSelect(element)}
                                            onMouseEnter={() => {}}
                                            refCallback={() => {}}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    ) : activeCategoryId && activeDrillGroup ? (
                        /* ---- DRILLED-IN NODE LIST ---- */
                        <ScrollArea className="h-0 flex-1">
                            <div className="p-3 flex flex-col gap-1">
                                {activeDrillGroup.elements?.map((element, idx) => (
                                    <NodeCard
                                        key={`${element.triggerId}-${idx}`}
                                        element={element}
                                        isActive={idx === activeElementIndex}
                                        groupId={activeDrillGroup.id}
                                        onClick={() => handleSelect(element)}
                                        onMouseEnter={() => setActiveElementIndex(idx)}
                                        refCallback={(el) => {
                                            if (el) elementRefs.current.set(idx, el);
                                            else elementRefs.current.delete(idx);
                                        }}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        /* ---- CATEGORY LIST ---- */
                        <ScrollArea className="h-0 flex-1">
                            <div className="py-3 flex flex-col gap-1 px-3">
                                {filteredGroups.map((group, index) => {
                                    const isActive = index === activeCategoryIndexNav;
                                    return (
                                        <button
                                            key={group.id || index}
                                            ref={(el) => {
                                                if (el && group.id) categoryRefs.current.set(group.id, el);
                                                else if (group.id) categoryRefs.current.delete(group.id);
                                            }}
                                            onMouseEnter={() => setActiveCategoryIndexNav(index)}
                                            onClick={() => group.id && handleDrillIn(group.id)}
                                            className={cn(
                                                "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors",
                                                "hover:bg-white/5",
                                                isActive && "bg-white/8 ring-1 ring-white/10"
                                            )}
                                        >
                                            {/* Category icon */}
                                            <div className={cn(
                                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-sm",
                                                group.id === "must-have"
                                                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                                    : "bg-white/5 border-white/10 text-zinc-400"
                                            )}>
                                                {getCategoryIcon(group, index)}
                                            </div>
                                            {/* Title + count */}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-white truncate">
                                                    {/* Strip emoji prefix from titles like "🚀 Triggerlar" */}
                                                    {group.title.replace(/^[\p{Emoji_Presentation}\p{Emoji}\s]+/u, "").trim() || group.title}
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-0.5">
                                                    {group.elements?.length ?? 0} ta node
                                                </div>
                                            </div>
                                            {/* Node count badge + chevron */}
                                            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ---- Internal NodeCard component ----

interface NodeCardProps {
    element: ElementItemType;
    isActive: boolean;
    groupLabel?: string;
    /** The sidebar group id (e.g. "sidebar-triggers") — used to derive the role badge. */
    groupId?: string;
    onClick: () => void;
    onMouseEnter: () => void;
    refCallback: (el: HTMLButtonElement | null) => void;
}

function NodeCard({ element, isActive, groupLabel, groupId, onClick, onMouseEnter, refCallback }: NodeCardProps) {
    const role = getRoleLabel(groupId);
    return (
        <button
            ref={refCallback}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            className={cn(
                "group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                "hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40",
                isActive && "bg-white/8 ring-1 ring-white/10"
            )}
        >
            <div
                className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-base",
                    element.color || "bg-white/5 border-white/10 text-zinc-300"
                )}
            >
                {element.icon}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-medium leading-tight text-white truncate">
                        {element.name}
                    </span>
                    {role && (
                        <span className={cn(
                            "shrink-0 inline-flex items-center rounded px-1 py-0 text-[9px] font-semibold tracking-widest uppercase border leading-none h-3.5",
                            getRoleBadgeClass(role)
                        )}>
                            {role}
                        </span>
                    )}
                </div>
                <span className="text-xs leading-snug text-zinc-500 line-clamp-2">
                    {element.description}
                </span>
                {groupLabel && (
                    <span className="text-[10px] text-zinc-600 mt-0.5 truncate">
                        {groupLabel.replace(/^[\p{Emoji_Presentation}\p{Emoji}\s]+/u, "").trim()}
                    </span>
                )}
            </div>
        </button>
    );
}
