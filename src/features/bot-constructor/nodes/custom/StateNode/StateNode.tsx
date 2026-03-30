import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";

import React, { useMemo } from "react";
import { useNodeExpanded } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { NodeProps, useEdges, useNodes } from "reactflow";
import { Database, ChevronDown, Key, Type, AlertCircle } from "lucide-react";
import { StateNodeData } from "./types";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { findNearestTriggerNode, getDynamicFilters } from "./getDynamicFilters";

export function StateNode({ id, data, selected }: NodeProps<StateNodeData>) {
  const [isExpanded, setIsExpanded] = useNodeExpanded();

  const nodes = useNodes();
  const edges = useEdges();

  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const triggerNode = useMemo(
    () => findNearestTriggerNode(id, nodes, edges),
    [id, nodes, edges]
  );

  const dynamicFilterOptions = useMemo(
    () => getDynamicFilters(triggerNode),
    [triggerNode]
  );

  const triggerLabel = useMemo(() => {
    if (!triggerNode) return null;
    const type = triggerNode.type || "";
    return type.replace("Node", "").replace(/([A-Z])/g, " $1").trim();
  }, [triggerNode]);

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { key: e.target.value });
  };

  const handleTypeChange = (value: string) => {
    if (value === "__custom__") {
      updateNodeData(id, { type: "__custom__", customType: data.customType || "" });
    } else {
      updateNodeData(id, { type: value, customType: undefined });
    }
  };

  const handleCustomTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeData(id, { customType: e.target.value });
  };

  const isConfigured = !!data.key && !!data.type;

  const comboboxOptions = useMemo(() => {
    return [
      ...dynamicFilterOptions,
      { value: "__custom__", label: "Custom (o'zingiz kiriting)", group: "Boshqa" },
    ];
  }, [dynamicFilterOptions]);

  return (
    <Card
      className={`w-[150px] rounded-xl border shadow-lg transition-all overflow-hidden ${selected
        ? "border-sky-500/80 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500/20"
        : "border-border shadow-md"
        }`}
    >
      <TargetHandles />

      <CardHeader className="pb-3 px-6 pt-6">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm flex items-center justify-between cursor-pointer group rounded-lg p-2 -m-2 hover:bg-muted/60 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1">
            <Database className="h-4 w-4 text-purple-400 flex-shrink-0" />
            <span className="font-medium text-foreground">State</span>
            {data.key && (
              <Badge
                variant="secondary"
                className="border-gray-600/50 text-xs px-1.5 py-0"
              >
                {data.key}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div
              className={`w-2 h-2 rounded-full transition-all ${isConfigured
                ? "bg-green-500 shadow-sm shadow-green-500/50"
                : "bg-muted-foreground/40"
                }`}
              title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
            />
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transform transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"
                }`}
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          {triggerNode ? (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-purple-500/10 border border-purple-500/20">
              <Database className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
              <span className="text-xs text-purple-300 truncate">
                {triggerLabel}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-xs text-amber-300">
                Trigger node ulanmagan
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="key"
              className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium"
            >
              <Key className="h-3 w-3" />
              State Key
            </Label>
            <Input
              id="key"
              type="text"
              placeholder="Masalan: user_phone, user_name..."
              value={data.key || ""}
              onChange={handleKeyChange}
              className="w-full bg-muted/50 border-border focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="type"
              className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium"
            >
              <Type className="h-3 w-3" />
              Saqlanadigan ma'lumot
            </Label>
            <Combobox
              options={comboboxOptions}
              value={data.type || ""}
              onValueChange={handleTypeChange}
              placeholder="Ma'lumot turini tanlang..."
              searchPlaceholder="Qidirish..."
              emptyText="Hech narsa topilmadi"
              triggerClassName="h-9 text-sm"
            />

            {data.type === "__custom__" && (
              <div className="space-y-1.5 animate-in fade-in-50 slide-in-from-top-1 duration-200 mt-2">
                <Label
                  htmlFor="customType"
                  className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium"
                >
                  <Database className="h-3 w-3" />
                  Custom Type
                </Label>
                <Input
                  id="customType"
                  type="text"
                  placeholder="Masalan: custom_field, my_data..."
                  value={data.customType || ""}
                  onChange={handleCustomTypeChange}
                  className="w-full bg-muted/50 border-border focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  O'zingizning custom ma'lumot turingizni kiriting
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}

      <SourceHandles nodeId={id} />
    </Card>
  );
}
