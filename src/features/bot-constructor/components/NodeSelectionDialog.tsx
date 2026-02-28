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
import { ElementItemType } from "@/types/element-types";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

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
    const [activeIndex, setActiveIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    const elements = useElements();

    // Must have element ID lari
    const MUST_HAVE_IDS = useMemo(
        () => ["SendTextMessageNode", "MessageTriggerNode", "EditMessageNode"] as const,
        []
    );

    // Must have elementlarni barcha guruhlardan yig'ish
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

    // Barcha filtrlangan elementlarning tekis ro'yxati
    const filteredGroups = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        // Must have guruhi
        const mustHaveGroup = {
            title: "⭐ Must have",
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

        // Must have bo'sh bo'lmasa, boshiga qo'shish
        return mustHaveGroup.elements.length > 0
            ? [mustHaveGroup, ...baseGroups]
            : baseGroups;
    }, [elements, searchQuery, mustHaveElements]);

    // Tekis (flat) elementlar ro'yxati — arrow navigation uchun
    const flatElements = useMemo(() => {
        const items: ElementItemType[] = [];
        filteredGroups.forEach((group) => {
            group.elements?.forEach((el) => items.push(el));
        });
        return items;
    }, [filteredGroups]);

    // Search o'zgarganda active indexni resetlash
    useEffect(() => {
        setActiveIndex(0);
    }, [searchQuery]);

    // Dialog ochilganda resetlash
    useEffect(() => {
        if (open) {
            setSearchQuery("");
            setActiveIndex(0);
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [open]);

    // Active element ko'rinishga scroll qilish
    useEffect(() => {
        const el = itemRefs.current.get(activeIndex);
        el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, [activeIndex]);

    const handleSelect = useCallback(
        (element: ElementItemType) => {
            onSelect(element);
            setSearchQuery("");
            onOpenChange(false);
        },
        [onSelect, onOpenChange]
    );

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const total = flatElements.length;
            if (total === 0) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setActiveIndex((prev) => (prev + 1) % total);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setActiveIndex((prev) => (prev - 1 + total) % total);
                    break;
                case "Enter":
                    e.preventDefault();
                    if (flatElements[activeIndex]) {
                        handleSelect(flatElements[activeIndex]);
                    }
                    break;
            }
        },
        [flatElements, activeIndex, handleSelect]
    );

    // Har bir elementning tekis indexini hisoblash
    let flatIndex = -1;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[520px] gap-0 p-0 overflow-hidden"
                onKeyDown={handleKeyDown}
            >
                <DialogHeader className="px-5 pt-5 pb-3">
                    <DialogTitle>Yangi node turini tanlang</DialogTitle>
                    <DialogDescription>
                        Edge ulanadigan yangi node turini tanlang
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

                {/* Element ro'yxati */}
                <ScrollArea className="h-[400px] border-t">
                    <div className="p-3">
                        {filteredGroups.length === 0 ? (
                            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                                Hech narsa topilmadi.
                            </div>
                        ) : (
                            filteredGroups.map((group, groupIndex) => (
                                <div key={group.id || groupIndex} className="mb-4 last:mb-0">
                                    {/* Guruh sarlavhasi */}
                                    <div className="px-2 pb-2 pt-1">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {group.title}
                                        </span>
                                    </div>

                                    {/* Elementlar */}
                                    <div className="grid gap-1">
                                        {group.elements?.map((element) => {
                                            flatIndex++;
                                            const currentIndex = flatIndex;
                                            const isActive = currentIndex === activeIndex;

                                            return (
                                                <button
                                                    key={element.triggerId}
                                                    ref={(el) => {
                                                        if (el) {
                                                            itemRefs.current.set(currentIndex, el);
                                                        } else {
                                                            itemRefs.current.delete(currentIndex);
                                                        }
                                                    }}
                                                    onClick={() => handleSelect(element)}
                                                    onMouseEnter={() => setActiveIndex(currentIndex)}
                                                    className={cn(
                                                        "group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                                                        "hover:bg-accent/50 focus-visible:outline-none",
                                                        "active:scale-[0.99] transition-transform duration-100",
                                                        isActive && "bg-accent/50 ring-1 ring-ring/30"
                                                    )}
                                                >
                                                    {/* Icon */}
                                                    <div
                                                        className={cn(
                                                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-lg",
                                                            element.color
                                                        )}
                                                    >
                                                        {element.icon}
                                                    </div>

                                                    {/* Kontent */}
                                                    <div className="flex flex-col gap-0.5 min-w-0">
                                                        <span className="text-sm font-medium leading-tight text-foreground group-hover:text-foreground">
                                                            {element.name}
                                                        </span>
                                                        <span className="text-xs leading-snug text-muted-foreground line-clamp-1">
                                                            {element.description}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
