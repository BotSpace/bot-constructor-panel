// FAYL: constructor/components/ButtonGenerator/components/PreviewButton.tsx (YANGI)
import { Button } from "@/components/ui/button";
import { Trash2, Database, Edit2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonConfig } from "@/features/bot-constructor/panels/ButtonGenerator/types";
import { getIconForButton } from "@/features/bot-constructor/panels/ButtonGenerator/utils";
import { localizedToString } from "@/features/bot-constructor/fields/generic-fields/i18n-helpers";
import { Badge } from "@/components/ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface PreviewButtonProps {
  button: ButtonConfig;
  onRemove?: () => void; // Optional - collection buttonlarda bo'lmasligi mumkin
  onEdit?: () => void;
  isFullWidth: boolean;
  isDraggable?: boolean;
}

export const PreviewButton = ({
  button,
  onRemove,
  onEdit,
  isFullWidth,
  isDraggable = true,
}: PreviewButtonProps) => {
  const isCollectionButton = !!button.collectionData;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: button.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isFullWidth ? "flex-grow" : "flex-1",
        isDragging && "opacity-50 z-50"
      )}
    >
      <Button
        variant="outline"
        className={cn(
          "w-full truncate pr-16 pl-8",
          isCollectionButton && "border-primary/40 bg-primary/5",
          isDraggable && "cursor-grab active:cursor-grabbing"
        )}
      >
        {/* Drag Handle */}
        {isDraggable && (
          <div
            {...attributes}
            {...listeners}
            className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {getIconForButton(button)}
        <span className="truncate">{localizedToString(button.text)}</span>

        {isCollectionButton && button.collectionData?.layout && (
          <Badge
            variant="outline"
            className="ml-auto mr-2 text-[10px] px-1.5 py-0 h-4 bg-primary/10 border-primary/30"
          >
            <Database className="h-2.5 w-2.5 mr-0.5" />
            {button.collectionData.layout.columns}×{button.collectionData.layout.rows}
          </Badge>
        )}
      </Button>

      {/* Action Buttons */}
      <div className="absolute -top-1 -right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && !isCollectionButton && (
          <Button
            variant="secondary"
            size="icon"
            className="h-5 w-5 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
        {onRemove && (
          <Button
            variant="destructive"
            size="icon"
            className="h-5 w-5 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
