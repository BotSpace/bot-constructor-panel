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
import { SaveStatusBadge } from "./components/save-status-badge";

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
    isDirty,
    initialState,
    startCountdown,
    stopCountdown,
    countdownRemaining,
  } = useFlowStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Projectni loading qilish kerak
  // First loading start on hear
  const { project, loading } = useProjectStore();

  const { screenToFlowPosition } = useReactFlow();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const mousePosition = useMousePosition();

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Loyiha yuklanib bo'lsa undagi ma'lumotlarni
  // Constructorga yozib qo'yadi loading status true bo'lganda
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

  // Countdown ni kamaytirish va save qilish
  useEffect(() => {
    // Agar countdown yo'q bo'lsa, interval ni tozalaymiz
    if (countdownRemaining === null) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    // Agar countdown 0 ga yetgan bo'lsa, save qilamiz
    if (countdownRemaining <= 0) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      // Agar hali ham o'zgarishlar bo'lsa, save qilamiz
      if (isDirty && initialState) {
        saveFlow(id);
      }
      return;
    }

    // Countdown ni har 100ms da kamaytiramiz
    countdownIntervalRef.current = setInterval(() => {
      const current = useFlowStore.getState().countdownRemaining;
      if (current !== null && current > 0) {
        useFlowStore.setState({
          countdownRemaining: Math.max(0, current - 100),
        });
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 100);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [countdownRemaining, isDirty, initialState, saveFlow, id]);

  // Bu useEffect nodes va edges o'zgarishini kuzatib boradi va countdown ni boshlaydi
  useEffect(() => {
    // Agar initial state hali o'rnatilmagan bo'lsa yoki o'zgarishlar yo'q bo'lsa, countdown ni to'xtatamiz
    if (!initialState || !isDirty) {
      stopCountdown();
      return;
    }

    // Countdown ni boshlaymiz
    startCountdown();
  }, [nodes, edges, isDirty, initialState, startCountdown, stopCountdown]);

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

  // Ctrl bilan node drag qilganda grid snapping'ni yoqish
  const handleNodeDrag = useCallback((event: React.MouseEvent, _node: any) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const isCtrlPressed = isMac ? event.metaKey : event.ctrlKey;
    setSnapToGrid(isCtrlPressed);
  }, []);

  // Node drag tugaganda grid snapping'ni o'chirish
  const handleNodeDragStop = useCallback(() => {
    setSnapToGrid(false);
  }, []);

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-[calc(100vh-56px)] outline-none relative" // `tabIndex` hook ichida o'rnatiladi
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
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        fitView
        panOnScroll
        selectionOnDrag
        multiSelectionKeyCode={["Shift"]}
        deleteKeyCode={null} // O'zimizning handler'imizni ishlatamiz
        minZoom={0.1}
        maxZoom={2}
        connectionRadius={50}
        snapToGrid={snapToGrid}
        snapGrid={snapToGrid ? [20, 20] : undefined}
      >
        <SaveStatusBadge className="absolute top-2 right-2 z-20" />
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
