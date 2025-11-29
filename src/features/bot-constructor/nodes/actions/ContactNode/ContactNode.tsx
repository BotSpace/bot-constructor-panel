"use client";

import { NodeProps } from "reactflow";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendContactNodeData } from "./types";
import { RecipientsManager } from "../shared/RecipientSelector";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ContactNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendContactNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendContactNodeData>) => {
    updateNodeData(id, update);
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="👤"
        title="Kontakt"
        nodeId={id}
        color="bg-indigo-500/10"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <RecipientsManager
            recipients={data.recipients}
            onUpdate={handleUpdate}
          />

          <div className="flex flex-col gap-2">
            <Label>Telefon raqam</Label>
            <Input
              placeholder="+998901234567"
              value={data.phoneNumber || ""}
              onChange={(e) => handleUpdate({ phoneNumber: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ism</Label>
            <Input
              placeholder="Alisher"
              value={data.firstName || ""}
              onChange={(e) => handleUpdate({ firstName: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Familiya (ixtiyoriy)</Label>
            <Input
              placeholder="Navoiy"
              value={data.lastName || ""}
              onChange={(e) => handleUpdate({ lastName: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>VCard (ixtiyoriy)</Label>
            <Textarea
              placeholder="BEGIN:VCARD&#10;VERSION:3.0&#10;..."
              value={data.vcard || ""}
              onChange={(e) => handleUpdate({ vcard: e.target.value })}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Qo'shimcha kontakt ma'lumotlari uchun VCard format
            </p>
          </div>
        </CardContent>
      )}

      <NodeFooter nodeId={id} />
      <SourceHandles />
    </Card>
  );
};

export const SendContactNode = memo(ContactNodeComponent);
