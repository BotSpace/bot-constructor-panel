# Loyiha Tahlili Hisoboti

Sana: 7/9/2025, 10:24:18 PM

## 📁 Fayl Strukturasi

```
constructor-next-js
├── .gitignore
├── README.md
├── analis_project.js
├── app
│   ├── api
│   │   ├── bot
│   │   │   ├── run
│   │   │   │   └── route.ts
│   │   │   ├── state.ts
│   │   │   ├── status
│   │   │   │   └── route.ts
│   │   │   └── stop
│   │   │       └── route.ts
│   │   ├── flow
│   │   │   ├── load
│   │   │   │   └── route.ts
│   │   │   └── save
│   │   │       └── route.ts
│   │   └── ngrok
│   │       ├── start
│   │       │   └── route.ts
│   │       ├── state.ts
│   │       └── stop
│   │           └── route.ts
│   ├── constructor
│   │   ├── components
│   │   │   ├── LogViewer
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── LogLine.tsx
│   │   │   │   ├── LogList.tsx
│   │   │   │   ├── OpenButton.tsx
│   │   │   │   ├── ResizeHandler.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   └── types.ts
│   │   │   ├── actions.tsx
│   │   │   ├── header.tsx
│   │   │   └── index.ts
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── theme
│   │   ├── theme-provider.tsx
│   │   └── toggle-button.tsx
│   └── ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── command.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       └── tooltip.tsx
├── components.json
├── constructor
│   ├── components
│   │   ├── ButtonGenerator
│   │   │   ├── ButtonGenerator.tsx
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── QuickAddPalette
│   │   │   ├── QuickAddPalette.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── constructor.tsx
│   ├── data
│   │   ├── editor-themes.ts
│   │   ├── elements.ts
│   │   ├── filters.ts
│   │   ├── index.ts
│   │   ├── messages.ts
│   │   └── themes.ts
│   ├── edges
│   │   ├── SmartEdge.tsx
│   │   └── index.ts
│   ├── hooks
│   │   └── useFlowKeyboardShortcuts.ts
│   ├── lib
│   │   └── geometry.ts
│   ├── nodes
│   │   ├── actions
│   │   │   ├── AudioMessageNode
│   │   │   │   ├── AudioMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── FileMessageNode
│   │   │   │   ├── FileMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── PhotoMessageNode
│   │   │   │   ├── PhotoMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── TextMessageNode
│   │   │   │   ├── TextMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── VideoMessageNode
│   │   │   │   ├── VideMessageNode.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   ├── index.ts
│   │   │   └── shared
│   │   │       ├── NodeFooter.tsx
│   │   │       ├── NodeHeader.tsx
│   │   │       └── RecipientSelector.tsx
│   │   ├── components
│   │   │   ├── index.ts
│   │   │   └── shared
│   │   │       ├── ReactFlowHandlers
│   │   │       │   ├── SourceHandler.tsx
│   │   │       │   ├── TargetHandler.tsx
│   │   │       │   └── index.ts
│   │   │       └── index.ts
│   │   ├── custom
│   │   │   ├── CustomCodeNode
│   │   │   │   ├── CustomCodeNode.tsx
│   │   │   │   ├── components
│   │   │   │   │   └── CodeEditorDialog.tsx
│   │   │   │   ├── editor
│   │   │   │   │   ├── aiogram.types.ts
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── editor.tsx
│   │   │   │   │   │   └── mono-editor.tsx
│   │   │   │   │   └── editor.setup.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── types.ts
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── triggers
│   │       ├── CallbackQueryTrigger
│   │       │   ├── CallbackQueryTrigger.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── CommandTrigger
│   │       │   ├── CommandTriggerNode.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── MessageTrigger
│   │       │   ├── MessageTrigger.tsx
│   │       │   ├── components
│   │       │   │   ├── FilterSelector.tsx
│   │       │   │   ├── ParameterInput
│   │       │   │   │   ├── RadiusInput.tsx
│   │       │   │   │   ├── SizeInput.tsx
│   │       │   │   │   ├── ValueInput.tsx
│   │       │   │   │   └── index.tsx
│   │       │   │   ├── TriggerHeader.tsx
│   │       │   │   └── TypeSelector.tsx
│   │       │   ├── index.ts
│   │       │   ├── types.ts
│   │       │   └── utils.ts
│   │       ├── ReplyButtonTrigger
│   │       │   ├── ReplyButtonTrigger.tsx
│   │       │   ├── index.ts
│   │       │   └── types.ts
│   │       ├── index.ts
│   │       └── shared
│   ├── store
│   │   ├── actions.ts
│   │   ├── clipboardSlice.ts
│   │   ├── flowSlice.ts
│   │   ├── index.ts
│   │   └── types.ts
│   └── types
├── hooks
│   └── useWebSocketLogs.ts
├── just.py
├── lib
│   └── utils.ts
├── log-server.mjs
├── next-env.d.ts
├── next.config.ts
├── nodes.json
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── types
    └── element-types.ts
```

## 📄 Muhim Fayllar Tarkibi (içidan: constructor)

### 📄 constructor.tsx

```tsx
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

```

