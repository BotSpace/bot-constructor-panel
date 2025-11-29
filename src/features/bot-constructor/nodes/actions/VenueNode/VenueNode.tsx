"use client";

import { useState, memo } from "react";
import { NodeProps } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandles, TargetHandles } from "../../components";

interface VenueNodeData {
  latitude?: number;
  longitude?: number;
  title?: string;
  address?: string;
  foursquareId?: string;
  foursquareType?: string;
  disableNotification?: boolean;
}

const VenueNodeInternal = ({
  id,
  data,
  selected,
}: NodeProps<VenueNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<VenueNodeData>) => {
    updateNodeData(id, update);
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="📍"
        title="Joy yuborish (Venue)"
        nodeId={id}
        color="bg-red-500/10"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Kenglik (Latitude)</Label>
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
              <Label>Uzunlik (Longitude)</Label>
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
            <Label>Joy nomi *</Label>
            <Input
              placeholder="Masalan: Toshkent Markaz"
              value={data.title || ""}
              onChange={(e) => handleUpdate({ title: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Manzil *</Label>
            <Input
              placeholder="Amir Temur ko'chasi 1"
              value={data.address || ""}
              onChange={(e) => handleUpdate({ address: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Foursquare ID (ixtiyoriy)</Label>
            <Input
              placeholder="4bf58dd8d48988d1e5931735"
              value={data.foursquareId || ""}
              onChange={(e) => handleUpdate({ foursquareId: e.target.value })}
            />
          </div>
        </CardContent>
      )}

      <NodeFooter nodeId={id} />
      <SourceHandles />
    </Card>
  );
};

export const SendVenueNode = memo(VenueNodeInternal);
