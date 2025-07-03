"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiMusic, FiChevronDown } from "react-icons/fi";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendAudioNodeData, RecipientType, AudioSourceType } from "./types";
import { ChevronDown } from "lucide-react";

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

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiMusic className="text-primary" />
          Audio Yuborish
        </CardTitle>
        <div className="text-muted-foreground">
          {isCollapsed ? (
            <ChevronDown />
          ) : (
            <ChevronDown className="rotate-180" />
          )}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <div className="grid gap-2">
              <Label>Qabul qiluvchi</Label>
              <ToggleGroup
                type="single"
                value={data.recipientType}
                onValueChange={(value: RecipientType) =>
                  value && handleUpdate({ recipientType: value })
                }
                className="w-full grid grid-cols-2"
              >
                <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                <ToggleGroupItem value="custom_id">ID bo'yicha</ToggleGroupItem>
              </ToggleGroup>
              {data.recipientType === "custom_id" && (
                <Input
                  placeholder="Chat yoki foydalanuvchi ID"
                  value={data.chatId || ""}
                  onChange={(e) => handleUpdate({ chatId: e.target.value })}
                />
              )}
            </div>

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

            {/* Qo'shimcha sozlamalar */}
            <div className="flex items-center justify-between">
              <Label htmlFor={`custom-thumb-${id}`} className="cursor-pointer">
                Maxsus muqova
              </Label>
              <Switch
                id={`custom-thumb-${id}`}
                checked={!!data.hasCustomThumbnail}
                onCheckedChange={(checked) =>
                  handleUpdate({ hasCustomThumbnail: checked })
                }
              />
            </div>
            {data.hasCustomThumbnail && (
              <Input
                placeholder="Muqova uchun File ID"
                value={data.thumbnailFileId || ""}
                onChange={(e) =>
                  handleUpdate({ thumbnailFileId: e.target.value })
                }
                className="animate-in fade-in-50"
              />
            )}
          </CardContent>

          <CardFooter className="flex justify-around">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`disable-notification-${id}`}
                checked={!!data.disableNotification}
                onCheckedChange={(checked) =>
                  handleUpdate({ disableNotification: !!checked })
                }
              />
              <Label
                htmlFor={`disable-notification-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Ovozsiz
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`protect-content-${id}`}
                checked={!!data.protectContent}
                onCheckedChange={(checked) =>
                  handleUpdate({ protectContent: !!checked })
                }
              />
              <Label
                htmlFor={`protect-content-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Himoyalangan
              </Label>
            </div>
          </CardFooter>
        </>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const SendAudioNode = memo(SendAudioNodeComponent);
