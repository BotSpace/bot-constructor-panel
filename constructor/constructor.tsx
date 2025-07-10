"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  RefObject,
} from "react";
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

// Sichqoncha pozitsiyasini kuzatish uchun kichik hook
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return mousePosition;
}

function FlowchartInner() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const mousePosition = useMousePosition();

  // Store'dan kerakli qismlarni olamiz
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useFlowStore();

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
