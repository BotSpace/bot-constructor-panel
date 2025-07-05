// FAYL: app/constructor/components/LogViewer/ResizeHandler.tsx
import React from "react";

interface ResizeHandlerProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export const ResizeHandler = ({ onMouseDown }: ResizeHandlerProps) => (
  <div
    onMouseDown={onMouseDown}
    className="absolute -top-1 left-0 w-full h-2 cursor-row-resize flex items-center justify-center group"
  >
    <div className="w-10 h-1 bg-gray-500 rounded-full group-hover:bg-primary transition-colors" />
  </div>
);
