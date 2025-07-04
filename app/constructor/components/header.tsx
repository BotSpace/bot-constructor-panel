"use client";

import { useState } from "react";
import { Code, Download } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useFlowStore } from "@/constructor/store/flowStore";
import { downloadJson } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

// Asosiy Header komponenti
export function ConstructorPageHeader() {
  // Dialog oynasining ochiq/yopiqligini boshqarish uchun state
  const [isJsonViewerOpen, setIsJsonViewerOpen] = useState(false);
  // JSON ma'lumotlarini string formatida saqlash uchun state
  const [flowJson, setFlowJson] = useState("");

  /**
   * "JSON ko'rish" tugmasi bosilganda ishlaydi.
   * Store'dan ma'lumotlarni oladi, tozalaydi va dialog oynasini ochadi.
   */
  const handleViewJson = () => {
    // Zustand store'dan joriy holatni olamiz
    const { nodes, edges } = useFlowStore.getState();

    // ReactFlow qo'shadigan vaqtinchalik maydonlardan tozalaymiz.
    // Bu saqlash uchun toza va minimal JSON yaratadi.
    const cleanNodes = nodes.map(
      ({ id, type, position, data, width, height }) => ({
        id,
        type,
        position,
        data,
        width,
        height,
      })
    );

    const cleanEdges = edges.map(
      ({ id, source, target, sourceHandle, targetHandle }) => ({
        id,
        source,
        target,
        sourceHandle,
        targetHandle,
      })
    );

    const flowData = {
      nodes: cleanNodes,
      edges: cleanEdges,
    };

    // JSON'ni chiroyli formatlangan string'ga aylantiramiz
    setFlowJson(JSON.stringify(flowData, null, 2));

    // Dialog oynasini ochamiz
    setIsJsonViewerOpen(true);
  };

  /**
   * Dialog ichidagi "Yuklab olish" tugmasi bosilganda ishlaydi.
   */
  const handleDownloadFromJsonViewer = () => {
    if (!flowJson) return;

    // Fayl nomini sana bilan generatsiya qilamiz
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `bot-flow-${timestamp}.json`;

    try {
      // JSON string'ni obyektga aylantirib, yuklab olish funksiyasiga beramiz
      downloadJson(JSON.parse(flowJson), filename);
      toast.success("Sxema JSON fayl sifatida yuklab olindi.");
    } catch (error) {
      console.error("Failed to download JSON:", error);
      toast.error("Faylni yuklab olishda xatolik yuz berdi.");
    }
  };

  /**
   * JSON'ni clipboard'ga nusxalash
   */
  const handleCopyToClipboard = () => {
    if (!flowJson) return;

    navigator.clipboard
      .writeText(flowJson)
      .then(() => {
        toast("Sxema JSON'i vaqtinchalik xotiraga muvaffaqiyatli saqlandi.");
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
        toast("Nusxalashda xatolik yuz berdi.");
      });
  };

  return (
    <>
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
        <div className="flex-1">
          {/* Kelajakda bu yerga loyiha nomi yoki boshqa elementlar qo'shilishi mumkin */}
          <h1 className="font-semibold text-lg">Bot Konstruktor</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Bu tugma dialog oynasini ochadi */}
          <Button variant="outline" size="sm" onClick={handleViewJson}>
            <Code className="mr-2 h-4 w-4" />
            Eksport qilish
          </Button>
        </div>
      </header>

      {/* JSON Viewer uchun Dialog Komponenti */}
      <Dialog open={isJsonViewerOpen} onOpenChange={setIsJsonViewerOpen}>
        <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Sxema Eksporti (JSON)</DialogTitle>
            <DialogDescription>
              Bu sizning vizual konstruktorda yaratgan sxemangizning JSON
              ko'rinishi. Uni fayl sifatida saqlab qo'yishingiz yoki nusxalab
              olishingiz mumkin.
            </DialogDescription>
          </DialogHeader>

          {/* JSON kodini ko'rsatuvchi va prokrutka qilinadigan maydon */}
          <div className="flex-grow my-4 relative overflow-auto">
            <ScrollArea className="h-full w-full rounded-md border bg-background">
              <SyntaxHighlighter
                language="json"
                style={vscDarkPlus}
                showLineNumbers
                customStyle={{
                  background: "transparent",
                  padding: "1rem",
                  margin: 0,
                  height: "100%",
                  fontSize: "14px",
                  fontFamily: 'Consolas, "Courier New", monospace',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: "inherit",
                  },
                }}
                wrapLongLines={true}
              >
                {flowJson}
              </SyntaxHighlighter>
            </ScrollArea>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="secondary" onClick={handleCopyToClipboard}>
              Nusxalash
            </Button>
            <Button onClick={handleDownloadFromJsonViewer}>
              <Download className="mr-2 h-4 w-4" />
              Yuklab olish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
