import { cn } from "@/lib/utils";
import { AlertCircle, CornerDownLeft, GripVertical, Trash2 } from "lucide-react";
import { ButtonConfig } from "../types";
import { PreviewButton } from "./PreviewButton";
import {
  SortableContext,
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
  onRemoveRow?: () => void;
}

export const ButtonRow = ({
  id,
  row,
  isSelected,
  isFull,
  maxButtons,
  onSelect,
  onRemoveButton,
  onEditButton,
  onRemoveRow,
}: ButtonRowProps) => {
  // Row o'zini o'zi sortlash uchun (Vertical sort)
  const {
    attributes: rowAttributes,
    listeners: rowListeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "Row",
      row: row,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Collection (grid) buttonlar uchun mantiq
  const hasCollectionButton = row.some(btn => btn.collectionData?.layout);
  const collectionButton = row.find(b => b.collectionData?.layout);
  const gridColumns = collectionButton?.collectionData?.layout?.columns || row.length || 1;

  // Collection bo'lmasa oddiy horizontal sortable ro'yxat
  const sortableItems = row.map(btn => btn.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group min-h-[60px]", // min-h qo'shdik, bo'sh qatorga ham drop qilish oson bo'lishi uchun
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* Row ichidagi buttonlar uchun SortableContext */}
      <SortableContext
        items={sortableItems}
        strategy={horizontalListSortingStrategy}
        disabled={hasCollectionButton} // Collection buttonlarni sort qilib bo'lmaydi
      >
        <div
          className={cn(
            "p-2 rounded-md transition-all border border-transparent cursor-pointer relative h-full flex flex-col justify-center",
            {
              "bg-primary/10 border-primary/50": isSelected,
              "hover:bg-accent": !isSelected,
              "bg-muted/50 border-dashed border-2 border-muted-foreground/20": row.length === 0, // Bo'sh qator ko'rinishi
            }
          )}
          onClick={onSelect}
        >
          {/* Row Drag Handle (Chap tarafda) */}
          <div
            {...rowAttributes}
            {...rowListeners}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Row Delete Button */}
          {onRemoveRow && (
            <Button
              variant="destructive"
              size="icon"
              className={cn(
                "absolute h-6 w-6 rounded-full transition-opacity z-10 -top-2 -left-2 opacity-0 group-hover:opacity-100",
                hasCollectionButton && "top-2 right-2 left-auto"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveRow();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Grid layout (Buttonlar joylashuvi) */}
          <div
            className="grid gap-2 ml-6"
            style={{
              gridTemplateColumns: `repeat(${hasCollectionButton ? gridColumns : row.length}, minmax(0, 1fr))`
            }}
          >
            {row.length > 0 ? (
              row.map((button) => (
                <PreviewButton
                  key={button.id}
                  button={button}
                  onRemove={() => onRemoveButton(button.id)}
                  onEdit={onEditButton ? () => onEditButton(button.id) : undefined}
                  isFullWidth={false}
                  isDraggable={!hasCollectionButton} // PreviewButton ichida useSortable bor
                />
              ))
            ) : (
              <div className="flex gap-2 items-center justify-center py-2 text-sm text-muted-foreground w-full">
                <CornerDownLeft className="h-4 w-4 mr-2 text-primary" />
                {isSelected
                  ? "Tugma qo'shing yoki boshqa qatordan sudrab keling"
                  : "Tanlash uchun bosing"}
              </div>
            )}
          </div>
        </div>
      </SortableContext>

      {isFull && !hasCollectionButton && (
        <div className="flex items-center text-xs text-amber-600 dark:text-amber-500 mt-1.5 px-2">
          <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
          Limit: {maxButtons} ta.
        </div>
      )}
    </div>
  );
};
