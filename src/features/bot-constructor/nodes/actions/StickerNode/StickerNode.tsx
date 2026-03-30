"use client";

import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { NodeProps } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";

import { HandlerData } from "../TextMessageNode/types";

interface StickerNodeData {
  stickerSourceType?: "file_id" | "url";
  stickerFileId?: string;
  stickerUrl?: string;
  disableNotification?: boolean;
  handlers?: HandlerData[];
}

const StickerNodeInternal = ({
  id,
  data,
  selected,
}: NodeProps<StickerNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<StickerNodeData>) => {
    updateNodeData(id, update);
  };

  const sourceType = data.stickerSourceType || "file_id";

  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="🎭"
        title="Sticker yuborish"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label>Sticker manbai</Label>
            <Select
              value={sourceType}
              onValueChange={(value: "file_id" | "url") =>
                handleUpdate({ stickerSourceType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Manba turini tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file_id">File ID</SelectItem>
                <SelectItem value="url">URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sourceType === "file_id" ? (
            <div className="flex flex-col gap-2">
              <Label>Sticker File ID</Label>
              <Input
                placeholder="CAACAgIAAxkBAAIC..."
                value={data.stickerFileId || ""}
                onChange={(e) =>
                  handleUpdate({ stickerFileId: e.target.value })
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label>Sticker URL</Label>
              <Input
                placeholder="https://example.com/sticker.webp"
                value={data.stickerUrl || ""}
                onChange={(e) => handleUpdate({ stickerUrl: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      )}

      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const SendStickerNode = memo(StickerNodeInternal);
