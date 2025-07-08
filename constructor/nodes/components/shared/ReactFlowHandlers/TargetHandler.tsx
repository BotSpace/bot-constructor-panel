import React from "react";

import { CircleDot } from "lucide-react";
import { Handle, Position } from "reactflow";

type Props = {};

export function TargetHandler({}: Props) {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-blue-500 flex items-center justify-center"
      >
        <CircleDot size={12} className="w-2 h-2 text-white" />
      </Handle>
    </>
  );
}
