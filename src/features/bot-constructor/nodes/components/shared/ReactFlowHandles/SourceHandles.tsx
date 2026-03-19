import React, { useCallback, useMemo } from "react";
import { PlusIcon } from "lucide-react";
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

  // Source node ni topish
  const sourceNode = useMemo(() => {
    return nodes.find((n) => n.id === sourceNodeId);
  }, [nodes, sourceNodeId]);

  /**
   * Handle uchun pozitsiyani aniqlash:
   * Agar ulangan target node source node dan chap tarafda bo'lsa → Left
   * Aks holda → Right (default)
   */
  const getHandlePosition = useCallback(
    (handleId: string): Position => {
      if (!sourceNode || !sourceNodeId) return position ?? Position.Right;

      // Shu handle dan chiqqan edge ni topamiz
      const edge = edges.find(
        (e) => e.source === sourceNodeId && e.sourceHandle === handleId
      );
      if (!edge) return position ?? Position.Right;

      // Target node ni topamiz
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!targetNode) return position ?? Position.Right;

      const sourceX = sourceNode.position.x;
      const targetX = targetNode.position.x;

      // Agar target node chap tarafda bo'lsa, handle ham chap tarafga o'tadi
      return targetX < sourceX ? Position.Left : Position.Right;
    },
    [sourceNode, edges, nodes, sourceNodeId, position]
  );

  const handleId = id;
  const pos = getHandlePosition(handleId);
  const isLeft = pos === Position.Left;

  return (
    <Handle
      type="source"
      position={pos}
      id={handleId}
      className={cn(`!w-6 !h-14 !bg-sky-500 !rounded-[10px] !border-white/20 flex items-center justify-center ${isLeft ? 'translate-x-[5px]' : 'translate-x-[-5px]'}`, className)}
    >
      <PlusIcon size={12} className="w-2 h-2 text-white pointer-events-none" />
    </Handle>
  );
}
