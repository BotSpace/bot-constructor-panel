"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";

interface ButtonGeneratorProps {
  initialKeyboard: KeyboardConfig;
  node_id: string;
  onChange?: (keyboard: KeyboardConfig) => void;
}

export function ButtonGenerator({
  initialKeyboard: keyboards,
  node_id,
  onChange,
}: ButtonGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonCount, setButtonCount] = useState(0);

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
    setCurrentButtons, // Hookdan qaytishi kerak
    isCurrentRowFull,
    MAX_BUTTONS_PER_ROW,
    handleAddButton,
    handleAddRow,
    handleRemoveButton,
    handleEditButton,
    handleRemoveRow,
    getFinalKeyboardConfig,
    keyboards: hookKeyboards,
    replyOptions,
    handleReplyOptionChange,
  } = useButtonGeneratorState(isOpen, keyboards);

  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleUpdate = (update: Partial<SendTextMessageNodeData>) => {
    if (node_id) {
      updateNodeData(node_id, update);
    }
  };

  const saveCurrentState = () => {
    const finalConfig = getFinalKeyboardConfig();
    if (onChange) {
      onChange(finalConfig);
    } else if (node_id) {
      handleUpdate({ keyboard: finalConfig });
    }
  };

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Avtosave logikasi
  useEffect(() => {
    if (!isOpen) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveCurrentState();
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [isOpen, currentButtons, activeTab, replyOptions, onChange, node_id]);

  const handleOpenChange = (open: boolean) => {
    if (!open && isOpen) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      saveCurrentState();
    }
    setIsOpen(open);
  };

  // 2. Button count logikasi (TUZATILDI)
  useEffect(() => {
    const newCount = calculateActiveButtonCount({
      active: activeTab,
      inline: hookKeyboards.inline,
      reply: hookKeyboards.reply,
    });
    // Faqat qiymat haqiqatan o'zgarganda state yangilanadi
    setButtonCount((prev) => (prev !== newCount ? newCount : prev));
  }, [hookKeyboards, activeTab]);

  // 3. Layout o'zgarishini boshqarish (TUZATILDI)
  // useCallback ishlatildi va state yangilash callback orqali bajarildi
  const handleLayoutChange = useCallback(
    (newLayout: ButtonConfig[][]) => {
      setCurrentButtons(() => newLayout);
    },
    [setCurrentButtons]
  );

  return (
    <>
      <FieldGroup className="pb-2">
        <Field orientation="horizontal">
          <Checkbox
            id="remove-after-use"
            name="remove-after-use"
            checked={replyOptions.remove_after_use}
            onCheckedChange={(checked) => {
              console.log(replyOptions);
              handleReplyOptionChange("remove_after_use", checked === true)
            }}
          />
          <FieldLabel htmlFor="remove-after-use">
            Ishlatib bo'lgach o'chib ketishi kerak.
          </FieldLabel>
        </Field>
      </FieldGroup>

      <FieldGroup className="pb-2">
        <Field orientation="horizontal">
          <Checkbox
            id="resize-keyboard"
            name="resize-keyboard"
            checked={replyOptions.resize_keyboard}
            onCheckedChange={(checked) =>
              handleReplyOptionChange("resize_keyboard", checked === true)
            }
          />
          <FieldLabel htmlFor="resize-keyboard">
            Tugmalarni ekran o‘lchamiga moslab kichraytirish.
          </FieldLabel>
        </Field>
      </FieldGroup>

      <FieldGroup className="pb-2">
        <Field orientation="horizontal">
          <Checkbox
            id="one-time-keyboard"
            name="one-time-keyboard"
            checked={replyOptions.one_time_keyboard}
            onCheckedChange={(checked) =>
              handleReplyOptionChange("one_time_keyboard", checked === true)
            }
          />
          <FieldLabel htmlFor="one-time-keyboard">
            Tugma bosilgach, klaviatura avtomatik yashirinishi.
          </FieldLabel>
        </Field>
      </FieldGroup>

      <FieldGroup className="pb-2">
        <Field orientation="horizontal">
          <Checkbox
            id="is-persistent"
            name="is-persistent"
            checked={replyOptions.is_persistent}
            onCheckedChange={(checked) =>
              handleReplyOptionChange("is_persistent", checked === true)
            }
          />
          <FieldLabel htmlFor="is-persistent">
            Klaviatura doimiy ochiq turishi (yashirish tugmasini olib tashlaydi).
          </FieldLabel>
        </Field>
      </FieldGroup>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
              onChangeLayout={handleLayoutChange}
              onEditButton={(rowIndex, buttonId) => {
                const button = currentButtons[rowIndex]?.find(
                  (b) => b.id === buttonId
                );
                if (button) {
                  setEditingButton({ rowIndex, buttonId, button });
                }
              }}
              onRemoveRow={handleRemoveRow}
            />
          </div>

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
    </>
  );
}
