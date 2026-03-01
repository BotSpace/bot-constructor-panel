"use client";

import { NodeProps } from "reactflow";

import { SendTextMessageNodeData } from "./types";
import { useFlowStore } from "@/features/bot-constructor/store";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LetterText, ListPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";

import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { SelectedMessageTarget } from "../../components/shared/ReactFlowHandles/SelectedMessageTarget";
import { DynamicMessageConstructor } from "./components/dynamic-message-constructor-modal";
import { Button } from "@/components/ui/button";

import TextArea from "../shared/text-area";
import { ActionPanel } from "../../components/shared/ActionPanel";

const SendTextMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendTextMessageNodeData>) => {
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
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
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary relative")}>
      <TargetHandles />
      {/* <SelectedMessageTarget /> */}

      <NodeHeader
        icon={<LetterText className="text-primary" />}
        title="Xabar yuborish"
        buttonCount={buttonCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      {!isCollapsed && (
        <>
          <CardContent className="grid gap-2">
            {/* Xabar matni */}
            <div className="flex justify-between items-center">
              <Label>Xabar matni</Label>

              <DynamicMessageConstructor
                handleUpdate={handleUpdate}
                initialDynamicMessages={data.dynamicMessages}
                id={id}
              >
                <Button size={"icon-sm"} variant={"outline"}>
                  <ListPlus />
                </Button>
              </DynamicMessageConstructor>
            </div>
            <TextArea
              placeholder="Xabar matni..."
              defaultValue={data.messageText}
              onChange={(e) => handleUpdate({ messageText: e })}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-2">
            <ActionPanel keyboard={data.keyboard} disableNotification={data.disableNotification} parseMode={data.parseMode} protectContent={data.protectContent} id={id} recipients={data.recipients} />
          </CardFooter>
        </>
      )}

      {/* Handler list */}

      <SourceHandles />
    </Card>
  );
};

export const SendTextMessageNode = memo(SendTextMessageNodeComponent);
