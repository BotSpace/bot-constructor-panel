// FAYL: constructor/components/ButtonGenerator/components/KeyboardPreview.tsx

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
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
  pointerWithin, // <-- MUHIM: Barqaror collision detection uchun
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Tasodifiy draglarni oldini olish
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findRowIndex = (id: string) => {
    return buttons.findIndex((row) => row.some((btn) => btn.id === id));
  };

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

    // Row drag qilinayotgan bo'lsa aralashmaymiz
    if (activeId.startsWith("row-")) return;

    const activeRowIndex = findRowIndex(activeId);
    let overRowIndex = findRowIndex(overId);

    if (overId.startsWith("row-")) {
      overRowIndex = parseInt(overId.replace("row-", ""));
    }

    // Agar indekslar noto'g'ri bo'lsa yoki button o'z qatorida bo'lsa -> QAYTAMIZ
    // Bu cheksiz siklni to'xtatuvchi asosiy shart
    if (
      activeRowIndex === -1 ||
      overRowIndex === -1 ||
      activeRowIndex === overRowIndex
    ) {
      return;
    }

    // Limit tekshiruvi
    if (buttons[overRowIndex].length >= maxButtonsPerRow) return;

    // O'zgartirishni amalga oshirish
    const newButtons = buttons.map((row) => [...row]);
    const activeBtnIndex = newButtons[activeRowIndex].findIndex(
      (b) => b.id === activeId
    );

    // Agar active button topilmasa (xavfsizlik uchun)
    if (activeBtnIndex === -1) return;

    const [movedBtn] = newButtons[activeRowIndex].splice(activeBtnIndex, 1);

    if (overId.startsWith("row-")) {
      newButtons[overRowIndex].push(movedBtn);
    } else {
      const overBtnIndex = newButtons[overRowIndex].findIndex(
        (b) => b.id === overId
      );

      const insertIndex = overBtnIndex >= 0
        ? overBtnIndex // pointerWithin ishlatilganda oddiyroq logika ma'qul
        : newButtons[overRowIndex].length;

      newButtons[overRowIndex].splice(insertIndex, 0, movedBtn);
    }

    onChangeLayout(newButtons);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveButton(null);

    if (!over) return;

    // 1. Qatorlarni joyini almashtirish
    if (
      active.id.toString().startsWith("row-") &&
      over.id.toString().startsWith("row-")
    ) {
      const oldIndex = parseInt(active.id.toString().replace("row-", ""));
      const newIndex = parseInt(over.id.toString().replace("row-", ""));

      if (oldIndex !== newIndex) {
        const reorderedRows = arrayMove(buttons, oldIndex, newIndex);
        onChangeLayout(reorderedRows);
      }
      return;
    }

    // 2. Buttonlarni bir qator ichida sortlash
    const activeRowIndex = findRowIndex(active.id as string);
    const overRowIndex = over.id.toString().startsWith("row-")
      ? parseInt(over.id.toString().replace("row-", ""))
      : findRowIndex(over.id as string);

    if (
      activeRowIndex !== -1 &&
      overRowIndex !== -1 &&
      activeRowIndex === overRowIndex
    ) {
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
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  return (
    <div className="md:col-span-7 flex flex-col gap-3 rounded-lg border bg-muted p-4 h-full w-full">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-muted-foreground">Tugmalar ko'rinishi</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddRow();
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Yangi Qator
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        // MUHIM: pointerWithin - konteynerlar aro drag qilishda barqarorroq
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={buttons.map((_, idx) => `row-${idx}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 flex-grow min-h-[200px] bg-background/50 p-2 rounded-md">
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
                onRemoveButton={(buttonId) =>
                  onRemoveButton(rowIndex, buttonId)
                }
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
                <div className="w-full opacity-90 rotate-1 bg-background border p-2 rounded">
                  Row {parseInt(activeId.split("-")[1]) + 1}
                </div>
              ) : activeButton ? (
                <div className="w-[150px] cursor-grabbing">
                  <PreviewButton
                    button={activeButton}
                    onRemove={() => { }}
                    isDraggable={false} // Overlayda qayta drag bo'lmasligi shart
                    isFullWidth={true}
                  />
                </div>
              ) : null
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};
