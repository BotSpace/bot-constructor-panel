import { memo, useMemo } from "react";
import { useNodeExpanded } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { NodeProps } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { MessageTriggerNodeData } from "./types";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

import { TriggerHeader } from "../shared/TriggerHeader";
import { TypeSelector } from "./components/TypeSelector";
import { FilterSelector } from "./components/FilterSelector";
import { ParameterInput } from "./components/ParameterInput";
import { SourceHandles, TargetHandles } from "../../components";
import { Checkbox } from "@/components/ui/checkbox";
import { ElseMessageSource } from "../../components/shared/ReactFlowHandles/ElseMessageSource";
import { MessageTriggerValueTypes } from "@/features/bot-constructor/data/messages";
import { StateConfigUI, getStateTypesForMessageTrigger } from "../shared";
import { getFiltersForType } from "../../actions/shared/HandlerBuilder/utils";

const MessageTriggerNodeComponent = ({
    id,
    data,
    selected,
}: NodeProps<MessageTriggerNodeData>) => {
    const updateNodeData = useFlowStore((state) => state.updateNodeData);
    const [isExpanded, setIsExpanded] = useNodeExpanded();

    const handleUpdate = (update: Partial<MessageTriggerNodeData>) => {
        updateNodeData(id, update);
    };

    const onTypeChange = (newType: string) => {
        handleUpdate({
            type: newType as MessageTriggerValueTypes,
            filter: "any",
        });
    };

    const onFilterChange = (newFilter: string) => {
        handleUpdate({ filter: newFilter });
    };

    const { filtersForType, isNodeConfigured } = useMemo(() => {
        const filters = getFiltersForType(data.type);

        const configured = data.type === "any" || (!!data.type && !!data.filter);

        return {
            filtersForType: filters,
            isNodeConfigured: configured,
        };
    }, [data.type, data.filter]);

    const showFilterSection =
        data.type && data.type !== "any"

    // Get available state types based on message type
    const availableStateTypes = useMemo(() => {
        return getStateTypesForMessageTrigger(data.type);
    }, [data.type]);

    return (
        <Card
            className={`w-80 rounded-lg shadow-xl border-2 ${selected ? "border-sky-500/80" : "border-gray-600/50"
                }`}
        >
            <TargetHandles />
            <ElseMessageSource />

            <TriggerHeader
                icon={<Settings className="h-4 w-4 text-blue-400 flex-shrink-0" />}
                title="Xabar Handleri"
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

                    <Label className="mt-2">
                        <Checkbox
                            checked={data.global}
                            onCheckedChange={(e) =>
                                handleUpdate({
                                    ...data,
                                    global: e as boolean,
                                })
                            }
                        />
                        Global
                    </Label>

                    {/* State Configuration */}
                    {data.type && (
                        <StateConfigUI
                            state={data.state}
                            onStateChange={(state) => handleUpdate({ state })}
                            availableTypes={availableStateTypes}
                            nodeId={id}
                        />
                    )}
                </CardContent>
            )}

            <SourceHandles />
        </Card>
    );
};

export const MessageTriggerNode = memo(MessageTriggerNodeComponent);