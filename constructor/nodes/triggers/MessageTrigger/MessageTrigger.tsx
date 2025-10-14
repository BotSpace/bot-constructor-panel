import { memo, useMemo, useState } from "react";
import { NodeProps } from "reactflow";
import { useFlowStore } from "@/constructor/store";
import { MessageTriggerNodeData } from "./types";
import { getFiltersForType } from "./utils";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { TriggerHeader } from "./components/TriggerHeader";
import { TypeSelector } from "./components/TypeSelector";
import { FilterSelector } from "./components/FilterSelector";
import { ParameterInput } from "./components/ParameterInput";
import { SourceHandler, TargetHandler } from "../../components";

const MessageTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<MessageTriggerNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleUpdate = (update: Partial<MessageTriggerNodeData>) => {
    updateNodeData(id, update);
  };

  const onTypeChange = (newType: string) => {
    handleUpdate({ type: newType, filter: undefined, context: {} });
  };

  const onFilterChange = (newFilter: string) => {
    handleUpdate({ filter: newFilter, context: {} });
  };

  const { filtersForType, isNodeConfigured } = useMemo(() => {
    const filters = getFiltersForType(data.type);

    const configured =
      data.type === "any" ||
      data.type === "any_text" ||
      (!!data.type && !!data.filter);

    return {
      filtersForType: filters,
      isNodeConfigured: configured,
    };
  }, [data.type, data.filter]);

  const showFilterSection =
    data.type && data.type !== "any" && data.type !== "any_text";

  return (
    <Card
      className={`w-80 rounded-lg shadow-xl bg-[#212529] border-2 ${
        selected ? "border-sky-500/80" : "border-gray-600/50"
      }`}

      // className={`w-100 rounded-lg shadow-md bg-gray-800 border-gray-700 ${
      //   selected ? "ring-2 ring-blue-500/80" : ""
      // }`}
    >
      <TargetHandler />

      <TriggerHeader
        isExpanded={isExpanded}
        isConfigured={isNodeConfigured}
        dataType={data.type}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <CardContent className="p-4 pt-2 space-y-4 w-full">
          <div className="space-y-1.5 w-full">
            <Label className="text-xs text-gray-400">Xabar turi</Label>
            <TypeSelector
              value={data.type || ""}
              onValueChange={onTypeChange}
            />
          </div>

          {showFilterSection && (
            <div className="space-y-1.5 animate-in fade-in-50">
              <Label className="text-xs text-gray-400">Filter</Label>
              <FilterSelector
                value={data.filter || ""}
                onValueChange={onFilterChange}
                options={filtersForType}
              />
            </div>
          )}

          {showFilterSection && data.filter && data.filter !== "any" && (
            <div className="space-y-1.5 animate-in fade-in-50">
              <Label className="text-xs text-gray-400">Parametr</Label>
              <ParameterInput
                filter={data.filter}
                context={data.context}
                onContextUpdate={(context) => handleUpdate({ context })}
              />
            </div>
          )}
        </CardContent>
      )}

      <SourceHandler />
    </Card>
  );
};

export const MessageTriggerNode = memo(MessageTriggerNodeComponent);
