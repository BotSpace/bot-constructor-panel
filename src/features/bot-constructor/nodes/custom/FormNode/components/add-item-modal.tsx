import React, { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { ButtonGenerator } from "@/features/bot-constructor/components";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FormNodeData } from "../types";
import { TypeSelector } from "@/features/bot-constructor/nodes/triggers/MessageTrigger/components/TypeSelector";
import { FilterSelector } from "@/features/bot-constructor/nodes/triggers/MessageTrigger/components/FilterSelector";
import { ParameterInput } from "@/features/bot-constructor/nodes/triggers/MessageTrigger/components/ParameterInput";
import { getFiltersForType } from "@/features/bot-constructor/nodes/triggers/MessageTrigger/utils";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { KeyboardConfig } from "@/features/bot-constructor/components/ButtonGenerator/types";
import { Input } from "@/components/ui/input";
import { varibulNameValidator } from "@/lib/input-validators";

type Props = {
  onAddItem: (item: FormNodeData["items"][0]) => void;
  onEditItem?: (item: FormNodeData["items"][0]) => void;
  editingItem?: FormNodeData["items"][0] | null;
  trigger?: React.ReactNode;
  onClose?: () => void;
};

function AddItemModal({
  onAddItem,
  onEditItem,
  editingItem,
  trigger,
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<MessageTriggerValueTypes | "">("");
  const [stateKey, setStateKey] = useState("");
  const [stateKeyError, setStateKeyError] = useState<string>("");

  const [filter, setFilter] = useState<string>("any");
  const [context, setContext] = useState<FormNodeData["items"][0]["context"]>({
    value: undefined,
    radius: undefined,
    size: undefined,
  });
  const [messageText, setMessageText] = useState("");
  const [keyboard, setKeyboard] = useState<KeyboardConfig>({
    active: "inline",
    inline: [],
    reply: [],
  });

  const isEditMode = !!editingItem;

  // Open modal when editingItem is set
  useEffect(() => {
    if (editingItem) {
      setOpen(true);
    }
  }, [editingItem]);

  // Populate form when editing
  useEffect(() => {
    if (editingItem && open) {
      setType(editingItem.type);
      setFilter(editingItem.filter || "any");
      setContext(
        editingItem.context || {
          value: undefined,
          radius: undefined,
          size: undefined,
        }
      );
      setMessageText(editingItem.question || "");
      setStateKey(editingItem.key || "");
      setStateKeyError("");
      setKeyboard(
        editingItem.keyboard || {
          active: "inline",
          inline: [],
          reply: [],
        }
      );
    } else if (!editingItem && open) {
      // Reset form when opening in add mode
      setType("");
      setFilter("any");
      setContext({ value: undefined, radius: undefined, size: undefined });
      setMessageText("");
      setStateKey("");
      setStateKeyError("");
      setKeyboard({
        active: "inline",
        inline: [],
        reply: [],
      });
    }
  }, [editingItem, open]);

  const { filtersForType, showFilterSection } = useMemo(() => {
    const filters = getFiltersForType(type);
    const showFilter = type && type !== "any";

    return {
      filtersForType: filters,
      showFilterSection: showFilter,
    };
  }, [type]);

  const handleTypeChange = (newType: string) => {
    setType(newType as MessageTriggerValueTypes);
    setFilter("any");
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
  };

  const handleContextUpdate = (
    newContext: FormNodeData["items"][0]["context"] | undefined
  ) => {
    setContext(
      newContext || { value: undefined, radius: undefined, size: undefined }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!type) {
      return;
    }

    // Validate stateKey
    if (!stateKey || !varibulNameValidator(stateKey)) {
      return;
    }

    const item: FormNodeData["items"][0] = {
      key: stateKey,
      question: messageText,
      type,
      filter: filter || "any",
      context,
      keyboard,
      order: editingItem?.order ?? 0, // Preserve order when editing
    };

    if (isEditMode && onEditItem) {
      onEditItem(item);
    } else {
      onAddItem(item);
    }

    // Reset form
    setType("");
    setFilter("any");
    setContext({ value: undefined, radius: undefined, size: undefined });
    setMessageText("");
    setStateKey("");
    setKeyboard({
      active: "inline",
      inline: [],
      reply: [],
    });
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Clear editing item when modal is closed
    if (!newOpen && editingItem && onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <form onSubmit={handleSubmit}>
        {trigger ? (
          <DialogTrigger asChild>{trigger}</DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              <Plus className="w-4 h-4" /> Qo'shish
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Elementni tahrirlash" : "Yangi element qo'shish"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Element ma'lumotlarini o'zgartiring."
                : "Forma uchun yangi element qo'shing. Xabar turi va filterni tanlang."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Xabar matni</Label>
              <Textarea
                placeholder="Masalan, Iltimos, ismingizni kiriting..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">state key</Label>
              <Input
                value={stateKey}
                onChange={(e) => {
                  const value = e.target.value;
                  setStateKey(value);
                  // Validate on change
                  if (value && !varibulNameValidator(value)) {
                    setStateKeyError(
                      "O'zgaruvchi nomi noto'g'ri formatda. Faqat harflar, raqamlar va pastki chiziq (_) ishlatish mumkin. Birinchi belgi harf yoki pastki chiziq bo'lishi kerak."
                    );
                  } else {
                    setStateKeyError("");
                  }
                }}
                onBlur={() => {
                  // Validate on blur
                  if (stateKey && !varibulNameValidator(stateKey)) {
                    setStateKeyError(
                      "O'zgaruvchi nomi noto'g'ri formatda. Faqat harflar, raqamlar va pastki chiziq (_) ishlatish mumkin. Birinchi belgi harf yoki pastki chiziq bo'lishi kerak."
                    );
                  } else {
                    setStateKeyError("");
                  }
                }}
                aria-invalid={!!stateKeyError}
                placeholder="masalan: user_name"
              />
              {stateKeyError && (
                <p className="text-xs text-destructive mt-1">{stateKeyError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Tugmalar</Label>
              <ButtonGenerator
                initialKeyboard={keyboard}
                node_id={""}
                onChange={(newKeyboard) => {
                  setKeyboard(newKeyboard);
                }}
              />
            </div>

            <Separator />

            {/* Xabarlarni filter qilib olish */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Xabar turi</Label>
              <TypeSelector
                value={type || ""}
                onValueChange={handleTypeChange}
              />
            </div>

            {showFilterSection && (
              <div className="space-y-1.5 animate-in fade-in-50">
                <Label className="text-xs text-gray-400">Filter</Label>
                <FilterSelector
                  value={filter || ""}
                  onValueChange={handleFilterChange}
                  options={filtersForType}
                />
              </div>
            )}

            {showFilterSection && filter && filter !== "any" && (
              <div className="space-y-1.5 animate-in fade-in-50">
                <Label className="text-xs text-gray-400">Parametr</Label>
                <ParameterInput
                  filter={filter}
                  context={context}
                  onContextUpdate={handleContextUpdate}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Bekor qilish
              </Button>
            </DialogClose>
            <Button
              onClick={handleSubmit}
              disabled={!type || !stateKey || !varibulNameValidator(stateKey)}
            >
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default AddItemModal;
