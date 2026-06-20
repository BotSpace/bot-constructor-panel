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
      className="customHandle"
      id="target-handler"
      isConnectableStart={false}
    />
  );
}
