"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SubFlowExitNodeData } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const SubFlowExitNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SubFlowExitNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  return (
    <Card
      className={cn(
        "w-72 shadow-lg border-emerald-500/30",
        selected && "ring-2 ring-primary"
      )}
    >
      <TargetHandles />
      <NodeHeader
        icon="🚪"
        title={`Chiqish: ${data.exitName || "default"}`}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-3 pt-4">
          <div className="flex flex-col gap-2">
            <Label>Chiqish nomi</Label>
            <Input
              placeholder="success"
              value={data.exitName || ""}
              onChange={(e) => updateNodeData(id, { exitName: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              SubFlow tugagandan keyin qaysi chiqish orqali davom etiladi
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export const SubFlowExitNode = memo(SubFlowExitNodeComponent);
