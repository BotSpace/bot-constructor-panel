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
import { useFlowKeyboardShortcuts } from "./hooks/useFlowKeyboardShortcuts";
import { useMousePosition } from "./hooks/useMousePosition";
import { useParams } from "next/navigation";
import useProjectStore from "./store/project";
import { SaveStatusBadge } from "./components/save-status-badge";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Text } from "lucide-react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import toast from "react-hot-toast";
import { useSearchStore } from "./search/search-store";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function Constructor() {
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

  const { searchPanelIsOpen } = useSearchStore();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Projectni loading qilish kerak
  // First loading start on hear
  const { project, loading } = useProjectStore();

  const { screenToFlowPosition, fitView } = useReactFlow();
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
    onOpenPalette: () => { },
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

  useKeyboardShortcut(
    ["Control", "s"],
    () => {
      if (isDirty) saveFlow(id);
    },
    { preventDefault: true } // Brauzerning manzil satriga o'tishini to'xtatadi
  );

  // 1. Sahifa yuklanganda LocalStorage'dan holatni o'qib olish
  const getInitialViewport = () => {
    const savedViewport = localStorage.getItem("react-flow-viewport");
    // Agar oldin saqlangan bo'lsa o'shani qaytaramiz, yo'qsa standart holat
    return savedViewport ? JSON.parse(savedViewport) : { x: 0, y: 0, zoom: 1 };
  };

  // 2. Foydalanuvchi harakatni tugatganda (zoom yoki pan) saqlash
  const onMoveEnd = useCallback((event: any, viewport: any) => {
    localStorage.setItem("react-flow-viewport", JSON.stringify(viewport));
  }, []);

  // Store'dan kerakli qismlarni olamiz
  const { formatFlow } = useFlowStore();

  function handleFormating() {
    const toastId = toast.loading("Formating ...");
    formatFlow()
      .then(() => {
        // Animatsiya bilan chiroyli ko'rsatish
        window.requestAnimationFrame(() => {
          fitView();
          toast.success("Successfuly formating", { id: toastId });
        });
      })
      .catch(() => {
        toast.error("Successfuly error", { id: toastId });
      });
  }

  useKeyboardShortcut(
    ["Control", "i"],
    () => {
      handleFormating();
    },
    { preventDefault: true }
  );

  const isMobile = useIsMobile();

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger
          className={cn({
            "col-span-9": searchPanelIsOpen,
            "col-span-12": !searchPanelIsOpen,
          })}
        >
          <div
            ref={reactFlowWrapper}
            className="col-span-10 h-[calc(100vh-56px)] outline-none relative" // `tabIndex` hook ichida o'rnatiladi
            onDrop={onDrop}
            onDragOver={onDragOver}
            onMouseDown={handleContainerClick}
          >
            <ReactFlow
              id="canvas-area"
              defaultViewport={getInitialViewport()}
              onMoveEnd={onMoveEnd}
              nodeTypes={CustomNodes}
              edgeTypes={CustomEdge}
              nodes={nodes}
              edges={edges}
              onConnect={onConnect}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDrag={handleNodeDrag}
              onNodeDragStop={handleNodeDragStop}
              panOnScroll
              selectionOnDrag
              multiSelectionKeyCode={["Shift"]}
              deleteKeyCode={null} // O'zimizning handler'imizni ishlatamiz
              minZoom={0.1}
              maxZoom={2.5}
              connectionRadius={50}
              snapToGrid={snapToGrid}
              snapGrid={snapToGrid ? [20, 20] : undefined}
            >
              <SaveStatusBadge className="absolute top-2 right-2 z-20" />
              <Background gap={24} color="#666" />
              {
                !isMobile && (
                  <MiniMap />
                )
              }
              <Controls />
            </ReactFlow>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {/* Format */}
          <ContextMenuItem onClick={handleFormating}>
            <Text />
            Formating
            <ContextMenuShortcut>⌘ i</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </>
  );
}
