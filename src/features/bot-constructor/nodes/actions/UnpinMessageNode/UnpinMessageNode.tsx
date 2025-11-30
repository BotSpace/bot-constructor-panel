"use client";

import { NodeProps } from "reactflow";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface UnpinMessageNodeData {
  messageId?: number;
  unpinAll?: boolean;
}

const UnpinMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<UnpinMessageNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<UnpinMessageNodeData>) => {
    updateNodeData(id, update);
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="📌"
        title="Qadalni olib tashlash"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between">
            <Label>Barcha qadalgan xabarlarni olib tashlash</Label>
            <Switch
              checked={data.unpinAll || false}
              onCheckedChange={(checked) => handleUpdate({ unpinAll: checked })}
            />
          </div>

          {!data.unpinAll && (
            <div className="flex flex-col gap-2">
              <Label>Xabar ID (ixtiyoriy)</Label>
              <Input
                type="number"
                placeholder="Oxirgi qadalgan xabar"
                value={data.messageId || ""}
                onChange={(e) =>
                  handleUpdate({ messageId: parseInt(e.target.value) })
                }
              />
              <p className="text-xs text-muted-foreground">
                Bo'sh qoldirilsa, oxirgi qadalgan xabar olib tashlanadi
              </p>
            </div>
          )}
        </CardContent>
      )}

      <NodeFooter nodeId={id} />
      <SourceHandles />
    </Card>
  );
};

export const UnpinMessageNode = memo(UnpinMessageNodeComponent);
