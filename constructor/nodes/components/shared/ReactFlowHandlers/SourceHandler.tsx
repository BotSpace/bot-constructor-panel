import React from "react";

import { PlusIcon } from "lucide-react";
import { Handle, Position } from "reactflow";

type Props = {};

export function SourceHandler({}: Props) {
  return (
    <>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-4 !h-4 !bg-blue-500 flex items-center justify-center"
      >
        <PlusIcon size={12} className="w-2 h-2 text-white" />
      </Handle>
    </>
  );
}
