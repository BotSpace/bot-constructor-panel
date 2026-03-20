"use client";

import { NodeProps, Position } from "reactflow";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { ForLoopNodeData } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ForLoopNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<ForLoopNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<ForLoopNodeData>) => {
    updateNodeData(id, update);
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="🔁"
        title="For Loop"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>Ro'yxat (dataKey)</Label>
            <Input
              placeholder="{{users}} yoki {{items}}"
              value={data.dataKey || ""}
              onChange={(e) => handleUpdate({ dataKey: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Aylanib chiqiladigan ro'yxat o'zgaruvchisi
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Element o'zgaruvchisi (itemVariable)</Label>
            <Input
              placeholder="item"
              value={data.itemVariable || ""}
              onChange={(e) => handleUpdate({ itemVariable: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Har bir elementga beriluvchi nom (masalan: item, user)
            </p>
          </div>

          <div className="text-xs bg-muted p-3 rounded-md flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              <span><b>loop-body</b> — har bir element uchun</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-400 inline-block" />
              <span><b>no-items</b> — ro'yxat bo'sh bo'lsa</span>
            </div>
          </div>
        </CardContent>
      )}

      {/* loop-body handle — yuqori (har bir element) */}
      <SourceHandles
        className="!bg-green-500 translate-y-[-75%]"
        id="loop-body"
        position={Position.Right}
      />

      {/* no-items handle — pastki (ro'yxat bo'sh) */}
      <SourceHandles
        className="!bg-orange-400 translate-y-[75%]"
        id="no-items"
        position={Position.Right}
      />
    </Card>
  );
};

export const ForLoopNode = memo(ForLoopNodeComponent);
