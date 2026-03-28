"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { DelayNodeData } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const DelayNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<DelayNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<DelayNodeData>) => {
    updateNodeData(id, update);
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="⏱️"
        title="Kutish"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>Kutish vaqti (soniya)</Label>
            <Input
              type="number"
              min="1"
              max="300"
              placeholder="5"
              value={data.seconds || ""}
              onChange={(e) =>
                handleUpdate({ seconds: parseInt(e.target.value) || 1 })
              }
            />
            <p className="text-xs text-muted-foreground">
              Maksimal: 300 soniya (5 daqiqa)
            </p>
          </div>

          {data.seconds && (
            <div className="text-sm bg-muted p-3 rounded-md">
              <p className="font-medium mb-1">Kutish:</p>
              <p className="text-muted-foreground">
                {data.seconds} soniya ({Math.floor(data.seconds / 60)} daqiqa{" "}
                {data.seconds % 60} soniya)
              </p>
            </div>
          )}
        </CardContent>
      )}

      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const DelayNode = memo(DelayNodeComponent);
