// FAYL: constructor/components/ButtonGenerator/components/PreviewButton.tsx (YANGI)
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonConfig } from "../types";
import { getIconForButton } from "../utils";

interface PreviewButtonProps {
  button: ButtonConfig;
  onRemove: () => void;
  isFullWidth: boolean;
}

export const PreviewButton = ({
  button,
  onRemove,
  isFullWidth,
}: PreviewButtonProps) => (
  <div
    className={cn(
      "relative group overflow-hidden",
      isFullWidth ? "flex-grow" : "flex-1"
    )}
  >
    <Button variant="outline" className="pr-8 cursor-default w-full truncate">
      {getIconForButton(button)}
      <span className="truncate">{button.text}</span>
    </Button>
    <Button
      variant="destructive"
      size="icon"
      className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={(e) => {
        e.stopPropagation();
        onRemove();
      }}
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  </div>
);
