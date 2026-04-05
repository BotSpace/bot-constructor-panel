// FAYL: constructor/nodes/triggers/CommandTrigger/CommandTriggerNode.tsx

import { memo, useMemo } from "react";
import { NodeProps } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { CommandTriggerNodeData } from "./types";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { SourceHandles, TargetHandles } from "../../components";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { StateConfigUI, getStateTypesForCommandTrigger } from "../shared";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";

const CommandTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CommandTriggerNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<CommandTriggerNodeData>) => {
    updateNodeData(id, update);
  };

  const availableStateTypes = useMemo(() => {
    return getStateTypesForCommandTrigger();
  }, []);

  return (
    <Card className={cn("w-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />

      <NodeHeader
        icon="⌨️"
        title="Command"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        color="bg-blue-500"
      />
      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label
              htmlFor={`command-input-${id}`}
              className="text-xs text-muted-foreground"
            >
              Buyruq matni
            </Label>
            <div className="relative mt-1">
              <Input
                id={`command-input-${id}`}
                placeholder="/start"
                value={data.command || ""}
                onChange={(e) => handleUpdate({ command: e.target.value.trim() })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id={`with-args-${id}`}
              checked={!!data.withArgs}
              onCheckedChange={(checked) => handleUpdate({ withArgs: !!checked })}
            />
            <Label
              htmlFor={`with-args-${id}`}
              className="text-sm font-normal cursor-pointer"
            >
              Argumentlarni ushlash
            </Label>
          </div>

          <Label className="mt-2 flex items-center gap-2">
            <Checkbox
              checked={data.global}
              onCheckedChange={(e) =>
                handleUpdate({
                  global: e as boolean,
                })
              }
            />
            Global
          </Label>

          <StateConfigUI
            state={data.state}
            onStateChange={(state) => handleUpdate({ state })}
            availableTypes={availableStateTypes}
            nodeId={id}
          />
        </CardContent>
      )}

      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const CommandTriggerNode = memo(CommandTriggerNodeComponent);
