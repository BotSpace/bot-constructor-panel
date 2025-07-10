import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Ranglar palitrasi
const colors = [
  "#6b7280", // Gray
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
];

interface EdgeContextMenuProps {
  onDelete: () => void;
  onColorChange: (color: string) => void;
}

export const EdgeContextMenu = ({
  onDelete,
  onColorChange,
}: EdgeContextMenuProps) => {
  return (
    <div className="p-1.5 bg-background border shadow-xl rounded-lg flex items-center gap-2">
      {/* Rang tanlash qismi */}
      <div className="flex items-center gap-1.5">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className="w-5 h-5 rounded-full border border-border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            style={{ backgroundColor: color }}
            aria-label={`Change color to ${color}`}
          />
        ))}
      </div>

      {/* Ajratuvchi */}
      <div className="w-px h-5 bg-border mx-1" />

      {/* O'chirish tugmasi */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        onClick={onDelete}
        aria-label="Delete edge"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
