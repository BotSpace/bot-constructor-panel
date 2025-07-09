import React from "react";
import { CircleDot } from "lucide-react";
import { Handle, Position } from "reactflow";

export function TargetHandler() {
  return (
    <Handle
      type="target"
      position={Position.Top}
      className="!w-4 !h-4 !bg-sky-500 !border-2 !border-gray-800 flex items-center justify-center"
    >
      <CircleDot size={12} className="w-2 h-2 text-white" />
    </Handle>
  );
}
