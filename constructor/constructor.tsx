"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { ElementItemType } from "@/types/element-types";
import { CustomNodes } from "./nodes";
import { useFlowStore } from "./store/flowStore";
import { QuickAddPalette } from "./components";

function FlowchartInner() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { project, screenToFlowPosition } = useReactFlow();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Palitradan element tanlanganda chaqiriladigan funksiya
  const handlePaletteSelect = (element: ElementItemType) => {
    const position = screenToFlowPosition(mousePosition);
    addNode(element, position);
  };

  // Sichqoncha pozitsiyasini saqlash uchun state (Ctrl+V uchun)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Store'dan yangi funksiyalarni olamiz
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelectedElements,
    selectAll,
    copySelection,
    paste,
    duplicateSelection,
    setCtrlPressed,
  } = useFlowStore();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const data = JSON.parse(
        event.dataTransfer.getData("application/json")
      ) as ElementItemType;
      addNode(data, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  // Sichqoncha harakatini kuzatib boramiz
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // KLAVIATURA HODISALARINI FAQAT REACTFLOW KONTEYNERIDA TINGLASH
  useEffect(() => {
    const containerElement = reactFlowWrapper.current;
    if (!containerElement) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Agar matn maydonida bo'lsa, klaviatura hodisalarini bekor qilish
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === "Control") {
        setCtrlPressed(true);
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlOrCmd && event.key.toLowerCase() === "a") {
        event.preventDefault();
        selectAll();
      } else if (ctrlOrCmd && event.key.toLowerCase() === "c") {
        event.preventDefault();
        copySelection();
      } else if (ctrlOrCmd && event.key.toLowerCase() === "v") {
        event.preventDefault();
        const position = screenToFlowPosition(mousePosition);
        paste(position);
      } else if (ctrlOrCmd && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelection();
      } else if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelectedElements();
      } else if (ctrlOrCmd && event.key === " ") {
        event.preventDefault();
        setIsPaletteOpen(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // Agar Ctrl qo'yib yuborilsa, holatni 'false' qilamiz
      if (event.key === "Control") {
        setCtrlPressed(false);
      }
    };

    // Foydalanuvchi oynadan tashqariga o'tib ketsa ham,
    // Ctrl bosilmagan deb hisoblash uchun
    const handleBlur = () => {
      setCtrlPressed(false);
    };

    // Konteynerga fokus qilish uchun tabIndex qo'shish
    containerElement.setAttribute("tabIndex", "0");

    // Konteynerda klaviatura hodisalarini tinglash
    containerElement.addEventListener("keydown", handleKeyDown);
    containerElement.addEventListener("keyup", handleKeyUp);
    containerElement.addEventListener("blur", handleBlur);

    return () => {
      containerElement.removeEventListener("keydown", handleKeyDown);
      containerElement.removeEventListener("keyup", handleKeyUp);
      containerElement.removeEventListener("blur", handleBlur);
    };
  }, [
    selectAll,
    copySelection,
    paste,
    duplicateSelection,
    deleteSelectedElements,
    mousePosition,
    screenToFlowPosition,
    setCtrlPressed,
  ]);

  // Konteynerga bosilganda fokus qilish (faqat bo'sh joyga bosilganda)
  const handleContainerClick = (event: React.MouseEvent) => {
    // Agar input, textarea yoki contentEditable elementga bosilgan bo'lsa, fokus o'tkazmaslik
    const target = event.target as HTMLElement;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("[contenteditable]")
    ) {
      return;
    }

    // Faqat ReactFlow background yoki asosiy konteynerga bosilganda fokus qilish
    if (
      target.classList.contains("react-flow__pane") ||
      target.classList.contains("react-flow__background") ||
      event.target === reactFlowWrapper.current
    ) {
      reactFlowWrapper.current?.focus();
    }
  };

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-[calc(100vh-56px)] outline-none"
      onDrop={onDrop}
      onDragOver={onDragOver}
      onMouseDown={handleContainerClick}
      style={{ outline: "none" }} // Fokus ko'rsatkichini olib tashlash
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={CustomNodes}
        fitView
        panOnScroll
        selectionOnDrag
        multiSelectionKeyCode={["Shift"]}
        deleteKeyCode={null} // O'zimizning handler'imizni ishlatamiz
        minZoom={0.1} // Minimal yaqinlashtirishni 10% gacha tushirish
        maxZoom={2} // Maksimal yaqinlashtirishni 400% gacha ko'tarish
      >
        <Background gap={24} color="#666" />
        <MiniMap />
        <Controls />
      </ReactFlow>

      <QuickAddPalette
        isOpen={isPaletteOpen}
        onOpenChange={setIsPaletteOpen}
        onSelect={handlePaletteSelect}
      />
    </div>
  );
}

export default function Flowchart() {
  return (
    <ReactFlowProvider>
      <FlowchartInner />
    </ReactFlowProvider>
  );
}
