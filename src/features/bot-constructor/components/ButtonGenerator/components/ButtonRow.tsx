// FAYL: constructor/components/ButtonGenerator/components/ButtonRow.tsx (YANGI)
import { cn } from "@/lib/utils";
import { AlertCircle, CornerDownLeft, GripVertical, Trash2 } from "lucide-react";
import { ButtonConfig } from "../types";
import { PreviewButton } from "./PreviewButton";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";

interface ButtonRowProps {
  id: string;
  row: ButtonConfig[];
  rowIndex: number;
  isSelected: boolean;
  isFull: boolean;
  maxButtons: number;
  onSelect: () => void;
  onRemoveButton: (buttonId: string) => void;
  onEditButton?: (buttonId: string) => void;
  onReorderButtons?: (reorderedButtons: ButtonConfig[]) => void;
  onRemoveRow?: () => void;
}

export const ButtonRow = ({
  id,
  row,
  rowIndex,
  isSelected,
  isFull,
  maxButtons,
  onSelect,
  onRemoveButton,
  onEditButton,
  onReorderButtons,
  onRemoveRow,
}: ButtonRowProps) => {
  // Row DnD
  const {
    attributes: rowAttributes,
    listeners: rowListeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Collection button bo'lsa, expand qilamiz
  const expandedButtons: ButtonConfig[] = [];
  const hasCollectionButton = row.some(btn => btn.collectionData?.layout);
  
  row.forEach((button) => {
    if (button.collectionData?.layout) {
      // Collection button - layout bo'yicha ko'p tugmalar yaratish
      const { columns, rows } = button.collectionData.layout;
      const totalButtons = columns * rows;
      
      for (let i = 0; i < totalButtons; i++) {
        expandedButtons.push({
          ...button,
          id: `${button.id}-expanded-${i}`,
          text: `${button.text.replace('📦 ', '')} ${i + 1}`,
          // collectionData ni o'chirmaslik - badge uchun kerak
        });
      }
    } else {
      // Oddiy button
      expandedButtons.push(button);
    }
  });

  // Layout columns bo'yicha grid yaratish
  const collectionButton = row.find(b => b.collectionData?.layout);
  const gridColumns = collectionButton?.collectionData?.layout?.columns || expandedButtons.length;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorderButtons && !hasCollectionButton) {
      const oldIndex = row.findIndex((btn) => btn.id === active.id);
      const newIndex = row.findIndex((btn) => btn.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedButtons = arrayMove(row, oldIndex, newIndex);
        onReorderButtons(reorderedButtons);
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50 z-50"
      )}
    >
      {expandedButtons.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={row.map((btn) => btn.id)}
            strategy={horizontalListSortingStrategy}
            disabled={hasCollectionButton}
          >
            <div
              className={cn(
                "p-2 rounded-md transition-all border border-transparent cursor-pointer relative",
                {
                  "bg-primary/10 border-primary/50": isSelected,
                  "hover:bg-accent": !isSelected,
                  "cursor-not-allowed opacity-75": isFull && !isSelected,
                }
              )}
              onClick={onSelect}
            >
              {/* Row Drag Handle */}
              <div 
                {...rowAttributes} 
                {...rowListeners}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Row Delete Button */}
              {onRemoveRow && row.length > 0 && (
                <Button
                  variant="destructive"
                  size="icon"
                  className={cn(
                    "absolute h-6 w-6 rounded-full transition-opacity z-10",
                    hasCollectionButton 
                      ? "top-2 right-2 opacity-0 group-hover:opacity-100" // Collection - o'ng yuqorida
                      : "-top-2 -left-2 opacity-0 group-hover:opacity-100" // Oddiy - chap yuqorida
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRow();
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}

              {/* Grid layout */}
              <div 
                className="grid gap-2 ml-6"
                style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
              >
                {!hasCollectionButton ? (
                  // Oddiy buttonlar - DnD bilan
                  row.map((button) => (
                    <PreviewButton
                      key={button.id}
                      button={button}
                      onRemove={() => onRemoveButton(button.id)}
                      onEdit={onEditButton ? () => onEditButton(button.id) : undefined}
                      isFullWidth={false}
                      isDraggable={!hasCollectionButton}
                    />
                  ))
                ) : (
                  // Collection buttonlar - delete yo'q (rowda bor)
                  expandedButtons.map((button) => (
                    <PreviewButton
                      key={button.id}
                      button={button}
                      onRemove={undefined} // Collection buttonlarda individual delete yo'q
                      isFullWidth={false}
                      isDraggable={false}
                    />
                  ))
                )}
              </div>
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div
          className={cn(
            "flex gap-2 items-center p-2 rounded-md transition-all border border-transparent cursor-pointer",
            {
              "bg-primary/10 border-primary/50": isSelected,
              "hover:bg-accent": !isSelected,
            }
          )}
          onClick={onSelect}
        >
          <div className="text-sm text-muted-foreground w-full flex items-center">
            <CornerDownLeft className="h-4 w-4 mr-2 text-primary" />
            {isSelected
              ? "Chapdan yangi tugma qo'shing"
              : "Shu qatorga qo'shish uchun bosing"}
          </div>
        </div>
      )}
      {isFull && !hasCollectionButton && (
        <div className="flex items-center text-xs text-amber-600 dark:text-amber-500 mt-1.5 px-2">
          <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          Bu qatorning limiti to'lgan ({maxButtons} ta).
        </div>
      )}
      {hasCollectionButton && (
        <div className="flex items-center text-xs text-primary mt-1.5 px-2">
          <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          Collection qatori - boshqa button qo'shib bo'lmaydi
        </div>
      )}
    </div>
  );
};
