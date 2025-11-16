// FAYL: constructor/components/ButtonGenerator/components/KeyboardPreview.tsx (YANGI)
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { ButtonConfig } from "../types";
import { ButtonRow } from "./ButtonRow";

interface KeyboardPreviewProps {
  buttons: ButtonConfig[][];
  selectedRowIndex: number;
  maxButtonsPerRow: number;
  onSelectRow: (index: number) => void;
  onAddRow: () => void;
  onRemoveButton: (rowIndex: number, buttonId: string) => void;
}

export const KeyboardPreview = ({
  buttons,
  selectedRowIndex,
  maxButtonsPerRow,
  onSelectRow,
  onAddRow,
  onRemoveButton,
}: KeyboardPreviewProps) => (
  <div className="md:col-span-8 flex flex-col gap-3 rounded-lg border bg-muted p-4 h-full w-full">
    <div className="flex justify-between items-center mb-2">
      <Label className="text-muted-foreground">Tugmalar ko'rinishi</Label>
      <Button variant="ghost" size="sm" onClick={onAddRow}>
        <Plus className="mr-2 h-4 w-4" /> Yangi Qator
      </Button>
    </div>
    <div className="flex flex-col gap-2 flex-grow min-h-[200px] bg-background/50 p-2 rounded-md">
      {buttons.map((row, rowIndex) => (
        <ButtonRow
          key={rowIndex}
          row={row}
          rowIndex={rowIndex}
          isSelected={selectedRowIndex === rowIndex}
          isFull={row.length >= maxButtonsPerRow}
          maxButtons={maxButtonsPerRow}
          onSelect={() => onSelectRow(rowIndex)}
          onRemoveButton={(buttonId) => onRemoveButton(rowIndex, buttonId)}
        />
      ))}
    </div>
  </div>
);
