"use client";

import { NodeProps } from "reactflow";
import { memo, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandles, TargetHandles } from "../../components";
import { Plus, X } from "lucide-react";

interface ForwardMessageNodeData {
  recipientIds?: string[];
}

const ForwardMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<ForwardMessageNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const recipientIds = data.recipientIds || [""];
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const previousLengthRef = useRef(recipientIds.length);

  const handleUpdate = (update: Partial<ForwardMessageNodeData>) => {
    updateNodeData(id, update);
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipientIds = [...recipientIds];
    newRecipientIds[index] = value;
    handleUpdate({ recipientIds: newRecipientIds });
  };

  const handleAddRecipient = () => {
    handleUpdate({ recipientIds: [...recipientIds, ""] });
  };

  // Yangi input qo'shilganda unga focus qilish
  useEffect(() => {
    if (recipientIds.length > previousLengthRef.current) {
      // Yangi input qo'shilgan
      const lastIndex = recipientIds.length - 1;
      setTimeout(() => {
        inputRefs.current[lastIndex]?.focus();
      }, 0);
    }
    previousLengthRef.current = recipientIds.length;
  }, [recipientIds.length]);

  const handleRemoveRecipient = (index: number) => {
    if (recipientIds.length > 1) {
      const newRecipientIds = recipientIds.filter((_, i) => i !== index);
      handleUpdate({ recipientIds: newRecipientIds });
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddRecipient();
    }
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />

      <NodeHeader icon="➡️" title="Xabarni uzatish" />

      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label>Qabul qiluvchilar</Label>
          <div className="flex flex-col gap-2">
            {recipientIds.map((recipientId, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  placeholder="User/Chat ID"
                  value={recipientId}
                  onChange={(e) => handleRecipientChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="flex-1"
                />
                {recipientIds.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRecipient(index)}
                    className="h-9 w-9 shrink-0"
                    title="O'chirish"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddRecipient}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yangi qabul qiluvchi qo'shish
            </Button>
          </div>
        </div>
      </CardContent>

      <NodeFooter nodeId={id} />
      <SourceHandles />
    </Card>
  );
};

export const ForwardMessageNode = memo(ForwardMessageNodeComponent);
