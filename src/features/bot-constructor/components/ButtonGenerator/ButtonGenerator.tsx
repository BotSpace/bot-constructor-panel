"use client";

import { useState, ReactNode, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";
import { KeyboardConfig } from "@/features/bot-constructor/nodes/actions/TextMessageNode/types";
import { useButtonGeneratorState } from "./hook/useButtonGeneratorState";
import { ControlPanel } from "./components/ControlPanel";
import { KeyboardPreview } from "./components/KeyboardPreview";

interface ButtonGeneratorProps {
  initialKeyboard?: KeyboardConfig;
  onSave: (keyboard: KeyboardConfig) => void;
  children: ReactNode;
}

export function ButtonGenerator({
  initialKeyboard,
  onSave,
  children,
}: ButtonGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);

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
      <DialogContent className="sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Tugmalarni Sozlash</DialogTitle>
        </VisuallyHidden>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-4 h-full">
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
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
