"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiVideo, FiHelpCircle } from "react-icons/fi";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendVideoNodeData, RecipientType, VideoSourceType } from "./types";
import { ChevronDown } from "lucide-react";

// Andozamiz uchun yangi importlar
import { LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGenerator } from "@/constructor/components/ButtonGenerator";
import { ButtonConfig } from "@/constructor/components/ButtonGenerator";

const SendVideoNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendVideoNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<SendVideoNodeData>) => {
    updateNodeData(id, update);
  };

  const handleSaveButtons = (buttons: ButtonConfig[][]) => {
    updateNodeData(id, { buttons });
  };

  const captionLength = data.caption?.length || 0;
  const buttonCount = data.buttons?.flat().length || 0;

  return (
    <Card className={cn("w-96 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiVideo className="text-primary" />
          Video Yuborish
        </CardTitle>
        <div className="flex items-center gap-2">
          {/* Node yopiq bo'lganda ham tugmalar sonini ko'rsatish uchun */}
          {buttonCount > 0 && (
            <Badge variant="secondary" className="font-normal">
              <LayoutGrid className="w-3 h-3 mr-1" />
              {buttonCount}
            </Badge>
          )}
          <div className="text-muted-foreground">
            {isCollapsed ? (
              <ChevronDown />
            ) : (
              <ChevronDown className="rotate-180" />
            )}
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-5">
            {/* ...boshqa barcha form maydonlari o'zgarishsiz qoladi... */}
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

            {/* Video manbasi */}
            <div className="grid gap-2">
              <Label>Video manbasi</Label>
              <Select
                value={data.videoSourceType}
                onValueChange={(value: VideoSourceType) =>
                  handleUpdate({ videoSourceType: value })
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
              {data.videoSourceType === "file_id" && (
                <Input
                  placeholder="video_fayl_idsi..."
                  value={data.videoFileId || ""}
                  onChange={(e) =>
                    handleUpdate({ videoFileId: e.target.value })
                  }
                />
              )}
              {data.videoSourceType === "url" && (
                <Input
                  placeholder="https://example.com/video.mp4"
                  value={data.videoUrl || ""}
                  onChange={(e) => handleUpdate({ videoUrl: e.target.value })}
                />
              )}
            </div>

            {/* Video parametrlari */}
            <div className="grid gap-2">
              <Label>Video parametrlari (ixtiyoriy)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="text"
                  placeholder="Davomiyligi (s)"
                  value={data.duration || ""}
                  onChange={(e) => handleUpdate({ duration: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Eni (px)"
                  value={data.width || ""}
                  onChange={(e) => handleUpdate({ width: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Bo'yi (px)"
                  value={data.height || ""}
                  onChange={(e) => handleUpdate({ height: e.target.value })}
                />
              </div>
            </div>

            {/* Qo'shimcha sozlamalar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`custom-thumb-${id}`}
                  className="cursor-pointer"
                >
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
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`streaming-${id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Striming
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <FiHelpCircle className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Videoni to'liq yuklamasdan ko'rish.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Switch
                  id={`streaming-${id}`}
                  checked={!!data.supportsStreaming}
                  onCheckedChange={(checked) =>
                    handleUpdate({ supportsStreaming: checked })
                  }
                />
              </div>
            </div>

            {/* Caption */}
            <div className="grid gap-2">
              <Label>Video matni (Caption)</Label>
              <TextareaAutosize
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Video uchun matn kiriting..."
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

          <CardFooter className="flex flex-wrap justify-around gap-4 pt-4 border-t">
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

            {/* --- BUTTON GENERATOR INTEGRATSIYASI --- */}
            <ButtonGenerator
              initialButtons={data.buttons}
              onSave={handleSaveButtons}
            >
              <div className="relative">
                <Button variant="outline">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Buttons
                </Button>
                {buttonCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
                  >
                    {buttonCount}
                  </Badge>
                )}
              </div>
            </ButtonGenerator>
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

export const SendVideoNode = memo(SendVideoNodeComponent);
