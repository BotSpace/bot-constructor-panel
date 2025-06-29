import { AppButton } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Drag-n-Drop uchun alohida tugma komponenti
function DraggableButton({
  button,
  isSelected,
  onSelectButton,
}: {
  button: AppButton;
  isSelected: boolean;
  onSelectButton: (btn: AppButton) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: button.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center"
    >
      <button
        onClick={() => onSelectButton(button)}
        className={`py-2 px-4 rounded-md text-center text-sm bg-gray-200 dark:bg-gray-700 w-full truncate ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
      >
        {button.text}
      </button>
    </div>
  );
}

interface TelegramPreviewProps {
  keyboard: AppButton[][];
  selectedButton: AppButton | null;
  onSelectButton: (button: AppButton) => void;
}

export function TelegramPreview({
  keyboard,
  selectedButton,
  onSelectButton,
}: TelegramPreviewProps) {
  return (
    <Card className="flex-1 flex flex-col">
      <CardHeader>
        <CardTitle>Vizual ko'rinish (Preview)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end p-2 bg-blue-100/30 dark:bg-blue-900/10 rounded-b-xl">
        {/* Placeholder for chat message */}
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-bl-none shadow-sm max-w-xs self-start mb-4">
          <p className="text-sm">Bu sizning botingiz yuborgan xabar.</p>
          <p className="text-xs text-gray-400 text-right mt-1">11:30</p>
        </div>

        {/* Keyboard Area */}
        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-t-lg">
          <div className="space-y-1">
            {keyboard.map((row, rowIndex) => (
              <SortableContext
                key={rowIndex}
                items={row.map((btn) => btn.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${
                      row.length > 0 ? row.length : 1
                    }, minmax(0, 1fr))`,
                  }}
                >
                  {row.map((button) => (
                    <DraggableButton
                      key={button.id}
                      button={button}
                      isSelected={selectedButton?.id === button.id}
                      onSelectButton={onSelectButton}
                    />
                  ))}
                </div>
              </SortableContext>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
