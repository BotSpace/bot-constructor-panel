import React from "react";
import { PlusIcon } from "lucide-react";
import { Handle, Position } from "reactflow";

interface SourceHandlerProps {
  id?: string;
  label?: string;
  position?: Position;
}

export function SourceHandler({ id = "source-handler", label, position = Position.Bottom }: SourceHandlerProps) {
  return (
    <div className="relative">
      <Handle
        type="source"
        position={position}
        id={id}
        className="!w-4 !h-4 !bg-sky-500 !border-2 !border-gray-800 flex items-center justify-center"
      >
        <PlusIcon
          size={12}
          className="w-2 h-2 text-white pointer-events-none"
        />
      </Handle>
      {label && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}
