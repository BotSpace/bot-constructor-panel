import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ConstructorData } from "@/features/bot-constructor/data";
import { KeyboardConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";

interface FormItem {
  question: string;
  order: number;
  type: MessageTriggerValueTypes;
  filter: string;
  key: string;
  context: {
    value?: string;
    radius?: { lat?: string; lng?: string; km?: string };
    size?: { min?: string; max?: string };
  };
  keyboard?: KeyboardConfig;
}

interface FormItemProps {
  item: FormItem;
  index: number;
  onRemove: () => void;
  onEdit?: () => void;
}

export function FormItem({ item, index, onRemove, onEdit }: FormItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `form-item-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const messageType = ConstructorData.MessageTypes.find(
    (type) => type.value === item.type
  );
  const Icon = messageType?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
        isDragging && "opacity-50 z-50"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {Icon && (
            <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          )}
          <Badge variant="outline" className="text-xs">
            {messageType?.label || item.type}
          </Badge>
        </div>
        <p className="text-sm text-foreground line-clamp-2 break-words">
          {item.question || "(Savol yozilmagan)"}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
