"use client";

import { NodeProps } from "reactflow";

import { SendTextMessageNodeData } from "./types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { memo, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LetterText, ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";

import { NodeHeader } from "../shared/NodeHeader";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandles, TargetHandles } from "../../components";
import { SelectedMessageTarget } from "../../components/shared/ReactFlowHandles/SelectedMessageTarget";
import { DynamicMessageConstructor } from "./components/dynamic-message-constructor-modal";
import { Button } from "@/components/ui/button";

import TelegramEditor from "@/features/bot-constructor/components/RichTextEditor/editor/TelegramEditor";
import { ButtonGenerator } from "@/features/bot-constructor/components/ButtonGenerator/ButtonGenerator";
import ActionNodeSettings from "../shared/ActionNodeSettings";

const SendTextMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendTextMessageNodeData>) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

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
      <TargetHandles />
      <SelectedMessageTarget />

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
            <ActionNodeSettings
              notificationDisabled={data.disableNotification}
              contentProtected={data.protectContent}
              parseMode={data.parseMode}
              handleUpdate={handleUpdate}
            />
          </CardContent>

          <CardFooter>
            <ButtonGenerator
              initialKeyboard={data.keyboard}
              data={data}
              node_id={id}
            />
          </CardFooter>
        </>
      )}
      <SourceHandles />
    </Card>
  );
};

export const SendTextMessageNode = memo(SendTextMessageNodeComponent);
