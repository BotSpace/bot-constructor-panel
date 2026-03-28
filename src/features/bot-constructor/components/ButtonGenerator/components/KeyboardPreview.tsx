"use client";

import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid } from "lucide-react";
import { ButtonConfig } from "../types";
import { ButtonRow } from "./ButtonRow";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
  pointerWithin,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { createPortal } from "react-dom";
import { PreviewButton } from "./PreviewButton";

interface KeyboardPreviewProps {
  buttons: ButtonConfig[][];
  selectedRowIndex: number;
  maxButtonsPerRow: number;
  onSelectRow: (index: number) => void;
  onAddRow: () => void;
  onRemoveButton: (rowIndex: number, buttonId: string) => void;
  onEditButton?: (rowIndex: number, buttonId: string) => void;
  onChangeLayout: (newLayout: ButtonConfig[][]) => void;
  onRemoveRow?: (rowIndex: number) => void;
}

export const KeyboardPreview = ({
  buttons,
  selectedRowIndex,
  maxButtonsPerRow,
  onSelectRow,
  onAddRow,
  onRemoveButton,
  onEditButton,
  onChangeLayout,
  onRemoveRow,
}: KeyboardPreviewProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<ButtonConfig | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findRowIndex = (id: string) =>
    buttons.findIndex((row) => row.some((btn) => btn.id === id));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    if (!active.id.toString().startsWith("row-")) {
      const rowIndex = findRowIndex(active.id as string);
      if (rowIndex !== -1) {
        const btn = buttons[rowIndex].find((b) => b.id === active.id);
        if (btn) setActiveButton(btn);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId.startsWith("row-")) return;
    const activeRowIndex = findRowIndex(activeId);
    let overRowIndex = findRowIndex(overId);
    if (overId.startsWith("row-")) overRowIndex = parseInt(overId.replace("row-", ""));
    if (activeRowIndex === -1 || overRowIndex === -1 || activeRowIndex === overRowIndex) return;
    if (buttons[overRowIndex].length >= maxButtonsPerRow) return;
    const newButtons = buttons.map((row) => [...row]);
    const activeBtnIndex = newButtons[activeRowIndex].findIndex((b) => b.id === activeId);
    if (activeBtnIndex === -1) return;
    const [movedBtn] = newButtons[activeRowIndex].splice(activeBtnIndex, 1);
    if (overId.startsWith("row-")) {
      newButtons[overRowIndex].push(movedBtn);
    } else {
      const overBtnIndex = newButtons[overRowIndex].findIndex((b) => b.id === overId);
      const insertIndex = overBtnIndex >= 0 ? overBtnIndex : newButtons[overRowIndex].length;
      newButtons[overRowIndex].splice(insertIndex, 0, movedBtn);
    }
    onChangeLayout(newButtons);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveButton(null);
    if (!over) return;
    if (active.id.toString().startsWith("row-") && over.id.toString().startsWith("row-")) {
      const oldIndex = parseInt(active.id.toString().replace("row-", ""));
      const newIndex = parseInt(over.id.toString().replace("row-", ""));
      if (oldIndex !== newIndex) onChangeLayout(arrayMove(buttons, oldIndex, newIndex));
      return;
    }
    const activeRowIndex = findRowIndex(active.id as string);
    const overRowIndex = over.id.toString().startsWith("row-")
      ? parseInt(over.id.toString().replace("row-", ""))
      : findRowIndex(over.id as string);
    if (activeRowIndex !== -1 && overRowIndex !== -1 && activeRowIndex === overRowIndex) {
      const currentRow = buttons[activeRowIndex];
      const oldIndex = currentRow.findIndex((b) => b.id === active.id);
      const newIndex = currentRow.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newButtons = [...buttons];
        newButtons[activeRowIndex] = arrayMove(currentRow, oldIndex, newIndex);
        onChangeLayout(newButtons);
      }
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: "0.5" } },
    }),
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Preview header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Ko'rinish</span>
          {buttons.length > 0 && (
            <span className="text-xs text-muted-foreground">
              — {buttons.length} qator, {buttons.flat().length} tugma
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddRow();
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Yangi qator
        </Button>
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-y-auto p-4">
        {buttons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 text-muted-foreground">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <LayoutGrid className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium">Tugmalar yo'q</p>
            <p className="text-xs mt-1 opacity-70">
              Chap tarafdan tugma qo'shing yoki "Yangi qator" bosing
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={buttons.map((_, idx) => `row-${idx}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {buttons.map((row, rowIndex) => (
                  <ButtonRow
                    key={`row-${rowIndex}`}
                    id={`row-${rowIndex}`}
                    row={row}
                    rowIndex={rowIndex}
                    isSelected={selectedRowIndex === rowIndex}
                    isFull={row.length >= maxButtonsPerRow}
                    maxButtons={maxButtonsPerRow}
                    onSelect={() => onSelectRow(rowIndex)}
                    onRemoveButton={(buttonId) => onRemoveButton(rowIndex, buttonId)}
                    onEditButton={
                      onEditButton
                        ? (buttonId) => onEditButton(rowIndex, buttonId)
                        : undefined
                    }
                    onRemoveRow={
                      onRemoveRow && buttons.length > 0
                        ? () => onRemoveRow(rowIndex)
                        : undefined
                    }
                  />
                ))}
              </div>
            </SortableContext>

            {createPortal(
              <DragOverlay dropAnimation={dropAnimation}>
                {activeId ? (
                  activeId.startsWith("row-") ? (
                    <div className="w-full opacity-90 rotate-1 bg-background border p-2 rounded-lg text-sm">
                      Qator {parseInt(activeId.split("-")[1]) + 1}
                    </div>
                  ) : activeButton ? (
                    <div className="w-[150px] cursor-grabbing">
                      <PreviewButton
                        button={activeButton}
                        onRemove={() => {}}
                        isDraggable={false}
                        isFullWidth={true}
                      />
                    </div>
                  ) : null
                ) : null}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        )}
      </div>
    </div>
  );
};
