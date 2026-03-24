import React, { useCallback, useMemo } from "react";
import { Handle, Position, useEdges, useNodeId, useNodes } from "reactflow";
import { cn } from "@/lib/utils";

interface SourceHandlerProps {
  id?: string;
  position?: Position;
  className?: string;
}

export function SourceHandles({
  id = "source-handler",
  position,
  className,
}: SourceHandlerProps) {
  const nodes = useNodes();
  const edges = useEdges();
  const sourceNodeId = useNodeId();

  const sourceNode = useMemo(
    () => nodes.find((n) => n.id === sourceNodeId),
    [nodes, sourceNodeId]
  );

  const getHandlePosition = useCallback(
    (handleId: string): Position => {
      if (!sourceNode || !sourceNodeId) return position ?? Position.Right;
      const edge = edges.find(
        (e) => e.source === sourceNodeId && e.sourceHandle === handleId
      );
      if (!edge) return position ?? Position.Right;
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!targetNode) return position ?? Position.Right;
      return targetNode.position.x < sourceNode.position.x
        ? Position.Left
        : Position.Right;
    },
    [sourceNode, edges, nodes, sourceNodeId, position]
  );

  const pos = getHandlePosition(id);

  return (
    <Handle
      type="source"
      position={pos}
      id={id}
      className={cn(
        "!w-3 !h-3 !rounded-full !bg-zinc-400/60 !border-2 !border-background",
        "hover:!bg-blue-600 hover:!border-blue-400 hover:!scale-125 !transition-all !duration-150",
        className
      )}
    />
  );
}
