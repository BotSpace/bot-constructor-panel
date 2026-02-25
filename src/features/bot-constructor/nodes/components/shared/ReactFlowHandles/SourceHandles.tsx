import React from "react";
import { PlusIcon } from "lucide-react";
import { Handle, Position } from "reactflow";

interface SourceHandlerProps {
  id?: string;
  position?: Position;
}

export function SourceHandles({
  id = "source-handler",
  position = Position.Right,
}: SourceHandlerProps) {
  return (
    <Handle
      type="source"
      position={position}
      id={id}
      className="!w-4 !h-4 !bg-sky-500 !border-2 !border-gray-800 flex items-center justify-center"
    >
      <PlusIcon size={12} className="w-2 h-2 text-white pointer-events-none" />
    </Handle>
  );
}
