"use client";

import { useState, memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Settings, ChevronDown } from "lucide-react";
import { ConstructorData } from "@/constructor/data"; // Sizning statik ma'lumotlaringiz
import { Handle, Position, NodeProps } from "reactflow";
import { useFlowStore } from "@/constructor/store/flowStore"; // Bizning global store
import { MessageTriggerNodeData } from "./types"; // Shu komponent uchun maxsus tip

// memo'dan foydalanish performans uchun juda muhim!
const MessageTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<MessageTriggerNodeData>) => {
  // Global holatdan faqat kerakli action'ni olamiz.
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // UI'ga tegishli holat (ochiq/yopiq). Bu ma'lumot global saqlanishi shart emas.
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // MARKAZLASHGAN YANGILASH FUNKSIYASI
  // Bu funksiya orqali barcha o'zgarishlar global store'ga yuboriladi.
  const handleUpdate = (update: Partial<MessageTriggerNodeData>) => {
    updateNodeData(id, update);
  };

  // Ma'lumot turi o'zgarganda, unga bog'liq bo'lgan filter va context'ni tozalaymiz
  const onTypeChange = (newType: string) => {
    handleUpdate({
      type: newType,
      filter: "", // Filterni tozalash
      context: {}, // Contextni tozalash
    });
  };

  // Faqat filter o'zgarganda context'ni tozalash
  const onFilterChange = (newFilter: string) => {
    handleUpdate({
      filter: newFilter,
      context: {}, // Contextni tozalash
    });
  };

  // Kontekst inputlarini yangilash uchun funksiyalar
  const handleContextValueUpdate = (value: string) => {
    handleUpdate({ context: { ...data.context, value } });
  };

  const handleRadiusContextUpdate = (
    field: "lat" | "lng" | "km",
    value: string
  ) => {
    handleUpdate({
      context: {
        ...data.context,
        radius: { ...data.context?.radius, [field]: value },
      },
    });
  };

  const handleSizeContextUpdate = (field: "min" | "max", value: string) => {
    handleUpdate({
      context: {
        ...data.context,
        size: { ...data.context?.size, [field]: value },
      },
    });
  };

  // Ma'lumotlarni hisoblash uchun memo'dan foydalanish
  const {
    selectedTypeData,
    selectedFilterData,
    filtersForType,
    isNodeConfigured,
  } = useMemo(() => {
    const getFiltersForType = (type: string) => {
      switch (type) {
        case "text":
          return ConstructorData.Filters.textFilters;
        case "location":
          return ConstructorData.Filters.locationFilters;
        case "document":
        case "photo":
        case "video":
        case "audio":
          return ConstructorData.Filters.fileFilters;
        default:
          return [{ value: "any", label: "Har qanday" }];
      }
    };

    const filters = data.type ? getFiltersForType(data.type) : [];

    return {
      selectedTypeData: ConstructorData.MessageTypes.find(
        (type) => type.value === data.type
      ),
      selectedFilterData: filters.find(
        (filter) => filter.value === data.filter
      ),
      filtersForType: filters,
      isNodeConfigured: !!(data.type && data.filter),
    };
  }, [data.type, data.filter]);

  const renderContextInput = () => {
    if (!data.filter || data.filter === "any") return null;
    const inputClass =
      "h-8 text-xs border-gray-700 text-gray-100 placeholder:text-gray-400";

    switch (data.filter) {
      case "regex":
      case "command":
      case "contains":
        return (
          <Input
            placeholder="..."
            value={data.context?.value || ""}
            onChange={(e) => handleContextValueUpdate(e.target.value)}
            className={`${inputClass} font-mono`}
          />
        );
      case "extension":
        return (
          <Input
            placeholder="pdf,jpg,png"
            value={data.context?.value || ""}
            onChange={(e) => handleContextValueUpdate(e.target.value)}
            className={inputClass}
          />
        );
      case "radius":
        return (
          <div className="grid grid-cols-3 gap-1">
            <Input
              placeholder="Lat"
              value={data.context?.radius?.lat || ""}
              onChange={(e) => handleRadiusContextUpdate("lat", e.target.value)}
              className={`${inputClass} font-mono`}
            />
            <Input
              placeholder="Lng"
              value={data.context?.radius?.lng || ""}
              onChange={(e) => handleRadiusContextUpdate("lng", e.target.value)}
              className={`${inputClass} font-mono`}
            />
            <Input
              placeholder="Km"
              value={data.context?.radius?.km || ""}
              onChange={(e) => handleRadiusContextUpdate("km", e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
        );
      case "size":
        return (
          <div className="grid grid-cols-2 gap-1">
            <Input
              placeholder="Min MB"
              value={data.context?.size?.min || ""}
              onChange={(e) => handleSizeContextUpdate("min", e.target.value)}
              className={`${inputClass} font-mono`}
            />
            <Input
              placeholder="Max MB"
              value={data.context?.size?.max || ""}
              onChange={(e) => handleSizeContextUpdate("max", e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const TypeIcon = selectedTypeData?.icon;

  return (
    <Card
      className={`w-80 rounded-lg shadow-md bg-gray-800 border-gray-700 ${
        selected ? "ring-2 ring-blue-500/80" : "border-gray-700"
      }`}
    >
      <CardHeader className="p-2">
        <CardTitle
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm flex items-center justify-between cursor-pointer group rounded-lg p-2 -m-2 hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
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
                isNodeConfigured
                  ? "bg-green-500 shadow-sm shadow-green-500/50"
                  : "bg-gray-600"
              }`}
            />
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transform transition-transform duration-200 ${
                isExpanded ? "rotate-0" : "-rotate-90"
              }`}
            />
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-400">Xabar turi</Label>
            <Select value={data.type || ""} onValueChange={onTypeChange}>
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue placeholder="Tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {ConstructorData.MessageTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-3 w-3" />
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {data.type && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Filter</Label>
              <Select value={data.filter || ""} onValueChange={onFilterChange}>
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  {filtersForType.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {data.filter && data.filter !== "any" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-400">Parametr</Label>
              {renderContextInput()}
            </div>
          )}
        </CardContent>
      )}

      {!isExpanded && isNodeConfigured && (
        <CardContent className="pt-0 pb-3 px-4">
          <div className="flex items-center justify-between text-xs text-gray-300">
            <div className="flex items-center gap-1.5">
              {TypeIcon && <TypeIcon className="h-3 w-3 text-gray-400" />}
              <span>{selectedTypeData?.label}</span>
            </div>
            {selectedFilterData && (
              <Badge variant="outline" className="text-xs font-normal">
                {selectedFilterData.label}
              </Badge>
            )}
          </div>
        </CardContent>
      )}

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        className="!bg-sky-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="!bg-teal-500"
      />
    </Card>
  );
};

// Asl komponentni memo bilan o'rab eksport qilamiz
export const MessageTriggerNode = memo(MessageTriggerNodeComponent);
