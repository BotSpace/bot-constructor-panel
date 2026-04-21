"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";
import { SendTextMessageNodeData } from "@/features/bot-constructor/nodes/types";
import { useButtonGeneratorState } from "./hook/useButtonGeneratorState";
import { KeyboardPreview } from "./components/KeyboardPreview";
import { EditButtonDialog } from "./components/EditButtonDialog";
import { ButtonConfig, KeyboardConfig } from "./types";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  MessageSquare,
  Rows3,
  Settings2,
} from "lucide-react";
import { useFlowStore } from "../../store";
import { Badge } from "@/components/ui/badge";
import { calculateActiveButtonCount } from "./utils";
import { cn } from "@/lib/utils";
import { InlineForm } from "./components/InlineForm";
import { ReplyForm } from "./components/ReplyForm";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
    setCurrentButtons,
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

  useEffect(() => {
    if (!isOpen) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveCurrentState(), 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
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

  useEffect(() => {
    const newCount = calculateActiveButtonCount({
      active: activeTab,
      inline: hookKeyboards.inline,
      reply: hookKeyboards.reply,
    });
    setButtonCount((prev) => (prev !== newCount ? newCount : prev));
  }, [hookKeyboards, activeTab]);

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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="relative w-full">
          <Button variant="outline" className="w-full gap-2">
            <LayoutGrid className="h-4 w-4" />
            Tugmalarni sozlash
            {buttonCount > 0 && (
              <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                {buttonCount}
              </Badge>
            )}
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="p-0 gap-0 w-[92vw] !max-w-[1280px] h-[88vh] flex flex-col overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Tugmalar sozlamasi</DialogTitle>
        </VisuallyHidden>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center gap-4 px-5 py-3.5 border-b bg-background">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayoutGrid className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Tugmalar sozlamasi</p>
            <p className="text-xs text-muted-foreground">Inline yoki reply tugmalar yarating</p>
          </div>

          {/* Inline / Reply switcher */}
          <div className="flex items-center gap-1 rounded-lg border bg-muted/50 p-1">
            <button
              onClick={() => setActiveTab("inline")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
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
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === "reply"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Reply
            </button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────── */}
        <div className="flex-1 grid grid-cols-5 overflow-hidden min-h-0">

          {/* Left: Form panel */}
          <div className="col-span-2 flex flex-col border-r overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            </div>

            {/* Reply options (only for reply tab) */}
            {activeTab === "reply" && (
              <div className="shrink-0 border-t p-4 space-y-2.5 bg-muted/30">
                <div className="flex items-center gap-2 mb-1">
                  <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Klaviatura sozlamalari
                  </span>
                </div>
                {replyOptionItems.map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <Checkbox
                      id={`reply-opt-${item.key}`}
                      checked={item.checked}
                      onCheckedChange={(v) =>
                        handleReplyOptionChange(item.key, v === true)
                      }
                    />
                    <Label
                      htmlFor={`reply-opt-${item.key}`}
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
              <div className="shrink-0 mx-4 mb-4 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                Tanlangan qator to'la. Yangi qator qo'shing yoki boshqa qatorni tanlang.
              </div>
            )}
          </div>

          {/* Right: Preview panel */}
          <div className="col-span-3 overflow-hidden flex flex-col bg-muted/20">
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
          </div>
        </div>
      </DialogContent>

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
    </Dialog>
  );
}
