import React, { FC, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiMusic, FiChevronUp, FiChevronDown } from "react-icons/fi";

// shadcn/ui komponentlari
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
import { cn } from "@/lib/utils";

// TypeScript Tiplari
type RecipientType = "sender" | "custom_id";
type AudioSourceType = "file_id" | "url" | "upload";

interface SendAudioNodeData {
  recipientType: RecipientType;
  chatId: string;
  audioSourceType: AudioSourceType;
  audioFileId: string;
  audioUrl: string;
  duration: number | "";
  performer: string;
  title: string;
  caption: string;
  disableNotification: boolean;
  protectContent: boolean;
}

interface CustomNodeProps extends NodeProps {
  data: SendAudioNodeData;
}

export const SendAudioNode: FC<CustomNodeProps> = ({ id, data }) => {
  const [nodeData, setNodeData] = useState<SendAudioNodeData>(data);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDataChange = (field: keyof SendAudioNodeData, value: any) => {
    setNodeData((prev) => ({ ...prev, [field]: value }));
  };

  const captionLength = nodeData.caption?.length || 0;

  return (
    <Card className={cn("w-80 shadow-lg")}>
      {/* ===== YENGI QOIDA: CHIQISH (SOURCE) TEPADA ===== */}
      <Handle type="source" position={Position.Top} />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiMusic className="text-primary" />
          Audio Yuborish
        </CardTitle>
        <div className="text-muted-foreground">
          {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-4">
            {/* Qabul qiluvchi bo'limi */}
            <div className="grid gap-2">
              <Label>Qabul qiluvchi</Label>
              <ToggleGroup
                type="single"
                value={nodeData.recipientType}
                onValueChange={(value: RecipientType) =>
                  value && handleDataChange("recipientType", value)
                }
                className="w-full grid grid-cols-2"
              >
                <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                <ToggleGroupItem value="custom_id">ID bo'yicha</ToggleGroupItem>
              </ToggleGroup>
              {nodeData.recipientType === "custom_id" && (
                <Input
                  placeholder="Chat yoki foydalanuvchi ID"
                  value={nodeData.chatId}
                  onChange={(e) => handleDataChange("chatId", e.target.value)}
                />
              )}
            </div>

            {/* Audio manbasi bo'limi */}
            <div className="grid gap-2">
              <Label htmlFor={`audio-source-${id}`}>Audio manbasi</Label>
              <Select
                value={nodeData.audioSourceType}
                onValueChange={(value: AudioSourceType) =>
                  handleDataChange("audioSourceType", value)
                }
              >
                <SelectTrigger id={`audio-source-${id}`}>
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {nodeData.audioSourceType === "file_id" && (
                <Input
                  placeholder="audio_fayl_idsi..."
                  value={nodeData.audioFileId}
                  onChange={(e) =>
                    handleDataChange("audioFileId", e.target.value)
                  }
                />
              )}
              {nodeData.audioSourceType === "url" && (
                <Input
                  placeholder="https://example.com/audio.mp3"
                  value={nodeData.audioUrl}
                  onChange={(e) => handleDataChange("audioUrl", e.target.value)}
                />
              )}
            </div>

            {/* Audio metadatalari bo'limi */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor={`performer-${id}`}>Ijrochi</Label>
                <Input
                  id={`performer-${id}`}
                  placeholder="Masalan, Yulduz Usmonova"
                  value={nodeData.performer}
                  onChange={(e) =>
                    handleDataChange("performer", e.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`title-${id}`}>Sarlavha</Label>
                <Input
                  id={`title-${id}`}
                  placeholder="Masalan, Xasta bo'lma"
                  value={nodeData.title}
                  onChange={(e) => handleDataChange("title", e.target.value)}
                />
              </div>
            </div>

            {/* Izoh (Caption) bo'limi */}
            <div className="grid gap-2">
              <Label htmlFor={`caption-${id}`}>Izoh (Caption)</Label>
              <TextareaAutosize
                id={`caption-${id}`}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                minRows={2}
                maxRows={8}
                placeholder="Audio uchun izoh..."
                value={nodeData.caption}
                onChange={(e) => handleDataChange("caption", e.target.value)}
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

          <CardFooter className="flex justify-around">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`disable-notification-${id}`}
                checked={nodeData.disableNotification}
                onCheckedChange={(checked) =>
                  handleDataChange("disableNotification", checked)
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
                checked={nodeData.protectContent}
                onCheckedChange={(checked) =>
                  handleDataChange("protectContent", checked)
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

      {/* ===== YENGI QOIDA: KIRISH (TARGET) PASTDA ===== */}
      <Handle type="target" position={Position.Bottom} />
    </Card>
  );
};
