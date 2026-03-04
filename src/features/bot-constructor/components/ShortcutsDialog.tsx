"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  icon: string;
  shortcuts: ShortcutItem[];
}

const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;

const mod = isMac ? "⌘" : "Ctrl";

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Umumiy",
    icon: "⚡",
    shortcuts: [
      { keys: [mod, "S"], description: "Saqlash" },
      { keys: [mod, "Z"], description: "Bekor qilish (Undo)" },
      { keys: [mod, "Y"], description: "Qaytarish (Redo)" },
      { keys: [mod, "Shift", "Z"], description: "Qaytarish (Redo)" },
      { keys: [mod, "F"], description: "Qidirish" },
      { keys: ["?"], description: "Shortcutlarni ko'rish" },
    ],
  },
  {
    title: "Node boshqaruvi",
    icon: "🔲",
    shortcuts: [
      { keys: [mod, "A"], description: "Hammasini tanlash" },
      { keys: [mod, "C"], description: "Nusxa olish (Copy)" },
      { keys: [mod, "V"], description: "Qo'yish (Paste)" },
      { keys: [mod, "D"], description: "Dublikat qilish" },
      { keys: ["Delete"], description: "O'chirish" },
      { keys: ["Backspace"], description: "O'chirish" },
      { keys: [mod, "Space"], description: "Node qo'shish" },
    ],
  },
  {
    title: "Ko'rinish",
    icon: "👁",
    shortcuts: [
      { keys: [mod, "I"], description: "Formatlash (auto-layout)" },
      { keys: [mod, "+"], description: "Kattalashtirish (Zoom in)" },
      { keys: [mod, "-"], description: "Kichiklashtirish (Zoom out)" },
      { keys: [mod, "0"], description: "Ekranga moslashtirish" },
    ],
  },
  {
    title: "Panel",
    icon: "📋",
    shortcuts: [
      { keys: [mod, "K"], description: "Qidirish paneli" },
      { keys: [mod, "`"], description: "Debug konsol" },
      { keys: [mod, "N"], description: "Node qo'shish modali" },
    ],
  },
];

function KeyBadge({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
      {children}
    </kbd>
  );
}

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  // "?" shortcut to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      )
        return;

      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-auto gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle>Klaviatura yorliqlari</DialogTitle>
          <DialogDescription>
            Tezroq ishlash uchun klaviatura kombinatsiyalari
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5 grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 pt-2 border-t border-border/50">
                <span>{group.icon}</span>
                {group.title}
              </h3>
              <div className="flex flex-col gap-1.5">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-xs text-muted-foreground truncate">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {shortcut.keys.map((key, ki) => (
                        <React.Fragment key={ki}>
                          {ki > 0 && (
                            <span className="text-[10px] text-muted-foreground/50 mx-0.5">
                              +
                            </span>
                          )}
                          <KeyBadge>{key}</KeyBadge>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t bg-muted/30 text-center">
          <span className="text-[10px] text-muted-foreground">
            <KeyBadge>?</KeyBadge>
            <span className="ml-2">bosib bu oynani ochish/yopish mumkin</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
