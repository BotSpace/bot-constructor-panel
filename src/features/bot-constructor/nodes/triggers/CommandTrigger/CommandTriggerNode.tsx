// FAYL: constructor/nodes/triggers/CommandTrigger/CommandTriggerNode.tsx

import { memo, useState, useMemo } from "react";
import { NodeProps } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { CommandTriggerNodeData } from "./types";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Command } from "lucide-react";

import { SourceHandles, TargetHandles } from "../../components";
import { TriggerHeader } from "../shared/TriggerHeader";
import { StateConfigUI, getStateTypesForCommandTrigger } from "../shared";

const CommandTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CommandTriggerNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleUpdate = (update: Partial<CommandTriggerNodeData>) => {
    updateNodeData(id, update);
  };

  // Node sozlangaligini tekshirish (buyruq matni kiritilgan bo'lishi kerak)
  const isConfigured = !!data.command?.trim();

  const availableStateTypes = useMemo(() => {
    return getStateTypesForCommandTrigger();
  }, []);

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />

      <TriggerHeader
        icon={<Command className="h-4 w-4 text-blue-400 flex-shrink-0" />}
        title="Command Handler"
        isExpanded={isExpanded}
        isConfigured={isConfigured}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {isExpanded && (
        <CardContent className="flex flex-col gap-4">
        {/* Buyruq kiritish maydoni */}
        <div>
          <Label
            htmlFor={`command-input-${id}`}
            className="text-xs text-muted-foreground"
          >
            Buyruq matni (masalan, "start")
          </Label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">/</span>
            </div>
            <Input
              id={`command-input-${id}`}
              placeholder="start"
              value={data.command || ""}
              onChange={(e) => handleUpdate({ command: e.target.value.trim() })}
              className="pl-7" // "/" belgisi uchun joy
            />
          </div>
        </div>

        {/* Qo'shimcha argumentlarni ushlash uchun checkbox */}
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
            Argumentlarni ushlash (deep linking)
          </Label>
        </div>

        <Label className="mt-2">
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

        {/* State Configuration */}
        <StateConfigUI
          state={data.state}
          onStateChange={(state) => handleUpdate({ state })}
          availableTypes={availableStateTypes}
          nodeId={id}
        />
      </CardContent>
      )}

      <SourceHandles />
    </Card>
  );
};

export const CommandTriggerNode = memo(CommandTriggerNodeComponent);
