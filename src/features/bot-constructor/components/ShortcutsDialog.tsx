"use client";

import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  descriptionKey: string;
}

interface ShortcutGroup {
  titleKey: string;
  icon: string;
  shortcuts: ShortcutItem[];
}

const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;

const mod = isMac ? "⌘" : "Ctrl";

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    titleKey: "groupGeneral",
    icon: "⚡",
    shortcuts: [
      { keys: [mod, "S"], descriptionKey: "save" },
      { keys: [mod, "Z"], descriptionKey: "undo" },
      { keys: [mod, "Y"], descriptionKey: "redo" },
      { keys: [mod, "Shift", "Z"], descriptionKey: "redo" },
      { keys: [mod, "F"], descriptionKey: "search" },
      { keys: ["?"], descriptionKey: "showShortcuts" },
    ],
  },
  {
    titleKey: "groupNodes",
    icon: "🔲",
    shortcuts: [
      { keys: [mod, "A"], descriptionKey: "selectAll" },
      { keys: [mod, "C"], descriptionKey: "copy" },
      { keys: [mod, "V"], descriptionKey: "paste" },
      { keys: [mod, "D"], descriptionKey: "duplicate" },
      { keys: ["Delete"], descriptionKey: "delete" },
      { keys: ["Backspace"], descriptionKey: "delete" },
      { keys: [mod, "Space"], descriptionKey: "addNode" },
    ],
  },
  {
    titleKey: "groupView",
    icon: "👁",
    shortcuts: [
      { keys: [mod, "I"], descriptionKey: "autoLayout" },
      { keys: [mod, "+"], descriptionKey: "zoomIn" },
      { keys: [mod, "-"], descriptionKey: "zoomOut" },
      { keys: [mod, "0"], descriptionKey: "fitView" },
    ],
  },
  {
    titleKey: "groupPanel",
    icon: "📋",
    shortcuts: [
      { keys: [mod, "K"], descriptionKey: "searchPanel" },
      { keys: [mod, "`"], descriptionKey: "debugConsole" },
      { keys: [mod, "R"], descriptionKey: "reloadBot" },
      { keys: [mod, "D"], descriptionKey: "runStopBot" },
      { keys: [mod, "N"], descriptionKey: "addNodeModal" },
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
  const t = useTranslations("editor.shortcuts");
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
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pb-5 grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.titleKey} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 pt-2 border-t border-border/50">
                <span>{group.icon}</span>
                {t(group.titleKey)}
              </h3>
              <div className="flex flex-col gap-1.5">
                {group.shortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-xs text-muted-foreground truncate">
                      {t(shortcut.descriptionKey)}
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
            <span className="ml-2">{t("toggleHint")}</span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
