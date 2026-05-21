import React, { useCallback, useMemo } from "react";
import { Position } from "reactflow";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { useFlowStore } from "@/features/bot-constructor/store";
import { PillHandle, PillHandleTone } from "./PillHandle";

interface SourceHandlerProps {
  id?: string;
  position?: Position;
  className?: string;
  nodeId?: string;
  tone?: PillHandleTone;
}

// NodeHeader balandligi taxminan 75-80px (icon markazi).
// Asosiy source handle ni shu darajada anchor qilamiz, shunda
// tagidagi tugma handlelari bilan to'qnashmaydi.
const MAIN_SOURCE_TOP_OFFSET = 78;

export function SourceHandles({
  id = "source-handler",
  position,
  className,
  nodeId,
  tone = "accent",
}: SourceHandlerProps) {
  const inPanel = useIsInNodePanel();
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const sourceNodeId = nodeId;

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

  if (inPanel) return null;

  const pos = getHandlePosition(id);

  return (
    <PillHandle
      id={id}
      type="source"
      position={pos}
      tone={tone}
      className={className}
      style={{ top: MAIN_SOURCE_TOP_OFFSET }}
    />
  );
}
