// FAYL: constructor/components/ButtonGenerator/components/ButtonRow.tsx (YANGI)
import { cn } from "@/lib/utils";
import { AlertCircle, CornerDownLeft } from "lucide-react";
import { ButtonConfig } from "../types";
import { PreviewButton } from "./PreviewButton";

interface ButtonRowProps {
  row: ButtonConfig[];
  rowIndex: number;
  isSelected: boolean;
  isFull: boolean;
  maxButtons: number;
  onSelect: () => void;
  onRemoveButton: (buttonId: string) => void;
}

export const ButtonRow = ({
  row,
  rowIndex,
  isSelected,
  isFull,
  maxButtons,
  onSelect,
  onRemoveButton,
}: ButtonRowProps) => (
  <div>
    <div
      className={cn(
        "flex gap-2 items-center p-2 rounded-md transition-all border border-transparent cursor-pointer",
        {
          "bg-primary/10 border-primary/50": isSelected,
          "hover:bg-accent": !isSelected,
          "cursor-not-allowed opacity-75": isFull && !isSelected,
        }
      )}
      onClick={onSelect}
    >
      {row.length > 0 ? (
        row.map((button) => (
          <PreviewButton
            key={button.id}
            button={button}
            onRemove={() => onRemoveButton(button.id)}
            isFullWidth={row.length === 1}
          />
        ))
      ) : (
        <div className="text-sm text-muted-foreground w-full flex items-center">
          <CornerDownLeft className="h-4 w-4 mr-2 text-primary" />
          {isSelected
            ? "Chapdan yangi tugma qo'shing"
            : "Shu qatorga qo'shish uchun bosing"}
        </div>
      )}
    </div>
    {isFull && (
      <div className="flex items-center text-xs text-amber-600 dark:text-amber-500 mt-1.5 px-2">
        <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
        Bu qatorning limiti to'lgan ({maxButtons} ta).
      </div>
    )}
  </div>
);
