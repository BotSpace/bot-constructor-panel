"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { ElementItemType } from "@/types/element-types";
import { useFlowStore } from "./store";
import { CustomNodes } from "./nodes";
import { CustomEdge } from "./edges";
import { QuickAddPalette } from "./components";
import { useFlowKeyboardShortcuts } from "./hooks/useFlowKeyboardShortcuts";
import { useMousePosition } from "./hooks/useMousePosition";
import { useParams } from "next/navigation";
import useProjectStore from "./store/project";

function FlowchartInner() {
  const { id }: { id: string } = useParams();

  // Store'dan kerakli qismlarni olamiz
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    saveFlow,
    loadFlow,
  } = useFlowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const { loading, project } = useProjectStore();

  const { screenToFlowPosition } = useReactFlow();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const mousePosition = useMousePosition();

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // load flow from project
  useEffect(() => {
    if (project) {
      loadFlow({
        nodes: project.flow.nodes,
        edges: project.flow.edges,
      });
    }
  }, [loading]);

  useFlowKeyboardShortcuts({
    containerRef: reactFlowWrapper,
    mousePosition: mousePosition,
    onOpenPalette: () => {},
  });

  // Bu useEffect nodes va edges o'zgarishini kuzatib boradi
  useEffect(() => {
    // Agar eski taymer bo'lsa, uni tozalaymiz
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Yangi taymerni o'rnatamiz. 2 sekunddan so'ng saqlaydi.
    saveTimeoutRef.current = setTimeout(() => {
      // Faqatgina o'zgarish bo'lgandagina saqlash mantiqini qo'shish mumkin
      // Bu yerda saveFlow'ni chaqiramiz.
      // `saveFlow` endi bildirishnoma ko'rsatmasligi uchun uni o'zgartirish kerak bo'lishi mumkin.
      saveFlow(id);
    }, 2000); // 2000ms = 2 sekund

    // Komponent yo'q qilinganda taymerni tozalash uchun
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, saveFlow]); // nodes, edges yoki saveFlow o'zgarganda ishlaydi

  const handlePaletteSelect = (element: ElementItemType) => {
    const position = screenToFlowPosition(mousePosition);
    addNode(element, position);
  };

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

  // Fokusni boshqarish soddalashdi
  const handleContainerClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const isInteractiveElement =
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable ||
      target.closest("button, a, [role='button']");

    if (
      !isInteractiveElement &&
      reactFlowWrapper.current &&
      (target.classList.contains("react-flow__pane") ||
        event.target === reactFlowWrapper.current)
    ) {
      reactFlowWrapper.current.focus();
    }
  };

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-[calc(100vh-56px)] outline-none" // `tabIndex` hook ichida o'rnatiladi
      onDrop={onDrop}
      onDragOver={onDragOver}
      onMouseDown={handleContainerClick}
    >
      <ReactFlow
        nodeTypes={CustomNodes}
        edgeTypes={CustomEdge}
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        panOnScroll
        selectionOnDrag
        multiSelectionKeyCode={["Shift"]}
        deleteKeyCode={null} // O'zimizning handler'imizni ishlatamiz
        minZoom={0.1}
        maxZoom={2}
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
