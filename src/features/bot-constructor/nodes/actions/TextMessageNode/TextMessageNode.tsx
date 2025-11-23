"use client";

import { NodeProps } from "reactflow";

import { ParseMode, SendTextMessageNodeData } from "./types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LetterText, ListPlus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandler, TargetHandler } from "../../components";
import { EditMessageTarget } from "../../components/shared/ReactFlowHandlers/EditMessageTarget";
import { DynamicMessageConstructor } from "./components/dynamic-message-constructor-modal";
import { Button } from "@/components/ui/button";

import TelegramEditor from "@/features/bot-constructor/components/RichTextEditor/editor/TelegramEditor";

const SendTextMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendTextMessageNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Ma'lumotlarni global store'da yangilash uchun markaziy funksiya
  const handleUpdate = (update: Partial<SendTextMessageNodeData>) => {
    updateNodeData(id, update);
  };

  // Tugmalar sonini yangi `keyboard` strukturasidan hisoblaymiz
  const buttonCount =
    (data.keyboard?.active === "inline"
      ? data.keyboard?.inline
      : data.keyboard?.reply
    )?.flat().length || 0;
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />
      <EditMessageTarget />
      <NodeHeader
        icon={<LetterText className="text-primary" />}
        title="Xabar yuborish"
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

            {/* Xabar matni */}
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Xabar matni</Label>

                <DynamicMessageConstructor data={data} id={id}>
                  <Button size={"icon-sm"} variant={"outline"}>
                    <ListPlus />
                  </Button>
                </DynamicMessageConstructor>
              </div>

              <TelegramEditor
                initialData={data.messageText || undefined}
                onSave={(data) => handleUpdate({ messageText: data })}
                data={data}
              />
            </div>

            {/* Sozlamalar */}
            <div className="grid gap-3">
              <Label className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Sozlamalar
              </Label>
              <Select
                value={data.parseMode || "None"}
                onValueChange={(value: ParseMode) =>
                  handleUpdate({ parseMode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Parse Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">Oddiy matn</SelectItem>
                  <SelectItem value="HTML">HTML</SelectItem>
                  <SelectItem value="MarkdownV2">MarkdownV2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <NodeFooter
            nodeId={id}
            keyboard={data.keyboard}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            data={data}
            onUpdate={handleUpdate}
          />
        </>
      )}
      <SourceHandler />
    </Card>
  );
};

export const SendTextMessageNode = memo(SendTextMessageNodeComponent);
