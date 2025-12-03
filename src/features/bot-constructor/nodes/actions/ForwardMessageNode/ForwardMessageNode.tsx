"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandles, TargetHandles } from "../../components";
import { RecipientsManager } from "../shared/RecipientSelector";
import { useFlowStore } from "@/features/bot-constructor/store";

interface ForwardMessageNodeData {
  recipients?: {
    additionalIds: string[];
  };
}

const ForwardMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<ForwardMessageNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // Ma'lumotlarni global store'da yangilash uchun markaziy funksiya
  const handleUpdate = (update: Partial<ForwardMessageNodeData>) => {
    updateNodeData(id, update);
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />

      <NodeHeader icon="➡️" title="Xabarni uzatish" />

      <CardContent className="flex flex-col gap-4">
        {/* Qabul qiluvchilar */}
        <RecipientsManager
          recipients={data.recipients}
          onUpdate={handleUpdate}
          hideSendToSender={true}
        />
      </CardContent>

      <NodeFooter nodeId={id} />
      <SourceHandles />
    </Card>
  );
};

export const ForwardMessageNode = memo(ForwardMessageNodeComponent);
