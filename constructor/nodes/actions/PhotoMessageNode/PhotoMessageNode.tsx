"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiCamera, FiChevronUp, FiChevronDown } from "react-icons/fi";
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
import { useFlowStore } from "@/constructor/store/flowStore";
import { SendPhotoNodeData, RecipientType, PhotoSourceType } from "./types";

const SendPhotoNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendPhotoNodeData>) => {
  // 1. Global store'dan `updateNodeData`'ni olamiz
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  // 2. Faqat UI uchun `useState`
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 3. Markazlashgan yangilash funksiyasi
  const handleUpdate = (update: Partial<SendPhotoNodeData>) => {
    updateNodeData(id, update);
  };

  const captionLength = data.caption?.length || 0;

  return (
    <>
      <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
        {/* Kirish nuqtasi (Target) tepada */}
        <Handle type="target" position={Position.Top} className="!bg-sky-500" />

        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FiCamera className="text-primary" />
            Rasm Yuborish
          </CardTitle>
          <div className="text-muted-foreground">
            {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
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
                  // 4. `value`'ni `data`dan olamiz
                  value={data.recipientType}
                  // 5. O'zgarishni `handleUpdate` orqali jo'natamiz
                  onValueChange={(value: RecipientType) =>
                    value && handleUpdate({ recipientType: value })
                  }
                  className="w-full grid grid-cols-2"
                >
                  <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                  <ToggleGroupItem value="custom_id">
                    ID bo'yicha
                  </ToggleGroupItem>
                </ToggleGroup>
                {data.recipientType === "custom_id" && (
                  <Input
                    placeholder="Chat yoki foydalanuvchi ID"
                    value={data.chatId || ""}
                    onChange={(e) => handleUpdate({ chatId: e.target.value })}
                  />
                )}
              </div>

              {/* Rasm manbasi */}
              <div className="grid gap-2">
                <Label>Rasm manbasi</Label>
                <Select
                  value={data.photoSourceType}
                  onValueChange={(value: PhotoSourceType) =>
                    handleUpdate({ photoSourceType: value })
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

              <div className="border-t border-border pt-4 mt-2"></div>
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

        {/* Chiqish nuqtasi (Source) pastda */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-teal-500"
        />
      </Card>
    </>
  );
};

// 6. Komponentni `memo` bilan o'rab eksport qilamiz
export const SendPhotoNode = memo(SendPhotoNodeComponent);
