"use client";

import { useState } from "react";
import { AppButton } from "./types";
import { TelegramPreview } from "./telegram-preview";
import { ConfigSidebar } from "./config-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code, Plus, Trash2 } from "lucide-react";
import { CodeDialog } from "./code-dialog";
import { toast } from "sonner";

// Drag-and-Drop uchun importlar
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export function ButtonBuilder() {
  // keyboard - tugmalarning 2D massivi. Har bir ichki massiv bitta qatorni bildiradi.
  const [keyboard, setKeyboard] = useState<AppButton[][]>([[]]);
  const [selectedButton, setSelectedButton] = useState<AppButton | null>(null);
  const [newButtonText, setNewButtonText] = useState("");
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleAddNewButton = () => {
    if (!newButtonText.trim()) {
      toast.error("Tugma matni bo'sh bo'lishi mumkin emas!");
      return;
    }
    const newButton: AppButton = {
      id: crypto.randomUUID(),
      text: newButtonText.trim(),
    };
    const newKeyboard = [...keyboard];
    // Agar oxirgi qator bo'sh bo'lmasa yoki qatorlar yo'q bo'lsa, yangi qatorga qo'sh
    if (
      newKeyboard.length === 0 ||
      newKeyboard[newKeyboard.length - 1].length >= 3
    ) {
      newKeyboard.push([newButton]);
    } else {
      newKeyboard[newKeyboard.length - 1].push(newButton);
    }
    setKeyboard(newKeyboard);
    setNewButtonText("");
    toast.success(`"${newButton.text}" tugmasi qo'shildi!`);
  };

  const handleAddNewRow = () => {
    setKeyboard([...keyboard, []]);
    toast.info("Yangi qator qo'shildi.");
  };

  const handleClearAll = () => {
    setKeyboard([[]]);
    setSelectedButton(null);
    toast.warning("Barcha tugmalar o'chirildi.");
  };

  const handleUpdateButton = (updatedButton: AppButton) => {
    const newKeyboard = keyboard.map((row) =>
      row.map((btn) => (btn.id === updatedButton.id ? updatedButton : btn))
    );
    setKeyboard(newKeyboard);
    setSelectedButton(updatedButton);
  };

  const handleDeleteButton = (buttonId: string) => {
    const newKeyboard = keyboard
      .map((row) => row.filter((btn) => btn.id !== buttonId))
      .filter((row) => row.length > 0);
    setKeyboard(newKeyboard.length > 0 ? newKeyboard : [[]]);
    setSelectedButton(null);
    toast.success("Tugma o'chirildi.");
  };

  // Drag-n-Drop logikasi
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const activeContainer = active.data.current?.sortable.containerId;
      const overContainer = over?.data.current?.sortable.containerId;
      const activeIndex = active.data.current?.sortable.index;
      const overIndex = over?.data.current?.sortable.index;

      let newKeyboard = [...keyboard];

      if (activeContainer === overContainer) {
        // Qator ichida harakat
        const rowIndex = newKeyboard.findIndex((row) =>
          row.some((btn) => btn.id === activeContainer)
        );
        if (rowIndex !== -1) {
          newKeyboard[rowIndex] = arrayMove(
            newKeyboard[rowIndex],
            activeIndex,
            overIndex
          );
        }
      } else {
        // Qatorlar o'rtasida harakat
        const activeRowIndex = newKeyboard.findIndex((row) =>
          row.some((btn) => btn.id === active.id)
        );
        const overRowIndex = newKeyboard.findIndex((row) =>
          row.some((btn) => btn.id === over?.id)
        );

        // Bu qismni yanada mukammallashtirish mumkin. Hozircha sodda variant.
        // Hozirgi logikada elementni topib, uni yangi qatorga o'tkazish kerak.
        // dnd-kit bilan bu murakkabroq bo'lishi mumkin, shuning uchun boshlang'ich versiya uchun qoldiramiz.
        console.log("Qatorlararo harakat hali implementatsiya qilinmagan.");
      }
      setKeyboard(newKeyboard);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-4 p-4 h-[calc(100vh-4rem)]">
        {/* Chap taraf - boshqaruv va preview */}
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Tugma qo'shish</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Tugma matni..."
                value={newButtonText}
                onChange={(e) => setNewButtonText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNewButton()}
              />
              <Button onClick={handleAddNewButton}>
                <Plus className="h-4 w-4 mr-2" /> Qo'shish
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={handleAddNewRow}>
                Yangi qator
              </Button>
              <Button variant="destructive" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-2" /> Hammasini tozalash
              </Button>
              <Button
                variant="secondary"
                className="ml-auto"
                onClick={() => setIsCodeDialogOpen(true)}
              >
                <Code className="h-4 w-4 mr-2" /> Kodni generatsiya qilish
              </Button>
            </div>
          </Card>

          {/* Telegram Preview */}
          <TelegramPreview
            keyboard={keyboard}
            selectedButton={selectedButton}
            onSelectButton={setSelectedButton}
          />
        </div>

        {/* O'ng taraf - konfiguratsiya paneli */}
        <ConfigSidebar
          selectedButton={selectedButton}
          onUpdateButton={handleUpdateButton}
          onDeleteButton={handleDeleteButton}
          onClearSelection={() => setSelectedButton(null)}
        />

        <CodeDialog
          isOpen={isCodeDialogOpen}
          setIsOpen={setIsCodeDialogOpen}
          keyboard={keyboard}
        />
      </div>
    </DndContext>
  );
}
