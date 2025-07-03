"use client";

import React, { useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { ElementItemType } from "@/types/element-types";
import { CustomNodes } from "./nodes";
import { useFlowStore } from "./store/flowStore"; // Store'ni import qilamiz

function FlowchartInner() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { project } = useReactFlow();

  // Zustand store'dan kerakli holat va action'larni olamiz
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteSelectedElements,
  } = useFlowStore();

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const data = JSON.parse(
        event.dataTransfer.getData("application/json")
      ) as ElementItemType;

      const position = project({
        x: event.clientX - (reactFlowBounds?.left || 0),
        y: event.clientY - (reactFlowBounds?.top || 0),
      });

      // Store'dagi action'ni chaqiramiz
      addNode(data, position);
    },
    [project, addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  // Delete tugmasini bosishni eshitish
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        deleteSelectedElements();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelectedElements]);

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-[calc(100vh-56px)]"
      onDrop={onDrop}
      onDragOver={onDragOver}
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
        deleteKeyCode={null}
      >
        <Background gap={24} color="#666" />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}

// Bu qism o'zgarishsiz qoladi
export default function Flowchart() {
  return (
    <ReactFlowProvider>
      <FlowchartInner />
    </ReactFlowProvider>
  );
}
