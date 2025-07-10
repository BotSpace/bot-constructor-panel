import React from "react";
import { PlusIcon } from "lucide-react";
import { Handle, Position } from "reactflow";

export function SourceHandler() {
  return (
    <Handle
      type="source"
      position={Position.Bottom}
      // Handle'ga stil berish uchun asosiy klasslar
      className="!w-4 !h-4 !bg-sky-500 !border-2 !border-gray-800 flex items-center justify-center"
    >
      <PlusIcon
        size={12}
        // MUHIM: Bu klass sichqoncha hodisalarini "o'tkazib yuboradi"
        className="w-2 h-2 text-white pointer-events-none"
      />
    </Handle>
  );
}
