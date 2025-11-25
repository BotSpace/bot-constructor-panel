"use client";

import { useState, ReactNode, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  KeyboardConfig,
  SendTextMessageNodeData,
} from "@/features/bot-constructor/nodes/actions/TextMessageNode/types";
import { useButtonGeneratorState } from "./hook/useButtonGeneratorState";
import { ControlPanel } from "./components/ControlPanel";
import { KeyboardPreview } from "./components/KeyboardPreview";
import { EditButtonDialog } from "./components/EditButtonDialog";
import { ButtonConfig } from "./types";

interface ButtonGeneratorProps {
  initialKeyboard?: KeyboardConfig;
  onSave: (keyboard: KeyboardConfig) => void;
  children: ReactNode;
  data?: SendTextMessageNodeData; // Collection ma'lumotlari uchun
}

export function ButtonGenerator({
  initialKeyboard,
  onSave,
  children,
  data,
}: ButtonGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
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
  } = useButtonGeneratorState(isOpen, initialKeyboard);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onSave(getFinalKeyboardConfig());
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isOpen, currentButtons, activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
            data={data}
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
              const button = currentButtons[rowIndex]?.find(b => b.id === buttonId);
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
