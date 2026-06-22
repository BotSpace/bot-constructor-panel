"use client";

import React, { SVGProps, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSession } from "@/lib/session-client";
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
import { useFlowStore } from "@/features/bot-constructor/store";
import { CustomNodes, buildModuleNodeTypes } from "@/features/bot-constructor/nodes";
import { useModuleManifestStore } from "@/features/bot-constructor/manifest/moduleManifestStore";
import { CustomEdge, FloatingConnectionLine } from "@/features/bot-constructor/canvas/edges";
import { useFlowKeyboardShortcuts } from "@/features/bot-constructor/hooks/useFlowKeyboardShortcuts";
import { useMousePosition } from "@/features/bot-constructor/hooks/useMousePosition";
import { useParams } from "next/navigation";
import useProjectStore from "@/features/bot-constructor/store/project";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Plus, Text } from "lucide-react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import toast from "react-hot-toast";
import { useSearchStore } from "@/features/bot-constructor/panels/search/search-store";
import { debugConsoleStore } from "@/components/layout/debug-console/store";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { instanceAuth } from "@/services/instance";
import { getNodeManifestByType } from "@/features/bot-constructor/manifest";
import { useTheme } from "next-themes";
import { NodeSelectionDialog } from "@/features/bot-constructor/panels/NodeSelectionDialog";
import { Connection, Node } from "reactflow";
import { useCollab } from "@/wss/collab/use-collab";
import { useDebugContextStore } from "@/components/layout/debug-console/debug-context-store";
import { useDebugErrorsStore } from "@/features/bot-constructor/store/debug-errors";
import { useQuery } from "@tanstack/react-query";
import { getProjectModuleManifests } from "@/services/requests/module";
import { clearModuleManifests } from "@/features/bot-constructor/manifest/manifestStore";

