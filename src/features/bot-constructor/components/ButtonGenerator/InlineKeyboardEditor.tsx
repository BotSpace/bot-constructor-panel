"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useButtonGeneratorState } from "@/features/bot-constructor/components/ButtonGenerator/hook/useButtonGeneratorState";
import { KeyboardPreview } from "@/features/bot-constructor/components/ButtonGenerator/components/KeyboardPreview";
import { EditButtonDialog } from "@/features/bot-constructor/components/ButtonGenerator/components/EditButtonDialog";
import { ButtonConfig, KeyboardConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";
import { MessageSquare, Rows3, Settings2 } from "lucide-react";
import { useFlowStore } from "@/features/bot-constructor/store";
import { cn } from "@/lib/utils";
import { InlineForm } from "@/features/bot-constructor/components/ButtonGenerator/components/InlineForm";
import { ReplyForm } from "@/features/bot-constructor/components/ButtonGenerator/components/ReplyForm";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface InlineKeyboardEditorProps {
  node_id: string;
  initialKeyboard: KeyboardConfig;
}

export function InlineKeyboardEditor({
  node_id,
  initialKeyboard,
}: InlineKeyboardEditorProps) {
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
    setCurrentButtons,
    isCurrentRowFull,
    MAX_BUTTONS_PER_ROW,
    handleAddButton,
    handleAddRow,
    handleRemoveButton,
    handleEditButton,
    handleRemoveRow,
    getFinalKeyboardConfig,
    replyOptions,
    handleReplyOptionChange,
  } = useButtonGeneratorState(true, initialKeyboard);

  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => {
      const finalConfig = getFinalKeyboardConfig();
      updateNodeData(node_id, { keyboard: finalConfig });
    }, 300);
    return () => {
      if (saveRef.current) clearTimeout(saveRef.current);
    };
    // getFinalKeyboardConfig reference-stable emas, dependency sifatida qo'shmaymiz
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentButtons, activeTab, replyOptions, node_id]);

  const handleLayoutChange = useCallback(
    (newLayout: ButtonConfig[][]) => {
      setCurrentButtons(() => newLayout);
    },
    [setCurrentButtons]
  );

  const replyOptionItems = [
    {
      key: "remove_after_use" as const,
      label: "Ishlatib bo'lgach o'chib ketsin",
      checked: replyOptions.remove_after_use,
    },
    {
      key: "resize_keyboard" as const,
      label: "Tugmalarni ekranga moslab kichraytirish",
      checked: replyOptions.resize_keyboard,
    },
    {
      key: "one_time_keyboard" as const,
      label: "Bosilgach avtomatik yashirinsin",
      checked: replyOptions.one_time_keyboard,
    },
    {
      key: "is_persistent" as const,
      label: "Doimiy ko'rinib tursin",
      checked: replyOptions.is_persistent,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tab switcher: Inline / Reply */}
      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
        <button
          onClick={() => setActiveTab("inline")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            activeTab === "inline"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Rows3 className="h-3.5 w-3.5" />
          Inline
        </button>
        <button
          onClick={() => setActiveTab("reply")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            activeTab === "reply"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Reply
        </button>
      </div>

      {/* Form: InlineForm yoki ReplyForm */}
      {activeTab === "inline" ? (
        <InlineForm
          onAdd={handleAddButton}
          disabled={isCurrentRowFull}
          nodeId={node_id}
        />
      ) : (
        <ReplyForm
          onAdd={handleAddButton}
          disabled={isCurrentRowFull}
          nodeId={node_id}
        />
      )}

      {/* Reply options — faqat reply tabda */}
      {activeTab === "reply" && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Klaviatura sozlamalari
            </span>
          </div>
          {replyOptionItems.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <Checkbox
                id={`ike-reply-opt-${node_id}-${item.key}`}
                checked={item.checked}
                onCheckedChange={(v) =>
                  handleReplyOptionChange(item.key, v === true)
                }
              />
              <Label
                htmlFor={`ike-reply-opt-${node_id}-${item.key}`}
                className="text-xs text-muted-foreground cursor-pointer leading-tight"
              >
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      )}

      {/* Row full warning */}
      {isCurrentRowFull && (
        <div className="px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
          Tanlangan qator to'la. Yangi qator qo'shing yoki boshqa qatorni tanlang.
        </div>
      )}

      {/* KeyboardPreview */}
      <KeyboardPreview
        buttons={currentButtons}
        selectedRowIndex={selectedRowIndex}
        maxButtonsPerRow={MAX_BUTTONS_PER_ROW}
        onSelectRow={setSelectedRowIndex}
        onAddRow={handleAddRow}
        onRemoveButton={handleRemoveButton}
        onEditButton={(rowIndex, buttonId) => {
          const button = currentButtons[rowIndex]?.find(
            (b) => b.id === buttonId
          );
          if (button) setEditingButton({ rowIndex, buttonId, button });
        }}
        onChangeLayout={handleLayoutChange}
        onRemoveRow={handleRemoveRow}
      />

      {/* EditButtonDialog — modal, tugma tahrirlash uchun */}
      <EditButtonDialog
        button={editingButton?.button ?? null}
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
    </div>
  );
}
