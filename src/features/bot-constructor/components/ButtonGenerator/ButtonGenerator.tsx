"use client";

import { useState, ReactNode, useEffect, useRef, useEffectEvent } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";
import { SendTextMessageNodeData } from "@/features/bot-constructor/nodes/actions/TextMessageNode/types";
import { useButtonGeneratorState } from "./hook/useButtonGeneratorState";
import { ControlPanel } from "./components/ControlPanel";
import { KeyboardPreview } from "./components/KeyboardPreview";
import { EditButtonDialog } from "./components/EditButtonDialog";
import { ButtonConfig, KeyboardConfig } from "./types";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";
import { useFlowStore } from "../../store";
import { Badge } from "@/components/ui/badge";
import { calculateActiveButtonCount } from "./utils";

interface ButtonGeneratorProps {
  initialKeyboard: KeyboardConfig;
  node_id: string; // Node ID uchun (agar kerak bo'lsa)
}

export function ButtonGenerator({
  initialKeyboard: keyboards,
  node_id,
}: ButtonGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonCount, setButtonCount] = useState(() => 0);

  const [editingButton, setEditingButton] = useState<{
    rowIndex: number;
    buttonId: string;
    button: ButtonConfig;
  } | null>(null);

  const {
    activeTab,
    setActiveTab,
    selectedRowIndex,
    setSelectedRowIndex,
    currentButtons,
    isCurrentRowFull,
    MAX_BUTTONS_PER_ROW,
    handleAddButton,
    handleAddRow,
    handleRemoveButton,
    handleEditButton,
    handleReorderButtons,
    handleRemoveRow,
    handleReorderRows,
    getFinalKeyboardConfig,
  } = useButtonGeneratorState(isOpen, keyboards);

  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Ma'lumotlarni global store'da yangilash uchun markaziy funksiya
  const handleUpdate = (update: Partial<SendTextMessageNodeData>) => {
    updateNodeData(node_id, update);
  };

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleUpdate({ keyboard: getFinalKeyboardConfig() });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isOpen, currentButtons, activeTab]);

  useEffect(() => {
    setButtonCount(calculateActiveButtonCount(keyboards));
  }, [keyboards]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative w-full">
          <Button variant="outline" className="w-full">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Tugmalarni Sozlash
          </Button>
          {buttonCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 px-1.5"
            >
              {buttonCount}
            </Badge>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[90%] h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Tugmalarni Sozlash</DialogTitle>
        </VisuallyHidden>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4 h-full w-full">
          <ControlPanel
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddButton={handleAddButton}
            isCurrentRowFull={isCurrentRowFull}
          />
          <KeyboardPreview
            buttons={currentButtons}
            selectedRowIndex={selectedRowIndex}
            maxButtonsPerRow={MAX_BUTTONS_PER_ROW}
            onSelectRow={setSelectedRowIndex}
            onAddRow={handleAddRow}
            onRemoveButton={handleRemoveButton}
            onEditButton={(rowIndex, buttonId) => {
              // Find button to edit
              const button = currentButtons[rowIndex]?.find(
                (b) => b.id === buttonId
              );
              if (button) {
                setEditingButton({ rowIndex, buttonId, button });
              }
            }}
            onReorderButtons={handleReorderButtons}
            onRemoveRow={handleRemoveRow}
            onReorderRows={handleReorderRows}
          />
        </div>

        {/* Edit Button Dialog */}
        <EditButtonDialog
          button={editingButton?.button || null}
          isOpen={!!editingButton}
          onClose={() => setEditingButton(null)}
          onSave={(updatedButton) => {
            if (editingButton) {
              handleEditButton(
                editingButton.rowIndex,
                editingButton.buttonId,
                updatedButton
              );
              setEditingButton(null);
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
