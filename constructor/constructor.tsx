"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ReactFlowProvider,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { ElementItemType } from "@/types/element-types";
import { CustomNodes } from "./nodes";

let id = 0;
const getId = () => `node_${id++}`;

function FlowchartInner() {
  const reactFlowWrapper = useRef<HTMLDivElement | null>(null);
  const { project } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

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

      const newNode: Node = {
        id: getId(),
        type: data.triggerId,
        position,
        data: data,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [project]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes);
  }, []);

  // Delete selected nodes or edges with 'Delete' key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setNodes, setEdges]);

  const onNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (event.ctrlKey) {
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              // Snapping to 10px grid
              return {
                ...n,
                position: {
                  x: Math.round(node.position.x / 10) * 10,
                  y: Math.round(node.position.y / 10) * 10,
                },
              };
            }
            return n;
          })
        );
      }
    },
    [setNodes]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-[calc(100vh-56px)]"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        onNodeDrag={onNodeDrag}
        nodes={nodes}
        edges={edges}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={onSelectionChange}
        nodeTypes={CustomNodes}
        fitView
        panOnScroll
        selectionOnDrag
        multiSelectionKeyCode={["Shift"]}
        deleteKeyCode={null} // Biz o'zimiz delete event qilyapmiz
      >
        <Background gap={24} color="#666" />
        <MiniMap />
        <Controls />
      </ReactFlow>
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
