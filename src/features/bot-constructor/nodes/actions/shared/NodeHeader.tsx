import { ReactNode } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, LayoutGrid } from "lucide-react";

interface NodeHeaderProps {
  /** Node'ning asosiy ikonasi */
  icon: ReactNode;
  /** Node'ning nomi (sarlavhasi) */
  title: string;
  /** Node ID (ixtiyoriy) */
  nodeId?: string;
  /** Color class (ixtiyoriy) */
  /** Tugmalar sonini ko'rsatish uchun (ixtiyoriy) */
  buttonCount?: number;
  /** Node yig'ilgan (collapsed) holatidami? */
  isCollapsed?: boolean;
  /** Sarlavha bosilganda chaqiriladigan funksiya */
  onToggleCollapse?: () => void;
}

export const NodeHeader = ({
  icon,
  title,
  buttonCount = 0,
  isCollapsed = false,
  onToggleCollapse,
}: NodeHeaderProps) => {
  return (
    <CardHeader onClick={onToggleCollapse}>
      <div
        className="h flex flex-row items-center justify-between p-3 cursor-pointer hover:bg-secondary rounded-md transition-colors"
        role="button"
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {title}
        </CardTitle>

        <div className="flex items-center gap-2">
          {buttonCount > 0 && (
            <Badge variant="secondary" className="font-normal">
              <LayoutGrid className="w-3 h-3 mr-1" />
              {buttonCount}
            </Badge>
          )}

          {onToggleCollapse && (
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform",
                isCollapsed && "transform -rotate-90"
              )}
            />
          )}
        </div>
      </div>
    </CardHeader>
  );
};
