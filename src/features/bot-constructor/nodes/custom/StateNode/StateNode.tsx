import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";

import React, { useMemo, useState } from "react";
import { NodeProps, useEdges, useNodes } from "reactflow";
import { Database, ChevronDown, Key, Type } from "lucide-react";
import { StateNodeData } from "./types";
import { SourceHandler, TargetHandler } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";

export function StateNode({ id, data, selected }: NodeProps<StateNodeData>) {
  const nodes = useNodes();
  const edges = useEdges();
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isExpanded, setIsExpanded] = useState(true);

  // --- O'ZGARTIRISH: Mantiq to'liq yangilandi va soddalashtirildi ---
  const availableTypes = useMemo<{
    dynamic: string[];
    default: string[];
    custom: string[];
    all: string[];
  }>(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) {
      return {
        dynamic: [],
        default: [],
        custom: ["Custom"],
        all: ["Custom"],
      };
    }

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode) {
      return {
        dynamic: [],
        default: [],
        custom: ["Custom"],
        all: ["Custom"],
      };
    }

    const parentNodeData = parentNode.data as any;

    const defaultFilters = [
      `user_id`,
      `first_name`,
      `last_name`,
      `username`,
      `language_code`,
      `is_bot`,
      `is_premium`,
    ];
    let dynamicFilters: string[] = [];

    switch (parentNodeData.node_type) {
      case "MessageTriggerNode":
        // Parent node'ning type'iga qarab dynamic ma'lumotlar
        const messageType = parentNodeData.type;
        switch (messageType) {
          case "phone":
            dynamicFilters = ["phone"];
            break;
          case "text":
            dynamicFilters = ["text"];
            break;
          case "location":
            dynamicFilters = ["location", "latitude", "longitude"];
            break;
          case "contact":
            dynamicFilters = ["contact"];
            break;
          case "document":
            dynamicFilters = [
              "document",
              "mime_type",
              "file_name",
              "file_size",
              "file_path",
            ];
            break;
          case "photo":
            dynamicFilters = ["photo"];
            break;
          case "video":
            dynamicFilters = ["video"];
            break;
          case "audio":
            dynamicFilters = ["audio"];
            break;
          case "sticker":
            dynamicFilters = ["sticker"];
            break;
          case "any":
          case "any_text":
            // "Har qanday" turlari uchun dynamic filter yo'q
            dynamicFilters = [];
            break;
          default:
            // Agar type belgilanmagan bo'lsa, filter'ga qarab tekshiramiz
            const messageFilter = parentNodeData.filter;
            switch (messageFilter) {
              case "phone":
                dynamicFilters = ["phone"];
                break;
              case "text":
                dynamicFilters = ["text"];
                break;
              case "location":
                dynamicFilters = ["location", "latitude", "longitude"];
                break;
              case "contact":
                dynamicFilters = ["contact"];
                break;
              case "document":
                dynamicFilters = [
                  "document",
                  "mime_type",
                  "file_name",
                  "file_size",
                  "file_path",
                ];
                break;
              case "photo":
                dynamicFilters = ["photo"];
                break;
              case "video":
                dynamicFilters = ["video"];
                break;
              case "audio":
                dynamicFilters = ["audio"];
                break;
              case "sticker":
                dynamicFilters = ["sticker"];
                break;
            }
            break;
        }
        break;
      case "ReplyButtonTriggerNode":
        dynamicFilters = [];
        break;
      case "CommandTriggerNode":
        dynamicFilters = [];
        break;
      case "CallbackQueryTriggerNode":
        dynamicFilters = [];
        break;
    }

    const allTypes = [...defaultFilters, ...dynamicFilters, "Custom"];

    return {
      dynamic: dynamicFilters,
      default: defaultFilters,
      custom: ["Custom"],
      all: allTypes,
    };
  }, [nodes, edges, id]);

  const isCustomType = useMemo(() => {
    if (data.type === "Custom") return true;
    if (data.type && !availableTypes.all.includes(data.type)) return true;
    return false;
  }, [data.type, availableTypes.all]);

  // Agar type ro'yxatda bo'lmasa, uni customType sifatida ko'rsatish
  const displayCustomType = useMemo(() => {
    if (data.type === "Custom") return data.customType || "";
    if (data.type && !availableTypes.all.includes(data.type)) {
      return data.type; // Eski custom type'ni ko'rsatish
    }
    return data.customType || "";
  }, [data.type, data.customType, availableTypes.all]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { key: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    if (value === "Custom") {
      // Agar avval custom type bo'lgan bo'lsa, uni saqlash
      const prevCustomType =
        data.type && !availableTypes.all.includes(data.type)
          ? data.type
          : data.customType || "";
      updateNodeData(id, { type: "Custom", customType: prevCustomType });
    } else {
      updateNodeData(id, { type: value, customType: undefined });
    }
  };

  // Combobox uchun options
  const comboboxOptions = useMemo<ComboboxOption[]>(() => {
    const options: ComboboxOption[] = [];

    // Default filters
    if (availableTypes.default.length > 0) {
      availableTypes.default.forEach((type) => {
        options.push({ value: type, label: type, group: "Default" });
      });
    }

    // Dynamic filters
    if (availableTypes.dynamic.length > 0) {
      availableTypes.dynamic.forEach((type) => {
        options.push({ value: type, label: type, group: "Dynamic" });
      });
    }

    // Custom option
    availableTypes.custom.forEach((type) => {
      options.push({ value: type, label: type, group: "Custom" });
    });

    return options;
  }, [availableTypes]);

  const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { customType: e.target.value });
  };

  // Node sozlanganligini tekshirish
  const isConfigured = useMemo(() => {
    if (!data.key) return false;
    if (isCustomType) {
      return !!data.customType && data.customType.trim() !== "";
    }
    return !!data.type && data.type !== "Custom";
  }, [data.key, data.type, data.customType, isCustomType]);

  // Ko'rsatish uchun type nomi
  const displayType = useMemo(() => {
    if (isCustomType) {
      return displayCustomType || "Custom";
    }
    return data.type || "";
  }, [isCustomType, displayCustomType, data.type]);

  return (
    <Card
      className={`w-80 rounded-xl border shadow-lg transition-all overflow-hidden ${
        selected
          ? "border-sky-500/80 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500/20"
          : "border-gray-700/50 shadow-md"
      }`}
    >
      <TargetHandler />

      <CardHeader className="pb-3 px-6 pt-6">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm flex items-center justify-between cursor-pointer group rounded-lg p-2 -m-2 hover:bg-gray-800/50 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1">
            <Database className="h-4 w-4 text-purple-400 flex-shrink-0" />
            <span className="font-medium text-gray-200">State</span>
            {data.key && (
              <Badge
                variant="secondary"
                className="border-gray-600/50 text-xs px-1.5 py-0"
              >
                {data.key}
              </Badge>
            )}
            {displayType && !isCustomType && (
              <Badge
                variant="outline"
                className="border-blue-500/50 text-blue-400 text-xs px-1.5 py-0"
              >
                {displayType}
              </Badge>
            )}
            {isCustomType && displayCustomType && (
              <Badge
                variant="outline"
                className="border-purple-500/50 text-purple-400 text-xs px-1.5 py-0"
              >
                Custom
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

      {isExpanded && (
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="key"
              className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"
            >
              <Key className="h-3 w-3" />
              State Key
            </Label>
            <Input
              id="key"
              type="text"
              placeholder="Masalan: user_id, session_data..."
              value={data.key || ""}
              onChange={handleKeyChange}
              className="w-full bg-gray-800/50 border-gray-600/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="type"
              className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"
            >
              <Type className="h-3 w-3" />
              Type
            </Label>
            <Combobox
              options={comboboxOptions}
              value={isCustomType ? "Custom" : data.type || ""}
              onValueChange={handleTypeChange}
              placeholder="Type tanlang"
              searchPlaceholder="Type qidirish..."
              emptyText="Hech narsa topilmadi"
              triggerClassName="h-9 text-sm"
            />

            {isCustomType && (
              <div className="space-y-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-200 mt-2">
                <Label
                  htmlFor="customType"
                  className="text-xs text-gray-400 flex items-center gap-1.5 font-medium"
                >
                  <Database className="h-3 w-3" />
                  Custom Type
                </Label>
                <Input
                  id="customType"
                  type="text"
                  placeholder="Masalan: custom_field, my_data..."
                  value={displayCustomType}
                  onChange={handleCustomTypeChange}
                  className="w-full bg-gray-800/50 border-purple-500/30 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                  O'zingizning custom ma'lumot turingizni kiriting
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}

      <SourceHandler />
    </Card>
  );
}
