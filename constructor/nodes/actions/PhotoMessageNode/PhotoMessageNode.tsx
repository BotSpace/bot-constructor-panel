"use client";

import { useState, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiCamera, FiChevronDown } from "react-icons/fi";
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

// Yaratgan andozamiz uchun kerakli importlar
import { LayoutGrid, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGenerator } from "@/constructor/components/ButtonGenerator";
import { ButtonConfig } from "@/constructor/components/ButtonGenerator";

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

  // ButtonGenerator'dan kelgan natijani saqlash uchun funksiya
  const handleSaveButtons = (buttons: ButtonConfig[][]) => {
    updateNodeData(id, { buttons });
  };

  const captionLength = data.caption?.length || 0;
  const buttonCount = data.buttons?.flat().length || 0;

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiCamera className="text-primary" />
          Rasm Yuborish
        </CardTitle>
        <div className="flex items-center gap-2">
          {/* Yopiq holatda tugmalar sonini ko'rsatuvchi Badge */}
          {buttonCount > 0 && (
            <Badge variant="secondary" className="font-normal">
              <LayoutGrid className="w-3 h-3 mr-1" />
              {buttonCount}
            </Badge>
          )}
          <div className="text-muted-foreground">
            {isCollapsed ? <FiChevronDown /> : <ChevronUp />}
          </div>
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
          </CardContent>

          {/* CHECKBOX VA TUGMALAR UCHUN FOOTER */}
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

export const SendPhotoNode = memo(SendPhotoNodeComponent);
