// React va kerakli tiplarni import qilamiz
import React, { useMemo, ReactNode } from "react";
import { CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, ChevronDown, Trash } from "lucide-react";
import { ConstructorData } from "@/features/bot-constructor/data";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TriggerHeaderProps {
  /** Trigger'ning ikonasi (React komponenti yoki emoji) */
  icon?: ReactNode;
  /** Trigger'ning sarlavhasi */
  title?: string;
  /** Node yig'ilgan (collapsed) holatidami? */
  isExpanded?: boolean;
  /** Node sozlangan holatidami? */
  isConfigured?: boolean;
  /** MessageTrigger uchun xabar turi (badge ko'rsatish uchun) */
  dataType?: string;
  /** Sarlavha bosilganda chaqiriladigan funksiya */
  onToggle?: () => void;
}

// Komponentni export qilamiz
export const TriggerHeader = ({
  icon = <Settings className="h-4 w-4 text-blue-400 flex-shrink-0" />,
  title = "Trigger",
  isExpanded = true,
  isConfigured = false,
  dataType,
  onToggle,
}: TriggerHeaderProps) => {
  // Sarlavhadagi badge uchun kerakli ma'lumotlarni hisoblaymiz (faqat MessageTrigger uchun)
  const selectedTypeData = useMemo(() => {
    if (!dataType) return null;
    return ConstructorData.MessageTypes.find((type) => type.value === dataType);
  }, [dataType]);

  const TypeIcon = selectedTypeData?.icon;

  const deleteSelectedElement = useFlowStore((state) => state.deleteSelectedElements);

  // Icon'ni render qilish - agar string bo'lsa, emoji sifatida ko'rsatamiz
  const renderIcon = () => {
    if (typeof icon === "string") {
      return <span className="text-lg flex-shrink-0">{icon}</span>;
    }
    return icon;
  };

  return (
    <CardHeader>
      <div
        onClick={onToggle}
        className="text-sm flex items-center justify-between cursor-pointer group rounded-lg p-2 -m-2 hover:bg-gray-700/50"
      >
        <div className="flex items-center gap-2 flex-1">
          {renderIcon()}
          <span className="font-medium text-gray-200 truncate">{title}</span>

          {TypeIcon && (
            <Badge variant="secondary" className="border-gray-600/50">
              <TypeIcon className="h-3 w-3 mr-1" />
              {selectedTypeData.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">

          <div
            className={`w-2 h-2 rounded-full transition-all ${isConfigured
              ? "bg-green-500 shadow-sm shadow-green-500/50"
              : "bg-gray-600"
              }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
          {onToggle && (
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"
                }`}
            />
          )}
        </div>
      </div>
    </CardHeader>
  );
};
