"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { HandlerData } from "../TextMessageNode/types";

interface ChatActionNodeData {
  action?: string;
  handlers?: HandlerData[];
}

const ChatActionNodeInternal = ({
  id,
  data,
  selected,
}: NodeProps<ChatActionNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<ChatActionNodeData>) => {
    updateNodeData(id, update);
  };

  const chatActions = [
    { value: "typing", label: "Yozmoqda..." },
    { value: "upload_photo", label: "Rasm yuklanmoqda..." },
    { value: "upload_video", label: "Video yuklanmoqda..." },
    { value: "upload_voice", label: "Ovozli xabar yuklanmoqda..." },
    { value: "upload_document", label: "Hujjat yuklanmoqda..." },
    { value: "find_location", label: "Joylashuv aniqlanmoqda..." },
    { value: "record_video", label: "Video yozilmoqda..." },
    { value: "record_voice", label: "Ovoz yozilmoqda..." },
  ];

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="⌨️"
        title="Harakat ko'rsatish"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>Harakat turi</Label>
            <Select
              value={data.action || "typing"}
              onValueChange={(value) => handleUpdate({ action: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Harakat turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                {chatActions.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Bot hozir nimalar bilan band ekanligini ko'rsatadi (5 soniya davom
              etadi)
            </p>
          </div>
        </CardContent>
      )}

      <SourceHandles />
    </Card>
  );
};

export const ChatActionNode = memo(ChatActionNodeInternal);
