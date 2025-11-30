"use client";

import { NodeProps } from "reactflow";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendLocationNodeData } from "./types";
import { RecipientsManager } from "../shared/RecipientSelector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const LocationNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendLocationNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendLocationNodeData>) => {
    updateNodeData(id, update);
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="📍"
        title="Joylashuv"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <RecipientsManager
            recipients={data.recipients}
            onUpdate={handleUpdate}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="41.311151"
                value={data.latitude || ""}
                onChange={(e) =>
                  handleUpdate({ latitude: parseFloat(e.target.value) })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="69.279737"
                value={data.longitude || ""}
                onChange={(e) =>
                  handleUpdate({ longitude: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Jonli joylashuv (soniya, ixtiyoriy)</Label>
            <Input
              type="number"
              placeholder="3600"
              value={data.livePeriod || ""}
              onChange={(e) =>
                handleUpdate({ livePeriod: parseInt(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground">
              60-86400 oralig'ida. Joylashuv yangilanib turadi.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Yo'nalish (daraja, ixtiyoriy)</Label>
            <Input
              type="number"
              min="1"
              max="360"
              placeholder="90"
              value={data.heading || ""}
              onChange={(e) =>
                handleUpdate({ heading: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Aniqlik radiusi (metr, ixtiyoriy)</Label>
            <Input
              type="number"
              placeholder="100"
              value={data.horizontalAccuracy || ""}
              onChange={(e) =>
                handleUpdate({
                  horizontalAccuracy: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Yaqinlik ogohlantirish (metr, ixtiyoriy)</Label>
            <Input
              type="number"
              placeholder="500"
              value={data.proximityAlertRadius || ""}
              onChange={(e) =>
                handleUpdate({
                  proximityAlertRadius: parseInt(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Foydalanuvchi bu masofaga yaqinlashganda bildirishnoma
            </p>
          </div>
        </CardContent>
      )}

      <NodeFooter nodeId={id} />
      <SourceHandles />
    </Card>
  );
};

export const SendLocationNode = memo(LocationNodeComponent);
