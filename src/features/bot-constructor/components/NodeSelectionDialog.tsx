"use client";

import React, { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { useElements } from "@/features/bot-constructor/data/useElements";
import { ElementItemType } from "@/types/element-types";

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
    const [selectedNodeType, setSelectedNodeType] = useState<string>("");
    const elements = useElements();

    // Barcha elementlarni combobox uchun format qilish
    const comboboxOptions: ComboboxOption[] = useMemo(() => {
        const options: ComboboxOption[] = [];

        elements.forEach((group) => {
            group.elements?.forEach((element) => {
                if (element.triggerId) {
                    options.push({
                        value: element.triggerId,
                        label: `${element.icon} ${element.name}`,
                        group: group.title,
                    });
                }
            });
        });

        return options;
    }, [elements]);

    const handleConfirm = () => {
        if (!selectedNodeType) return;

        // ElementItemType ni topish
        let selectedElement: ElementItemType | null = null;
        for (const group of elements) {
            const element = group.elements?.find(
                (el) => el.triggerId === selectedNodeType
            );
            if (element) {
                selectedElement = element;
                break;
            }
        }

        if (selectedElement) {
            onSelect(selectedElement);
            setSelectedNodeType("");
            onOpenChange(false);
        }
    };

    const handleCancel = () => {
        setSelectedNodeType("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yangi node turini tanlang</DialogTitle>
                    <DialogDescription>
                        Edge ulanadigan yangi node turini tanlang
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Combobox
                        options={comboboxOptions}
                        value={selectedNodeType}
                        onValueChange={setSelectedNodeType}
                        placeholder="Node turini tanlang..."
                        searchPlaceholder="Qidirish..."
                        emptyText="Hech narsa topilmadi."
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        Bekor qilish
                    </Button>
                    <Button onClick={handleConfirm} disabled={!selectedNodeType}>
                        Yaratish
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
