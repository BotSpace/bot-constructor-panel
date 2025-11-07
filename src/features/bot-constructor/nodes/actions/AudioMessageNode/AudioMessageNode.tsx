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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendAudioNodeData, RecipientType, AudioSourceType } from "./types";

import { FiMusic } from "react-icons/fi";

// Bizning andozamiz uchun yangi importlar
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandler, TargetHandler } from "../../components";

const SendAudioNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendAudioNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendAudioNodeData>) => {
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
        icon={<FiMusic className="text-primary" />}
        title="Audio yuborish"
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

            {/* Audio manbasi */}
            <div className="grid gap-2">
              <Label>Audio manbasi</Label>
              <Select
                value={data.audioSourceType}
                onValueChange={(value: AudioSourceType) =>
                  handleUpdate({ audioSourceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {data.audioSourceType === "file_id" && (
                <Input
                  placeholder="audio_fayl_idsi..."
                  value={data.audioFileId || ""}
                  onChange={(e) =>
                    handleUpdate({ audioFileId: e.target.value })
                  }
                />
              )}
              {data.audioSourceType === "url" && (
                <Input
                  placeholder="https://example.com/audio.mp3"
                  value={data.audioUrl || ""}
                  onChange={(e) => handleUpdate({ audioUrl: e.target.value })}
                />
              )}
            </div>

            {/* Audio metadatalari */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Ijrochi</Label>
                <Input
                  placeholder="Masalan, Yulduz U."
                  value={data.performer || ""}
                  onChange={(e) => handleUpdate({ performer: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Sarlavha</Label>
                <Input
                  placeholder="Masalan, Xasta bo'lma"
                  value={data.title || ""}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                />
              </div>
            </div>

            {/* Caption */}
            <div className="grid gap-2">
              <Label>Izoh (Caption)</Label>
              <TextareaAutosize
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Audio uchun izoh..."
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

            <NodeFooter
              nodeId={id}
              keyboard={data.keyboard}
              disableNotification={data.disableNotification}
              protectContent={data.protectContent}
              onUpdate={handleUpdate}
            />
          </CardContent>
        </>
      )}

      <SourceHandler />
    </Card>
  );
};

export const SendAudioNode = memo(SendAudioNodeComponent);
