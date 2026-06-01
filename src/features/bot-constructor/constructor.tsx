"use client";

import React, { SVGProps, useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import { ElementItemType } from "@/types/element-types";
import { useFlowStore } from "./store";
import { CustomNodes } from "./nodes";
import { CustomEdge, FloatingConnectionLine } from "./edges";
import { useFlowKeyboardShortcuts } from "./hooks/useFlowKeyboardShortcuts";
import { useMousePosition } from "./hooks/useMousePosition";
import { useParams } from "next/navigation";
import useProjectStore from "./store/project";
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
import { debugConsoleStore } from "@/components/layout/components/debug-console/store";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { instanceAuth } from "@/services/instance";
import { useTheme } from "next-themes";
import { NodeSelectionDialog } from "./components/NodeSelectionDialog";
import { Connection, Node } from "reactflow";

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
    edgesVisible,
  } = useFlowStore();

  const { searchPanelIsOpen } = useSearchStore();
  const { toggleSearchPanel } = useSearchStore();
  const debugToggle = debugConsoleStore.getState().toggle;

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Projectni loading qilish kerak
  // First loading start on hear
  const { project, loading } = useProjectStore();

  const { screenToFlowPosition, fitView, getViewport } = useReactFlow();
  const [snapToGrid, setSnapToGrid] = useState(false);
  const mousePosition = useMousePosition();
  const { resolvedTheme } = useTheme();
  const edgeColor = resolvedTheme === "dark" ? "#4b5563" : "#9ca3af";

  // Node selection dialog state
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const pendingConnectionRef = useRef<{
    source: string;
    sourceHandle: string | null | undefined;
    position: { x: number; y: number };
  } | null>(null);
  const connectionSuccessfulRef = useRef(false);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Loyiha yuklanib bo'lsa undagi ma'lumotlarni
  // Constructorga yozib qo'yadi loading status true bo'lganda
  useEffect(() => {
    if (loading) return;
    if (!project) return;

    loadFlow(project.flow).catch((error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Flow yuklashda noma'lum xatolik yuz berdi";

      console.error("Constructor flow yuklashda xatolik:", {
        projectId: project.id,
        projectFlow: project.flow,
        error,
      });
      toast.error(message);
    });
  }, [loading, project, loadFlow]);

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

      const event_data = event.dataTransfer.getData("text/plain");

      const data = JSON.parse(event_data) as ElementItemType;
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

  // Store'dan kerakli qismlarni olamiz
  const { formatFlow, collapseAllNodes, expandAllNodes, setEditingNodeId } = useFlowStore();

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setEditingNodeId(node.id);
    },
    [setEditingNodeId]
  );

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

  // Ctrl+N - Node qo'shish modali
  useKeyboardShortcut(
    ["Control", "n"],
    () => { setShowNodeDialog(true); },
    { preventDefault: true }
  );

  // Ctrl+K / Ctrl+F - Qidirish paneli
  useKeyboardShortcut(
    ["Control", "k"],
    () => { toggleSearchPanel(); },
    { preventDefault: true }
  );

  useKeyboardShortcut(
    ["Control", "f"],
    () => { toggleSearchPanel(); },
    { preventDefault: true }
  );

  // Ctrl+` - Debug konsol
  useKeyboardShortcut(
    ["Control", "`"],
    () => { debugToggle(); },
    { preventDefault: true }
  );

  // Ctrl+R - Debug botni reload qilish
  useKeyboardShortcut(
    ["Control", "r"],
    () => {
      if (!project) return;

      saveFlow(id);

      const { changeDebug } = useProjectStore.getState();
      changeDebug({
        ...project.debug,
        status: "initializing",
      });

      instanceAuth
        .get(`/project/${id}/debug/`)
        .then(() => {
          toast.success("Bot ishga tushirilmoqda...");
        })
        .catch(() => {
          toast.error("Botni ishga tushirishda xatolik yuz berdi.");
        });
    },
    { preventDefault: true }
  );

  // Ctrl+D - Debug botni run/stop qilish (toggle)
  useKeyboardShortcut(
    ["Control", "d"],
    () => {
      if (!project) return;

      const { changeDebug } = useProjectStore.getState();

      if (project.debug.status === "running") {
        changeDebug({
          ...project.debug,
          status: "stopped",
        });

        instanceAuth
          .get(`/project/${id}/stop/`)
          .then(() => {
            toast.success("Bot muvaffaqiyatli to'xtatildi!");
          })
          .catch(() => {
            toast.error("Botni to'xtatishda xatolik yuz berdi.");
          });
      } else {
        saveFlow(id);

        changeDebug({
          ...project.debug,
          status: "initializing",
        });

        instanceAuth
          .get(`/project/${id}/debug/`)
          .then(() => {
            toast.success("Bot ishga tushirilmoqda...");
          })
          .catch(() => {
            toast.error("Botni ishga tushirishda xatolik yuz berdi.");
          });
      }
    },
    { preventDefault: true }
  );

  const isMobile = useIsMobile();

  // Connection boshlanganda ma'lumotlarni saqlash
  const handleConnectStart = useCallback(
    (
      _event: React.MouseEvent | React.TouchEvent,
      { nodeId, handleId }: { nodeId: string | null; handleId: string | null | undefined }
    ) => {
      connectionSuccessfulRef.current = false;
      if (nodeId) {
        // Mouse pozitsiyasini olish
        const position = screenToFlowPosition({
          x: mousePosition.x,
          y: mousePosition.y,
        });

        pendingConnectionRef.current = {
          source: nodeId,
          sourceHandle: handleId ?? null,
          position,
        };
      }
    },
    [screenToFlowPosition, mousePosition]
  );

  // Connection tugaganda tekshirish
  const handleConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Mouse pozitsiyasini yangilash (connection tugagan joyda)
      if (pendingConnectionRef.current) {
        const clientX = 'clientX' in event ? event.clientX : event.touches[0]?.clientX ?? 0;
        const clientY = 'clientY' in event ? event.clientY : event.touches[0]?.clientY ?? 0;

        if (clientX && clientY) {
          const position = screenToFlowPosition({
            x: clientX,
            y: clientY,
          });
          pendingConnectionRef.current.position = position;
        }
      }

      // Agar connection muvaffaqiyatli bo'lsa (onConnect chaqiriladi), 
      // bu yerda hech narsa qilmaymiz
      // Faqat connection tugagan va target yo'q bo'lsa dialog ko'rsatamiz
      setTimeout(() => {
        // Kichik delay - onConnect chaqirilishini kutish uchun
        if (pendingConnectionRef.current && !connectionSuccessfulRef.current) {
          setShowNodeDialog(true);
        }
        connectionSuccessfulRef.current = false;
      }, 100);
    },
    [screenToFlowPosition]
  );

  // Node tanlanganda yaratish va ulash
  const handleNodeSelected = useCallback(
    (element: ElementItemType) => {
      if (pendingConnectionRef.current) {
        const { source, sourceHandle, position } = pendingConnectionRef.current;

        // Yangi node yaratish
        addNode(element, position);

        // Yangi yaratilgan node'ni topish va edge yaratish
        setTimeout(() => {
          const currentNodes = useFlowStore.getState().nodes;
          const newNode = currentNodes[currentNodes.length - 1];

          if (newNode) {
            const connection: Connection = {
              source,
              sourceHandle: sourceHandle ?? null,
              target: newNode.id,
              targetHandle: null,
            };
            onConnect(connection);
          }
          pendingConnectionRef.current = null;
        }, 50);
      } else {
        // Ctrl+N yoki boshqa usulda ochilganda — markazga qo'shish
        const { x, y, zoom } = getViewport();
        const centerX = (-x + window.innerWidth / 2) / zoom;
        const centerY = (-y + window.innerHeight / 2) / zoom;
        addNode(element, { x: centerX, y: centerY });
      }
    },
    [addNode, onConnect, getViewport]
  );

  // Dialog yopilganda tozalash
  const handleDialogClose = useCallback((open: boolean) => {
    setShowNodeDialog(open);
    if (!open) {
      pendingConnectionRef.current = null;
    }
  }, []);


  const isValidConnection = (connection: Connection) => {
    // source va target bir xil bo‘lsa false qaytaradi
    return connection.source !== connection.target;
  };


  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            ref={reactFlowWrapper}
            className="h-screen"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onMouseDown={handleContainerClick}
          >
            <ReactFlow
              isValidConnection={isValidConnection}
              id="canvas-area"
              nodeTypes={CustomNodes}
              edgeTypes={CustomEdge}
              nodes={nodes}
              edges={edgesVisible ? edges : []}
              onConnect={(connection) => {
                // Connection muvaffaqiyatli bo'lsa, pending connection'ni tozalash
                connectionSuccessfulRef.current = true;
                pendingConnectionRef.current = null;
                onConnect(connection);
              }}
              onConnectStart={handleConnectStart}
              onConnectEnd={handleConnectEnd}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              onNodeDrag={handleNodeDrag}
              onNodeDragStop={handleNodeDragStop}
              panOnScroll
              selectionOnDrag
              multiSelectionKeyCode={["Shift"]}
              deleteKeyCode={null} // O'zimizning handler'imizni ishlatamiz
              minZoom={0.1}
              maxZoom={2.5}
              connectionRadius={210}
              snapToGrid={snapToGrid}
              snapGrid={snapToGrid ? [20, 20] : undefined}
              connectionLineStyle={{
                strokeWidth: 2,
                stroke: edgeColor,
              }}
              connectionLineComponent={FloatingConnectionLine}
              connectionMode={ConnectionMode.Loose}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={60}
                size={4}
                color="#4d4d4d"
                style={{ backgroundColor: "#171717" }}
              />
              {!isMobile && (
                <MiniMap
                  style={{ background: resolvedTheme === "dark" ? "#111827" : "#f9fafb" }}
                  maskColor={resolvedTheme === "dark" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)"}
                />
              )}
              <Controls />
            </ReactFlow>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {/* Format */}
          <ContextMenuItem onClick={handleFormating}>
            <Text />
            Formatlash
            <ContextMenuShortcut>⌘ i</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={collapseAllNodes}>
            <CollapseIcon />
            Barchasino yopish
          </ContextMenuItem>
          <ContextMenuItem onClick={expandAllNodes}>
            <ExpandIcon />
            Barchasino ochish
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <NodeSelectionDialog
        open={showNodeDialog}
        onOpenChange={handleDialogClose}
        onSelect={handleNodeSelected}
      />
    </>
  );
}


// Icons
export const CollapseIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={24}
      height={24}
      {...props}
    >
      <path d="M3 5h8" />
      <path d="M3 12h8" />
      <path d="M3 19h8" />
      <path d="m15 5 3 3 3-3" />
      <path d="m15 19 3-3 3 3" />
    </svg>
  );
};

export const ExpandIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={24}
      height={24}
      {...props}
    >
      <path d="M3 5h8" />
      <path d="M3 12h8" />
      <path d="M3 19h8" />
      <path d="m15 8 3-3 3 3" />
      <path d="m15 16 3 3 3-3" />
    </svg>
  );
};
