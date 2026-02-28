import React from "react";
import { CircleDot } from "lucide-react";
import { Handle, Position } from "reactflow";

export function TargetHandles() {
  return (
    <Handle
      type="target"
      position={Position.Left}
      className="customHandle"
      id="target-handler"
      isConnectableStart={false}
    >
      <CircleDot size={12} className="w-2 h-2 text-white" />
    </Handle>
  );
}
