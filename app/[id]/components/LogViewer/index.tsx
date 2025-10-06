// FAYL: app/constructor/components/LogViewer/index.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDebounce } from "use-debounce";
import { useWebSocketLogs } from "@/hooks/useWebSocketLogs";
import { cn } from "@/lib/utils";
import { themes, ThemeName } from "@/constructor/data/themes";

import { LogViewerHeader } from "./Header";
import { LogList } from "./LogList";
import { ResizeHandler } from "./ResizeHandler";
import { OpenButton } from "./OpenButton";
import { toast } from "sonner";

export default function LogViewer() {
  const [isVisible, setIsVisible] = useState(false);
  const [height, setHeight] = useState(300);
  const [searchTerm, setSearchTerm] = useState("");
  const [theme, setTheme] = useState<ThemeName>("dark");

  const { logs, clearLogs } = useWebSocketLogs(
    "ws://localhost:8080",
    isVisible
  );
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  // Keybinding (Ctrl + `)
  useEffect(() => {
    // Klaviatura bosilganda chaqiriladigan funksiya
    const handleKeyDown = (e: KeyboardEvent) => {
      // Agar 'Ctrl' va '`' (backtick) tugmalari birga bosilsa...
      if (e.ctrlKey && e.code === "Backquote") {
        e.preventDefault(); // Brauzerning standart harakatini bekor qilamiz
        // `isVisible` holatini teskarisiga o'zgartiramiz (toggle)
        setIsVisible((prevIsVisible) => !prevIsVisible);
      }
    };

    // Global 'keydown' hodisasiga bizning funksiyamizni qo'shamiz
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup funksiyasi: Komponent yo'q bo'lganda (masalan, boshqa sahifaga o'tilganda)
    // xotirada ortiqcha qolib ketmasligi uchun event listener'ni o'chiradi. Bu juda muhim!
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Bo'sh massiv [] bu effekt faqat bir marta ishlashini ta'minlaydi.

  // Balandlikni o'zgartirish logikasi
  const startResizing = useCallback(
    (mouseDownEvent: React.MouseEvent) => {
      const startY = mouseDownEvent.clientY;
      const startHeight = height;

      const doDrag = (e: MouseEvent) => {
        const newHeight = startHeight - (e.clientY - startY);
        if (newHeight > 100 && newHeight < window.innerHeight * 0.9) {
          setHeight(newHeight);
        }
      };
      const stopDrag = () => {
        window.removeEventListener("mousemove", doDrag);
        window.removeEventListener("mouseup", stopDrag);
      };

      window.addEventListener("mousemove", doDrag);
      window.addEventListener("mouseup", stopDrag);
    },
    [height]
  );

  // Loglarni qidirish
  const filteredLogs = useMemo(() => {
    if (!debouncedSearchTerm) return logs;
    return logs.filter((log) =>
      log.message.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [logs, debouncedSearchTerm]);

  // Loglarni nusxalash
  const handleCopyLogs = () => {
    const logText = logs
      .map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(logText);
    toast.success("Barcha loglar nusxalandi!");
  };

  const currentTheme = themes[theme];

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
            style={{ height: `${height}px` }}
            className={cn(
              "fixed bottom-0 left-0 right-0 shadow-2xl z-50 flex flex-col",
              currentTheme.bg
            )}
          >
            <ResizeHandler onMouseDown={startResizing} />
            <LogViewerHeader
              theme={currentTheme}
              onThemeChange={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              onClear={clearLogs}
              onCopy={handleCopyLogs}
              onClose={() => setIsVisible(false)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              logCount={filteredLogs.length}
            />
            <LogList
              logs={filteredLogs}
              theme={currentTheme}
              searchTerm={debouncedSearchTerm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!isVisible && <OpenButton onClick={() => setIsVisible(true)} />}
    </>
  );
}
