"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
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
import { SendPhotoNodeData, PhotoSourceType } from "./types";

// Yaratgan andozamiz uchun kerakli importlar
import { Camera } from "lucide-react";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandler, TargetHandler } from "../../components";

const SendPhotoNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendPhotoNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendPhotoNodeData>) => {
    updateNodeData(id, update);
  };

  const captionLength = data.caption?.length || 0;
  const buttonCount =
    (data.keyboard?.active === "inline"
      ? data.keyboard?.inline
      : data.keyboard?.reply
    )?.flat().length || 0;

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <NodeHeader
        icon={<Camera className="text-primary" />}
        title="Rasm Yuborish"
        buttonCount={buttonCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <>
          <CardContent className="flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <RecipientsManager
              recipients={data.recipients}
              onUpdate={handleUpdate}
            />

            {/* Rasm manbasi */}
            <div className="flex flex-col gap-2">
              <Label>Rasm manbasi</Label>

              <div className="">
                <Select
                  value={data.photoSourceType}
                  onValueChange={(value: PhotoSourceType) =>
                    handleUpdate({ photoSourceType: value })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Manbani tanlang..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="file_id">Mavjud File ID</SelectItem>
                    <SelectItem value="url">Internet (URL)</SelectItem>
                    <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {data.photoSourceType === "file_id" && (
                <Input
                  placeholder="rasm_fayl_idsi_bu_yerda..."
                  value={data.photoFileId || ""}
                  onChange={(e) =>
                    handleUpdate({ photoFileId: e.target.value })
                  }
                />
              )}
              {data.photoSourceType === "url" && (
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={data.photoUrl || ""}
                  onChange={(e) => handleUpdate({ photoUrl: e.target.value })}
                />
              )}
            </div>

            {/* Rasm matni (Caption) */}
            <div className="grid gap-2">
              <Label>Rasm matni (Caption)</Label>
              <TextareaAutosize
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Rasm uchun matn kiriting..."
                value={data.caption || ""}
                onChange={(e) => handleUpdate({ caption: e.target.value })}
                maxLength={1024}
              />
              <div
                className={cn(
                  "text-right text-xs",
                  captionLength > 1024
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {captionLength}/1024
              </div>
            </div>
          </CardContent>

          <NodeFooter
            nodeId={id}
            keyboard={data.keyboard}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
        </>
      )}

      <SourceHandler />
    </Card>
  );
};

export const SendPhotoNode = memo(SendPhotoNodeComponent);
