import React from "react";
import { Handle, Position } from "reactflow";
import { useIsInNodePanel } from "@/features/bot-constructor/hooks/NodePanelContext";

export function TargetHandles() {
  const inPanel = useIsInNodePanel();
  if (inPanel) return null;

  return (
    <Handle
      type="target"
      position={Position.Left}
      id="target-handler"
      isConnectableStart={false}
      style={{
        width: 16,
        height: 16,
        left: 0,
        top: "50%",
        transform: "translate(-50%, -50%)",
        opacity: 0,
        pointerEvents: "auto",
      }}
    />
  );
}
