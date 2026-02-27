"use client";

import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { NodeProps } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";

import { HandlerData } from "../TextMessageNode/types";

interface DiceNodeData {
  emoji?: string;
  disableNotification?: boolean;
  handlers?: HandlerData[];
}

const DiceNodeInternal = ({ id, data, selected }: NodeProps<DiceNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<DiceNodeData>) => {
    updateNodeData(id, update);
  };

  const diceTypes = [
    { value: "🎲", label: "🎲 Kub (1-6)" },
    { value: "🎯", label: "🎯 Darts (1-6)" },
    { value: "🏀", label: "🏀 Basketbol (1-5)" },
    { value: "⚽", label: "⚽ Futbol (1-5)" },
    { value: "🎳", label: "🎳 Bouling (1-6)" },
    { value: "🎰", label: "🎰 Slot mashina (1-64)" },
  ];

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="🎲"
        title="O'yin yuborish"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>O'yin turi</Label>
            <Select
              value={data.emoji || "🎲"}
              onValueChange={(value) => handleUpdate({ emoji: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="O'yin turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                {diceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Animatsiyali o'yin yuboradi. Natija tasodifiy bo'ladi.
            </p>
          </div>
        </CardContent>
      )}

      <SourceHandles />
    </Card>
  );
};

export const SendDiceNode = memo(DiceNodeInternal);