export default function Constructor() {
  const { id }: { id: string } = useParams();

  // Real-time collaboration: dedicated collab WS for this project (best-effort).
  useCollab(id);

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
    edgesVisible,
    pendingEdgeInsert,
    setPendingEdgeInsert,
  } = useFlowStore();

  const { searchPanelIsOpen } = useSearchStore();
  const { toggleSearchPanel } = useSearchStore();
  const debugToggle = debugConsoleStore.getState().toggle;

  // Module manifest store — triggers re-render when module list changes.
  const moduleManifests = useModuleManifestStore((s) => s.manifests);
  const setManifests = useModuleManifestStore((s) => s.setManifests);

  // Fetch module manifests from backend.
  // Runs as soon as `id` is available (parallel to loadFlow below).
  // If the backend returns 404 / empty, gracefully shows an empty list.
  // On project change, clear stale manifests immediately (clearModuleManifests)
  // so old module nodes from the previous project never render on the new canvas.
  const prevProjectIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevProjectIdRef.current !== null && prevProjectIdRef.current !== id) {
      // Project switched — wipe stale module manifests immediately so the
      // canvas nodeTypes map never contains types from a different project.
      clearModuleManifests();
      setManifests([]);
    }
    prevProjectIdRef.current = id;
  }, [id, setManifests]);

  const { data: fetchedManifests, isFetched: manifestsFetched } = useQuery({
    queryKey: ["module-manifests", id],
    queryFn: () => getProjectModuleManifests(id),
    enabled: !!id,
    // Stale time: 30s — avoids hammering the backend on every re-mount while
    // still reflecting newly enabled modules within a reasonable window.
    staleTime: 30_000,
    // Silent failure: 404 / network error → treat as empty list (no toast).
    retry: false,
  });

  // Sync fetched manifests into the Zustand store (and the fast Map).
  // Runs whenever the query result changes (including the initial undefined→data transition).
  useEffect(() => {
    if (fetchedManifests !== undefined) {
      setManifests(fetchedManifests);
    }
  }, [fetchedManifests, setManifests]);

  // Merge static node types with module node types.
  // Only recomputes when moduleManifests list reference changes —
  // prevents ReactFlow from re-mounting the entire canvas on unrelated renders.
  const nodeTypes = useMemo(
    () => ({ ...CustomNodes, ...buildModuleNodeTypes(moduleManifests) }),
    [moduleManifests]
  );

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
  // Flow position of the last right-click; lets a node added via the canvas
  // context menu land exactly where the user right-clicked.
  const lastRightClickFlowPosRef = useRef<{ x: number; y: number } | null>(null);
  const contextMenuAddPosRef = useRef<{ x: number; y: number } | null>(null);
  const pendingConnectionRef = useRef<{
    source: string;
    sourceHandle: string | null | undefined;
    position: { x: number; y: number };
  } | null>(null);
  const connectionSuccessfulRef = useRef(false);

  // Tracks whether loadFlow has already been called for the current project.
  // Without this guard, every changeDebug/changeRelease call mutates the
  // project object reference, re-triggering the effect and overwriting
  // unsaved editor state with the server-saved flow (Bug 2 root cause).
  const hasLoadedFlowRef = useRef(false);
  // Guards one-time debug seed (variables + errors) on mount.
  const hasSeedDebugRef = useRef(false);

  // Loyiha yuklanib bo'lsa undagi ma'lumotlarni
  // Constructorga yozib qo'yadi loading status true bo'lganda
  useEffect(() => {
    if (loading) return;
    if (!project) return;
    // Wait for module manifests to settle before building the flow — otherwise
    // module node types aren't registered yet and their nodes render as blank
    // "not found" rectangles until the manifests arrive (the flash the user saw).
    if (!manifestsFetched) return;
    // Only load once per project session — do not re-load when project metadata
    // (e.g. debug.status) changes after the initial fetch.
    if (hasLoadedFlowRef.current) return;
    hasLoadedFlowRef.current = true;

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
  }, [loading, project, loadFlow, manifestsFetched]);

  // Seed debug stores from backend on mount (once per project session).
  // This ensures that after a page refresh the Variable Inspector and Errors
  // panel are populated immediately without waiting for a new WS event.
  // WS real-time events still win: setSnapshot/addError always overwrite.
  useEffect(() => {
    if (loading) return;
    if (!project) return;
    if (hasSeedDebugRef.current) return;
    hasSeedDebugRef.current = true;

    const projectId = String(project.id);

    // Seed variable snapshots — GET /api/debug/context/?project_id=<id>
    // Expected response: { chats: [{ chat_id, variables, ts }, ...] }
    instanceAuth
      .get<{ chats: Array<{ chat_id: string | number; variables: Record<string, unknown>; ts: number | string }> }>(
        `/debug/context/`,
        { params: { project_id: projectId } }
      )
      .then(({ data }) => {
        const chats = data?.chats;
        if (!Array.isArray(chats) || chats.length === 0) return;
        const entries = chats.map((c) => ({
          chat_id: String(c.chat_id),
          snapshot: {
            variables: c.variables ?? {},
            ts: c.ts ?? Date.now(),
          },
        }));
        useDebugContextStore.getState().seedSnapshots(entries);
      })
      .catch(() => {
        // Silent — 404 or empty is fine on first run / no debug sessions yet
      });

    // Seed errors — GET /api/debug/errors/?project_id=<id>
    // Expected response: [{ chat_id, node_id, node_type, message, detail, ts }, ...]
    // or { results: [...] } — handle both shapes.
    type RawError = {
      chat_id?: string | number;
      node_id?: string;
      node_type?: string;
      message: string;
      detail?: string;
      ts: number | string;
    };
    instanceAuth
      .get<Array<RawError> | { results: Array<RawError> }>(
        `/debug/errors/`,
        { params: { project_id: projectId } }
      )
      .then(({ data }) => {
        const raw: Array<RawError> = Array.isArray(data)
          ? data
          : (data as { results: Array<RawError> })?.results ?? [];
        if (raw.length === 0) return;
        const raws = raw.map((e) => ({
          project: projectId,
          chat_id: e.chat_id,
          node_id: e.node_id,
          node_type: e.node_type,
          message: e.message || "Unknown error",
          detail: e.detail,
          ts: e.ts ?? Date.now(),
        }));
        useDebugErrorsStore.getState().seedErrors(raws);
      })
      .catch(() => {
        // Silent — 404 or empty is expected when no errors recorded yet
      });
  }, [loading, project]);

  useFlowKeyboardShortcuts({
    containerRef: reactFlowWrapper,
    mousePosition: mousePosition,
    onOpenPalette: () => { },
  });

  // Tab yopilganda / fonga o'tganda saqlanmagan o'zgarishlarni best-effort yuboramiz.
  // visibilitychange(hidden) — sahifa hali tirik, oddiy so'rov yetib boradi;
  // pagehide — keepalive fetch (~64KB limit) bilan oxirgi urinish.
  useEffect(() => {
    let flushing = false;
    const flush = async () => {
      const { isDirty, nodes, edges } = useFlowStore.getState();
      if (!isDirty || flushing) return;
      flushing = true;
      try {
        const session = await getSession();
        const access = session?.user?.access;
        if (!access) return;
        await fetch(`${process.env.NEXT_PUBLIC_API}/api/project/${id}/`, {
          method: "PATCH",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({ flow: { nodes, edges } }),
        });
        useFlowStore.setState({ isDirty: false, lastSavedTime: new Date() });
      } catch {
        /* best-effort — sahifa yopilayotganda xato ko'rsatishning ma'nosi yo'q */
      } finally {
        flushing = false;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    const onPageHide = () => void flush();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [id]);

  // Periodik safety-net (backstop) autosave — har 20s da bir marta.
  // Jonli sync collab WS orqali zudlik bilan boradi va har bir op endi
  // server tomonda incremental ravishda project.flow ga saqlanadi (primary).
  // Bu periodik saqlash faqat zaxira: op-channel o'tkazib yuborgan narsalarni
  // (masalan undo/redo va bulk amallar) butun flow PATCH bilan moslashtiradi.
  // Idle-debounce EMAS — uzluksiz tahrirlash davomida ham ishlashi kerak.
  useEffect(() => {
    const interval = setInterval(() => {
      const { isDirty, initialState } = useFlowStore.getState();
      if (isDirty && initialState) {
        saveFlow(id);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [saveFlow, id]);

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

  // Single click only selects the node (React Flow handles selection itself);
  // the edit modal opens on double click.
  const handleNodeDoubleClick = useCallback(
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
      // Edge o'rtasiga node qo'shish (Plus button on edge)
      const edgeInsert = useFlowStore.getState().pendingEdgeInsert;
      if (edgeInsert) {
        const { edgeId, source, sourceHandle, target, targetHandle, midX, midY } = edgeInsert;

        // Yangi node ni edge o'rtasiga joylashtirish
        const allNodes = useFlowStore.getState().nodes;
        const sourceNode = allNodes.find((n) => n.id === source);
        const targetNode = allNodes.find((n) => n.id === target);
        const elementManifest = getNodeManifestByType(element.triggerId);
        const NODE_W = elementManifest?.size.width ?? 280;
        const NODE_H = 160;

        // A va B orasiga, markazga joylash
        let newX = midX - NODE_W / 2;
        let newY = midY - NODE_H / 2;
        if (sourceNode && targetNode) {
          newX = (sourceNode.position.x + targetNode.position.x) / 2 - NODE_W / 2;
          newY = (sourceNode.position.y + targetNode.position.y) / 2 - NODE_H / 2;
        }

        addNode(element, { x: newX, y: newY });

        setTimeout(() => {
          const currentNodes = useFlowStore.getState().nodes;
          const newNode = currentNodes[currentNodes.length - 1];
          if (!newNode) return;

          // Eski edge'ni o'chirish
          useFlowStore.getState().onEdgesChange([{ id: edgeId, type: "remove" }]);

          // A → N
          onConnect({
            source,
            sourceHandle: sourceHandle ?? null,
            target: newNode.id,
            targetHandle: null,
          });

          // N → B
          onConnect({
            source: newNode.id,
            sourceHandle: null,
            target,
            targetHandle: targetHandle ?? null,
          });

          setPendingEdgeInsert(null);
        }, 50);
        return;
      }

      if (pendingConnectionRef.current) {
        const { source, sourceHandle, position } = pendingConnectionRef.current;

        // Place regular flow nodes on the same row as the source. Accessory
        // nodes (AI provider/tool ports) should land below their parent port.
        const allNodes = useFlowStore.getState().nodes;
        const sourceNode = allNodes.find((n) => n.id === source);
        let adjustedPosition = position;
        if (sourceNode) {
          const sourceManifest = getNodeManifestByType(sourceNode.type ?? "");
          const elementManifest = getNodeManifestByType(element.triggerId);
          const NODE_W = elementManifest?.size.width ?? 280;
          const NODE_H = 160;
          const V_GAP = 40;
          const isAccessoryPort = sourceHandle?.startsWith("acc:") ?? false;
          const accessoryGap = 16;
          const accessoryPortX =
            sourceHandle === "acc:ai_model"
              ? 0.3
              : sourceHandle === "acc:ai_tool"
                ? 0.7
                : 0.5;
          const isModelPort = sourceHandle === "acc:ai_model";
          let candidateX = isAccessoryPort
            ? sourceNode.position.x +
              ((sourceNode.width ?? sourceManifest?.size.width ?? NODE_W) * accessoryPortX) -
              NODE_W / 2 -
              (isModelPort ? 30 : 0)
            : position.x;
          let candidateY = isAccessoryPort
            ? sourceNode.position.y +
              (sourceNode.height ?? NODE_H) +
              accessoryGap +
              (isModelPort ? 90 : 0)
            : sourceNode.position.y;
          const overlapsAt = (x: number, y: number) =>
            allNodes.some((n) => {
              if (n.id === source) return false;
              const nx = n.position.x;
              const ny = n.position.y;
              const nw = n.width ?? NODE_W;
              const nh = n.height ?? NODE_H;
              return (
                x < nx + nw &&
                x + NODE_W > nx &&
                y < ny + nh &&
                y + NODE_H > ny
              );
            });
          let guard = 0;
          while (overlapsAt(candidateX, candidateY) && guard < 50) {
            if (isAccessoryPort) {
              candidateX += NODE_W + V_GAP;
            } else {
              candidateY += NODE_H + V_GAP;
            }
            guard += 1;
          }
          adjustedPosition = { x: candidateX, y: candidateY };
        }

        // Yangi node yaratish
        addNode(element, adjustedPosition);

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
      } else if (contextMenuAddPosRef.current) {
        // Canvas o'ng-click menyusidan qo'shilganda — aynan shu joyga
        addNode(element, contextMenuAddPosRef.current);
        contextMenuAddPosRef.current = null;
      } else {
        // Ctrl+N yoki boshqa usulda ochilganda — markazga qo'shish
        const { x, y, zoom } = getViewport();
        const centerX = (-x + window.innerWidth / 2) / zoom;
        const centerY = (-y + window.innerHeight / 2) / zoom;
        addNode(element, { x: centerX, y: centerY });
      }
    },
    [addNode, onConnect, getViewport, setPendingEdgeInsert]
  );

  // pendingEdgeInsert o'zgarganda NodeSelectionDialog'ni ochish
  useEffect(() => {
    if (pendingEdgeInsert) {
      setShowNodeDialog(true);
    }
  }, [pendingEdgeInsert]);

  // Dialog yopilganda tozalash
  const handleDialogClose = useCallback((open: boolean) => {
    setShowNodeDialog(open);
    if (!open) {
      pendingConnectionRef.current = null;
      setPendingEdgeInsert(null);
    }
  }, [setPendingEdgeInsert]);


  const isValidConnection = (connection: Connection) => {
    // source va target bir xil bo‘lsa false qaytaradi
    return connection.source !== connection.target;
  };


  // Show a loading veil until the project AND module manifests are ready, so the
  // canvas never paints module nodes before their types are registered.
  const editorLoading = loading || !manifestsFetched;

  return (
    <>
      {editorLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0e0e0e]">
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-primary" />
            <span className="text-sm">Yuklanmoqda...</span>
          </div>
        </div>
      )}
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            ref={reactFlowWrapper}
            className="h-screen"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onMouseDown={handleContainerClick}
            onContextMenu={(e) => {
              lastRightClickFlowPosRef.current = screenToFlowPosition({
                x: e.clientX,
                y: e.clientY,
              });
            }}
          >
            <ReactFlow
              isValidConnection={isValidConnection}
              id="canvas-area"
              nodeTypes={nodeTypes}
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
              onNodeDoubleClick={handleNodeDoubleClick}
              onNodeDrag={handleNodeDrag}
              onNodeDragStop={handleNodeDragStop}
              panOnScroll
              selectionOnDrag
              multiSelectionKeyCode={["Shift"]}
              deleteKeyCode={null} // O'zimizning handler'imizni ishlatamiz
              minZoom={0.1}
              maxZoom={2.5}
              connectionRadius={60}
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
        <ContextMenuContent
          onCloseAutoFocus={(e) => {
            // When opening the node sidebar, suppress the menu's focus-return
            // to the canvas — that async focus event fires onInteractOutside on
            // the (non-modal) sheet and would close it immediately.
            if (contextMenuAddPosRef.current) e.preventDefault();
          }}
        >
          <ContextMenuItem
            onSelect={() => {
              contextMenuAddPosRef.current = lastRightClickFlowPosRef.current;
              // Defer so the closing context menu's outside-interaction event
              // doesn't immediately dismiss the (non-modal) node sidebar.
              setTimeout(() => setShowNodeDialog(true), 0);
            }}
          >
            <Plus />
            Yangi node qo&apos;shish
          </ContextMenuItem>
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
