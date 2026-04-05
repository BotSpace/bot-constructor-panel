import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";

import React, { useMemo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { NodeProps } from "reactflow";
import { Database, Key, Type, AlertCircle } from "lucide-react";
import { StateNodeData } from "./types";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { findNearestTriggerNode, getDynamicFilters } from "./getDynamicFilters";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { cn } from "@/lib/utils";

export function StateNode({ id, data, selected }: NodeProps<StateNodeData>) {
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);

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
      className={cn(
        "w-[150px] shadow-lg",
        selected && "ring-2 ring-primary"
      )}
    >
      <TargetHandles />

      <NodeHeader
        icon={<Database className="text-purple-400" />}
        title="State"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        color="bg-purple-500"
      />

      {!isCollapsed && (
        <CardContent className="px-4 pb-4 pt-4 space-y-3">{triggerNode ? (
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
