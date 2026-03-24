import React from "react";
import { Handle, Position } from "reactflow";

export function EditMessageSource() {
  return (
    <Handle
      type="source"
      position={Position.Right}
      className="!w-3 !h-3 !rounded-full !bg-orange-500/60 !border-2 !border-background hover:!bg-orange-500 hover:!scale-125 !transition-all !duration-150"
      id="edit-message-source"
      style={{ top: "50%" }}
      title="Tahrirlanadigan Xabar"
    />
  );
}
