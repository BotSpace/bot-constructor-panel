// React va kerakli tiplarni import qilamiz
import React, { useMemo } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, ChevronDown } from "lucide-react";
import { ConstructorData } from "@/features/bot-constructor/data";

interface TriggerHeaderProps {
  isExpanded: boolean;
  isConfigured: boolean;
  dataType?: string;
  onToggle: () => void;
}

// Komponentni export qilamiz
export const TriggerHeader = ({
  isExpanded,
  isConfigured,
  dataType,
  onToggle,
}: TriggerHeaderProps) => {
  // Sarlavhadagi badge uchun kerakli ma'lumotlarni hisoblaymiz
  const selectedTypeData = useMemo(() => {
    if (!dataType) return null;
    return ConstructorData.MessageTypes.find((type) => type.value === dataType);
  }, [dataType]);

  const TypeIcon = selectedTypeData?.icon;

  return (
    <CardHeader>
      <div
        onClick={onToggle}
        className="text-sm flex items-center justify-between cursor-pointer group rounded-lg p-2 -m-2 hover:bg-gray-700/50"
      >
        <div className="flex items-center gap-2 flex-1">
          <Settings className="h-4 w-4 text-blue-400 flex-shrink-0" />
          <span className="font-medium text-gray-200 truncate">Handler</span>
          {TypeIcon && (
            <Badge variant="secondary" className="border-gray-600/50">
              <TypeIcon className="h-3 w-3 mr-1" />
              {selectedTypeData.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <div
            className={`w-2 h-2 rounded-full transition-all ${
              isConfigured
                ? "bg-green-500 shadow-sm shadow-green-500/50"
                : "bg-gray-600"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${
              isExpanded ? "rotate-0" : "-rotate-90"
            }`}
          />
        </div>
      </div>
    </CardHeader>
  );
};
